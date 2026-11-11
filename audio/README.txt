BACKGROUND MUSIC

menu.mp3 is the classic Path of Exile 1 Main Menu theme by Adgio Hutchings (2013).
It is an unmodified copy from a community archive of official soundtrack downloads.
sources.json records the archive member, embedded track metadata and SHA-256 hash.
credits.html is linked from the simulator's title screen and game menu.

Playback starts after a click, tap or keyboard interaction when the browser permits.
It loops through the title screen and game and pauses while the tab is hidden.
Use Music in the game menu for volume, or the musical-note button to mute everything.
The sound-effects volume remains independent. Volume preferences survive a reload.

Rebuild the bundled file and credits with: python tools/import-music.py
The importer fetches only this track from the archive using HTTP byte ranges.
No game installation, login, external player or streaming connection is needed to play.
