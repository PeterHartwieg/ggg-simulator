"""Restore the classic menu track and build its credits from audio/sources.json.

Usage: python tools/import-music.py (Python standard library only)
Existing audio is verified and reused. Only the selected ZIP member is downloaded.
"""
import hashlib
import html
import io
import json
from pathlib import Path
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent


class RemoteZip(io.RawIOBase):
    def __init__(self, url):
        self.url, self.position = url, 0
        with self.request("bytes=0-0") as response:
            self.size = int(response.headers["Content-Range"].split("/")[-1])

    def request(self, byte_range):
        response = urllib.request.urlopen(urllib.request.Request(self.url, headers={
            "Accept-Encoding": "identity", "Range": byte_range,
            "User-Agent": "GGGSimulator-MusicImport/1.0"}))
        if response.status != 206:
            response.close()
            raise ValueError("Source did not honor byte ranges; refusing to download the full archive")
        return response

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
        with self.request(f"bytes={self.position}-{end - 1}") as response:
            data = response.read()
        if len(data) != end - self.position:
            raise ValueError("Incomplete ZIP range response")
        self.position = end
        return data


def main():
    source = json.loads((ROOT / "audio/sources.json").read_text(encoding="utf-8"))
    target = ROOT / source["file"]
    if target.exists():
        data = target.read_bytes()
    else:
        with zipfile.ZipFile(RemoteZip(source["source"])) as archive:
            data = archive.read(source["archiveMember"])
    if hashlib.sha256(data).hexdigest() != source["sha256"]:
        raise ValueError("Track hash differs from the source catalog; file was not replaced")
    if not target.exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)

    escape = html.escape
    (ROOT / "audio/credits.html").write_text(
        '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        '<title>Music credits — Still Sane, Founder?</title><style>body{max-width:760px;margin:40px auto;padding:0 20px;'
        'background:#100d09;color:#d8ccb2;font:16px/1.6 Georgia,serif}a{color:#e5c686}code{overflow-wrap:anywhere}</style>'
        '<a href="../index.html">← Back to the simulator</a><h1>Music credits</h1><p><strong>'
        + escape(source["title"]) + '</strong> — ' + escape(source["artist"]) + ' (' + str(source["year"]) + '). '
        + escape(source["album"]) + ', published by Grinding Gear Games.</p>'
        '<p>This is an unofficial, non-commercial fan project. All music rights belong to their respective owners. '
        'No affiliation or endorsement is implied.</p>'
        + ''.join('<p>' + escape(note) + '</p>' for note in source["notes"])
        + '<p><a href="' + escape(source["sourcePage"]) + '">Community archive reference</a> · '
        '<a href="' + escape(source["source"]) + '">Source archive</a> · '
        '<a href="' + escape(source["referencePage"]) + '">Original menu music reference</a></p>'
        '<p>Archive member: <code>' + escape(source["archiveMember"]) + '</code></p>'
        '<p>Bundled file: <a href="menu.mp3">menu.mp3</a> · '
        'SHA-256: <code>' + source["sha256"] + '</code></p></html>\n', encoding="utf-8")
    print(f"Verified {source['title']} by {source['artist']} ({source['year']}), {len(data):,} bytes; rebuilt credits.")


if __name__ == "__main__":
    main()
