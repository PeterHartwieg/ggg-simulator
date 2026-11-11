/* The community requests board. Hours come straight out of the current release.
   kind 'click' requests cannot be bought, only pressed. */
(function (root) {
  'use strict';
  var D = root.GGG.data;

  D.requests = [
    {
      id: 'desync', kind: 'click', name: 'Fix desync', from: '2011-08-10', votes: 900,
      what: "The client guesses where you are. The server disagrees. You die in a room you already left.",
      clicks: 40, earliest: '2014-11-03', every: 6,
      lines: [
        "Jonathan nods. Nothing happens.",
        "Jonathan says it is a hard problem.",
        "Jonathan says he is thinking about it.",
        "Jonathan draws two boxes and an arrow on the whiteboard, then rubs them out.",
        "Players have bound /oos to a key. Jonathan is still thinking.",
        "Jonathan says the fix would mean rewriting how the game talks to the server.",
        "Jonathan stares out of the window for a long time.",
        "Keep pressing. He is close. It has only been a few years."
      ],
      fx: { mood: 12, future: 0.12, debt: -8, egg: 'desync' },
      done: "Jonathan has an idea. The client stops guessing and waits for the server on every step. He calls it lockstep. It took about eight years and it works.",
      real: "Lockstep networking shipped with The Awakening in July 2015. At the 2026 roundtable the founders joked about a simulator with a fix-desync button you press for eight years until Jonathan has an idea."
    },
    {
      id: 'filter', name: 'Loot filters', from: '2013-11-04', hours: 1200, votes: 500,
      what: "The ground is covered in items and none of them matter. Let players hide the junk.",
      fx: { mood: 7, vision: -3 },
      done: "Players can now script what they see. Within a month one community filter is on nearly every machine and the unfiltered game is something only streamers show new viewers as a joke.",
      real: "Item filters arrived in 2015. A third-party filter has been required equipment ever since."
    },
    {
      id: 'ssf', name: 'Solo Self-Found mode', from: '2014-06-02', hours: 500, votes: 300,
      what: "A flag that proves you never traded, so you can tell everyone.",
      fx: { mood: 5, vision: 3 },
      done: "An official mode for people who refuse to trade. They mention it constantly.",
      real: "Solo Self-Found became an official mode with Legacy league in March 2017."
    },
    {
      id: 'ah', name: 'Auction house', from: '2012-06-04', until: '2017-11-02', hours: 3000, votes: 1500,
      what: "Search, click, buy. Like every other online game has.",
      fx: { mood: 10, vision: -25, revMult: 0.95, flags: { ah: 1 }, egg: 'auction' },
      done: "Players buy their whole build on day two of every league and log off by day nine. They are very grateful and they are gone.",
      real: "GGG never built a classic auction house. The 2017 trade manifesto explains why at length."
    },
    {
      id: 'perf', name: 'Fix performance', from: '2016-06-06', hours: 2000, votes: 800,
      what: "The game runs at 12 frames per second whenever anything interesting happens.",
      fx: { mood: 6, debt: -15 },
      done: "A new renderer and real multithreading. Players immediately fill the headroom with more projectiles.",
      real: "GGG added multithreading in 2016 and a Vulkan renderer in 2020. Performance is still a front-page topic every league."
    },
    {
      id: 'lab', kind: 'click', clickEgg: 'nolab', name: 'Remove the Labyrinth', from: '2016-03-07', votes: 2200,
      cond: function (S) { return !!S.flags.lab; },
      what: "Day one of asking. And every day since.",
      clicks: 99999, earliest: '2099-01-01', every: 2,
      lines: ["No.", "No.", "Traps are content.", "Izaro would be sad.", "No.", "Have you tried not dying?", "The answer has not changed since 2016.", "Still no. Have an easter egg for your trouble."],
      real: "The Labyrinth is still in the game."
    },
    {
      id: 'async', name: 'Asynchronous trade', from: '2017-11-06', hours: 4000, votes: 1800,
      what: "Buy an item while the seller is asleep, in a map, or dead.",
      fx: { mood: 14, vision: -14, flags: { async: 1 }, egg: 'async' },
      done: "Four thousand hours. Players buy things without whispering anyone. Twelve years of unanswered messages end. The manifesto is still online, for reference.",
      real: "Asynchronous trade reached Path of Exile 2 in August 2025 and Path of Exile 1 in October 2025. At the 2026 roundtable the founders joked about a simulator where the async-trade button costs 4,000 hours you have to justify."
    },
    {
      id: 'recap', name: 'Death recap', from: '2015-03-02', hours: 1500, votes: 700,
      what: "Tell me what killed me. Just once.",
      fx: { mood: 6, vision: -2 },
      done: "The game now tells players what killed them. It was the thing they suspected and seven things they did not.",
      real: "Players asked for a death log for over a decade. A death recap was announced at ExileCon 2026 for Path of Exile 2's full release."
    },
    {
      id: 'affinity', name: 'Stash tab affinities', from: '2019-06-10', hours: 600, votes: 600,
      what: "Let items go to the right tab when I control-click them. I own forty tabs.",
      fx: { mood: 5, rev: 1.05 },
      done: "Currency goes to the currency tab on its own. Players describe the feature as life-changing and you worry about them.",
      real: "Stash tab affinities arrived in 2020."
    },
    {
      id: 'exchange', name: 'Currency exchange', from: '2019-12-16', hours: 2500, votes: 1300,
      what: "Swap one currency for another without messaging a bot at 3 a.m.",
      fx: { mood: 11, vision: -8, egg: 'exchange' },
      done: "An in-game market for currency. Players treat it as a small miracle. The biggest trading Discord loses half its reason to exist.",
      real: "The Currency Exchange shipped with Settlers of Kalguur in July 2024, seven years after the trade manifesto."
    },
    {
      id: 'ondeath', name: 'Fewer on-death effects', from: '2014-10-06', hours: 800, votes: 650,
      what: "I killed the monster. Then the monster's corpse killed me.",
      fx: { mood: 5, vision: -3 },
      done: "Corpses explode a little less. A designer immediately adds a new monster that explodes while alive.",
      real: "This has been requested in roughly every league since 2014."
    },
    {
      id: 'vacuum', kind: 'click', clickEgg: 'weight', name: 'Auto-pickup for currency', from: '2016-12-05', votes: 1100,
      what: "I have clicked eleven thousand splinters this week.",
      clicks: 99999, earliest: '2099-01-01', every: 2,
      lines: ["Clicking gives loot weight.", "No.", "Have you considered that the clicking is the game?", "The designers are nodding sadly.", "No. But your wrist has our sympathy."],
      real: "Players attribute the \"weight\" argument for clicking each item to Chris Wilson. Path of Exile 1 never got a currency vacuum."
    },
    {
      id: 'wasd', name: 'WASD movement', from: '2023-07-31', hours: 1800, votes: 900,
      what: "Let me walk with the keyboard like it is any year after 1996.",
      fx: { mood: 6, vision: -2 },
      done: "Players can walk with four keys. Half of them call it the best feature in ten years. The other half hold the left mouse button out of loyalty.",
      real: "WASD movement arrived with Path of Exile 2 early access in December 2024."
    },
    {
      id: 'harvest', kind: 'click', clickEgg: 'eyes', name: 'Bring back Harvest', from: '2021-04-19', votes: 1700,
      cond: function (S) { return !!S.flags.harvestNerf; },
      what: "Ritual-era crafting. You know the one.",
      clicks: 99999, earliest: '2099-01-01', every: 2,
      lines: ["Close your eyes.", "No.", "The manifesto covers this.", "The thread is on page 470. The answer is on page 1.", "No."],
      real: "Every crafting change since 2021 has been compared to Ritual-era Harvest."
    },
    {
      id: 'guides', name: 'Build guides in the client', from: '2021-09-06', hours: 1400, votes: 500,
      what: "New players open the passive tree and close the game. Maybe show them a path.",
      fx: { mood: 4, rep: 0.03, vision: -3 },
      done: "The game now suggests builds. Veterans call it hand-holding and quietly use it for their fifth character.",
      real: "In-client build guides arrived in Path of Exile 2 patch 0.5.0 in May 2026."
    },
    {
      id: 'pause', name: 'A pause button', from: '2018-09-03', hours: 700, votes: 550,
      what: "My doorbell rang during a boss. The game is single-player 95% of the time.",
      fx: { mood: 5, vision: -3 },
      done: "Players can pause. Hardcore players note that their logout macro did this already, faster.",
      real: "Path of Exile 2 shipped with a real pause in 2024. Path of Exile 1 got one in 3.26."
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
