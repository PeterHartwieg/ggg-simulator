# Contributing

Contributions are welcome. Fixes, balance changes, new events, new secrets, better jokes: open an issue or send a pull request. You do not need to ask first.

The rules are few:

1. **Keep it plain.** No build step, no framework, no dependencies. The game is HTML, CSS and classic script files.
2. **Keep the engine free of browser code.** `js/engine.js` also runs under Node. After a balance change, run `node tools/sim.js par` and say in the pull request what changed.
3. **History needs a source.** A new event or release fact gets a `reality` note that says what really happened, and a link to the source in the pull request.
4. **Pictures and music go through the catalogs.** Add the source and owner to `art/sources.json` or `audio/sources.json`. Do not add files without them.
5. **Joke about the game and the studio, not at people.** This is a fond parody.

Your contribution is licensed under the [MIT licence](LICENSE), like the rest of the code.
