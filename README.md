# Still Sane, Founder?

An unofficial fan parody. You run the studio behind Path of Exile from the garage in 2006 to 2026. You ship 54 releases, answer the decisions the real studio faced, and see each launch compared with the real Steam peak.

Play it at [ggg-simulator.com](https://ggg-simulator.com).

Not affiliated with or endorsed by Grinding Gear Games.

## Run it locally

The game is plain HTML, CSS and JavaScript. There is no build step.

```bash
python -m http.server 8642 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8642`.

## Where things are

- `js/engine.js` holds the rules. It has no browser code, so it also runs under Node.
- `js/ui.js` draws the screen and handles input.
- `js/data/` holds the releases, events, subreddit posts, secrets and tuning numbers.
- `tools/sim.js` plays whole games and prints how each release went: `node tools/sim.js par`
- `tools/import-art.py` rebuilds the bundled pictures from `art/sources.json`. It needs Pillow.
- `worker/stats.js` records anonymous play statistics. `node tools/stats.js` prints them.

## Deploy

The site runs on Cloudflare Workers as static files plus the small statistics Worker.

```bash
npx wrangler deploy
```

## Contributing

Contributions are welcome, and the rules are few. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

The code and the game's own text are under the [MIT licence](LICENSE).

The artwork, the historic pictures and the music belong to other people and are not covered. [NOTICE.md](NOTICE.md) lists them.
