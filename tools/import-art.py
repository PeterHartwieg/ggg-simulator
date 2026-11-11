"""Rebuild bundled GGG artwork, historic pictures, manifest and credits from art/sources.json.

Assets of kind "photo" are historic pictures for the history cards. The "photos" map in the catalog
says which card each one belongs to. A photo whose source no longer downloads is skipped, not fatal.

Requires Python 3 and Pillow: python -m pip install Pillow
Run: python tools/import-art.py
Existing images are reused. To refetch an image, remove that individual file.
"""
import hashlib
import html
import http.client
import io
import json
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import urllib.request
import urllib.error
import zipfile

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "art/sources.json"


def request(url, **headers):
    return urllib.request.urlopen(urllib.request.Request(
        url, headers={"User-Agent": "GGGSimulator-ArtImport/1.0", **headers}))


def fetch(url, **headers):
    for attempt in range(3):
        try:
            with request(url, **headers) as response:
                if "Range" in headers and response.status != 206:
                    raise ValueError("Server did not honor a ZIP range request")
                return response.read()
        except urllib.error.HTTPError as error:
            if attempt == 2 or error.code not in (429, 500, 502, 503, 504):
                raise
            delay = int(error.headers.get("Retry-After", 30))
            print(f"Source returned {error.code}; retrying after {delay}s.", flush=True)
            time.sleep(delay)
        except (OSError, http.client.IncompleteRead):
            if attempt == 2:
                raise


class RemoteZip(io.RawIOBase):
    """Read selected public ZIP members using HTTP ranges, not the whole archive."""

    def __init__(self, url):
        self.url, self.position = url, 0
        with urllib.request.urlopen(urllib.request.Request(url, method="HEAD")) as response:
            self.size = int(response.headers["Content-Length"])

    def seekable(self):
        return True

    def tell(self):
        return self.position

    def seek(self, offset, whence=0):
        self.position = offset + (0 if whence == 0 else self.position if whence == 1 else self.size)
        return self.position

    def read(self, size=-1):
        end = self.size if size < 0 else min(self.size, self.position + size)
        if end <= self.position:
            return b""
        data = fetch(self.url, Range=f"bytes={self.position}-{end - 1}")
        if len(data) != end - self.position:
            raise ValueError("Incomplete ZIP range response")
        self.position = end
        return data


def main():
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    assets = catalog["assets"]
    archives = {}
    missing = set()

    def download(item):
        key, asset = item
        if asset["kind"] != "photo":
            return fetch_asset(key, asset)
        try:
            return fetch_asset(key, asset)
        except Exception as error:  # a dead link must not stop the rebuild
            missing.add(key)
            print(f"SKIPPED {key}: {error}", flush=True)

    def fetch_asset(key, asset):
        target = ROOT / asset["file"]
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            url = asset["source"]
            if asset.get("archiveMember"):
                if url not in archives:
                    archives[url] = zipfile.ZipFile(RemoteZip(url))
                data = archives[url].read(asset["archiveMember"])
            else:
                data = fetch(url)
            with Image.open(io.BytesIO(data)) as original:
                picture = ImageOps.exif_transpose(original)
                alpha = "A" in picture.getbands() or "transparency" in picture.info
                picture = picture.convert("RGBA" if alpha else "RGB")
                picture.thumbnail({"scene": (1920, 1200), "photo": (1100, 760)}.get(asset["kind"], (720, 520)))
                temporary = target.with_suffix(".tmp")
                picture.save(temporary, format="WEBP", quality=88, method=6)
                temporary.replace(target)
        with Image.open(target) as picture:
            picture.verify()
        asset["sha256"] = hashlib.sha256(target.read_bytes()).hexdigest()
        print(key, flush=True)

    try:
        with ThreadPoolExecutor(max_workers=2) as executor:
            list(executor.map(download, ((key, asset) for key, asset in assets.items() if not asset.get("archiveMember"))))
        for item in assets.items():
            if item[1].get("archiveMember"):
                download(item)
    finally:
        for archive in archives.values():
            archive.close()

    def file(key):
        return assets[key]["file"]

    manifest = {key: file(catalog[key]) for key in ("background", "title", "logo")}
    for group in ("images", "releaseLogos"):
        manifest[group] = {slot: file(key) for slot, key in catalog[group].items()}
    manifest["containImages"] = [slot for slot, key in catalog["images"].items() if assets[key]["kind"] == "logo"]

    # Historic pictures and their captions, by the card they belong to.
    photos = {slot: key for slot, key in catalog.get("photos", {}).items() if key in assets and key not in missing}
    manifest["photos"] = {slot: file(key) for slot, key in photos.items()}
    manifest["captions"] = {slot: assets[key]["caption"] for slot, key in photos.items() if assets[key].get("caption")}
    manifest["sources"] = {slot: assets[key]["sourcePage"] for slot, key in photos.items()}

    # Loading screens carry the loading-bar frame along the bottom; the page crops it.
    manifest["loadingScreens"] = [asset["file"] for asset in assets.values()
                                  if "loading screen" in asset["title"].lower()]

    # Logos with a transparent background are shown as they are; the rest get their dark backdrop blended away.
    def see_through(asset):
        with Image.open(ROOT / asset["file"]) as picture:
            rgba = picture.convert("RGBA")
            w, h = rgba.size
            return all(rgba.getpixel(p)[3] < 24 for p in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)))
    manifest["transparentLogos"] = [asset["file"] for asset in assets.values()
                                    if asset["kind"] == "logo" and see_through(asset)]
    (ROOT / "art/manifest.js").write_text(
        "/* Generated by tools/import-art.py from art/sources.json. Artwork and historic pictures; see art/credits.html. */\n"
        "window.GGG = window.GGG || {};\nwindow.GGG.artOverrides = "
        + json.dumps(manifest, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    escape = html.escape
    rows = []
    for key, asset in assets.items():
        if key in missing:
            continue
        slots = [slot for group in ("images", "releaseLogos", "photos") for slot, value in catalog.get(group, {}).items() if value == key]
        slots += [slot for slot in ("background", "title", "logo") if catalog[slot] == key]
        member = "<br>Archive member: " + escape(asset["archiveMember"]) if asset.get("archiveMember") else ""
        if asset["kind"] == "photo":
            creator = escape(asset["creator"])
            if asset.get("creatorUrl"):
                creator = '<a href="' + escape(asset["creatorUrl"]) + '">' + creator + '</a>'
            member += "<br>Credit: " + creator
            if asset.get("licence"):
                licence = escape(asset["licence"])
                if asset.get("licenceUrl"):
                    licence = '<a href="' + escape(asset["licenceUrl"]) + '">' + licence + '</a>'
                member += ", " + licence
            if asset.get("changes"):
                member += "<br>" + escape(asset["changes"])
        rows.append('<tr><td><a href="../' + escape(asset["file"]) + '">' + escape(asset["title"]) + '</a></td><td>'
                    + escape(", ".join(slots)) + '</td><td><a href="' + escape(asset["sourcePage"]) + '">Source page</a> · <a href="'
                    + escape(asset["source"]) + '">Original asset</a>' + member + '</td></tr>')
    (ROOT / "art/credits.html").write_text(
        '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        '<title>Artwork credits — Still Sane, Founder?</title><style>body{max-width:1100px;margin:40px auto;padding:0 20px;'
        'background:#100d09;color:#d8ccb2;font:16px/1.6 Georgia,serif}a{color:#e5c686}table{border-collapse:collapse;width:100%}'
        'th,td{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid #51412b;overflow-wrap:anywhere}'
        'td:nth-child(2){font:12px/1.6 monospace}th{color:#e5c686}</style><a href="../index.html">← Back to the simulator</a>'
        '<h1>Artwork credits</h1><p>' + escape(catalog["credit"]) + '</p>'
        + ''.join('<p>' + escape(note) + '</p>' for note in catalog["notes"])
        + '<p>Images are bundled locally as WebP; only resizing and compression are applied. '
        'The catalog records the original URLs, archive members, file hashes and slot mappings. '
        'Rebuild with <code>python tools/import-art.py</code> (requires Pillow).</p>'
        '<table><thead><tr><th>Picture</th><th>Used in</th><th>Provenance</th></tr></thead><tbody>'
        + ''.join(rows) + '</tbody></table></html>\n', encoding="utf-8")
    print(f"Imported {len(assets) - len(missing)} pictures and rebuilt manifest and credits."
          + (f" Skipped {len(missing)}: {', '.join(sorted(missing))}." if missing else ""))


if __name__ == "__main__":
    main()
