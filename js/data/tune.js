/* Balance numbers and the small lookup tables. Headcount and money figures follow
   what NZ press reported about the real studio; see research/01-ggg-poe-timeline.md. */
(function (root) {
  'use strict';
  var D = root.GGG.data;

  D.tune = {
    startMoney: 260000,
    minWeek: 3000,          // floor for "N weeks of payroll" effects while founders work for free
    hireWeeks: 3,           // recruiting cost, in weeks of salary
    hireRate: 0.35,         // share of current headcount you can hire per release
    hireCap: 12,            // Auckland only has so many game developers
    serverCost: 0.75,       // $ per concurrent player per week
    burst: 1.0,             // launch-week pack sales, in weeks of per-player income
    postRate: 0.3,          // chance of a subreddit post each week
    randomRate: 0.075,      // chance of an office event each week
    randomGap: 6,
    mtxFrom: '2012-04-04',  // closed beta supporter packs
    // Real studio size by year: 2 in a garage, 18 in 2012, 55 by Dec 2013, 260 by mid-2026.
    headcount: [[2006.85, 2], [2007.3, 3], [2008.5, 4], [2009.5, 6], [2010.5, 9], [2011.5, 13], [2012.45, 18],
      [2013.0, 22], [2013.95, 55], [2015.0, 68], [2016.0, 82], [2017.3, 100], [2018.4, 114], [2019.6, 135],
      [2021.2, 155], [2022.6, 165], [2024.25, 183], [2025.5, 240], [2026.5, 260]],
    salary: [[2006, 700], [2012, 1000], [2018, 1500], [2026, 2100]],
    // $ per concurrent player per week. Tuned so yearly income lands near reported revenue.
    arpu: [[2012, 6], [2013, 7], [2014, 8.5], [2015, 9], [2016, 9.5], [2017, 10], [2018, 12], [2019, 14],
      [2020, 15], [2021, 14], [2022, 12], [2023, 11], [2024, 11], [2025, 24], [2026, 20]],
    upvotes: [[2010, 30], [2012, 180], [2014, 600], [2017, 1800], [2020, 3600], [2023, 4600], [2026, 5200]]
  };

  D.offices = [
    { name: "Chris's garage, New Lynn", cap: 6, rent: 0, cost: 0, art: 0 },
    { name: 'First real office, Titirangi', cap: 20, rent: 1400, cost: 12000, art: 1 },
    { name: 'Henderson office', cap: 62, rent: 6500, cost: 90000, art: 2 },
    { name: 'Henderson, two more floors', cap: 125, rent: 15000, cost: 320000, art: 3 },
    { name: "Henderson, the block by the Pak'nSave car park", cap: 195, rent: 26000, cost: 900000, art: 3 },
    { name: 'Henderson, every floor the landlord has', cap: 300, rent: 42000, cost: 2400000, art: 4 }
  ];

  D.depts = {
    code: { name: 'Programmers', short: 'programmers', what: 'Content, servers, and whatever "netcode" is.' },
    art: { name: 'Artists', short: 'artists', what: 'Monsters, environments, and every pair of wings in the shop.' },
    design: { name: 'Designers', short: 'designers', what: 'League mechanics, balance, and reasons to say no.' },
    qa: { name: 'QA', short: 'QA', what: 'Finds the bugs so the players only find most of them.' },
    comm: { name: 'Community', short: 'community', what: 'Support tickets, patch notes, absorbing the subreddit.' }
  };

  D.streams = {
    content: { name: 'Next release', what: 'The league or expansion that ships on the date above. Late content cannot be patched in with an apology. Well, it can.' },
    polish: { name: 'QA and balance', what: 'Fewer launch-day bugs, fewer builds that delete the screen. Mostly QA staff and designers.' },
    mtx: { name: 'MTX and packs', what: 'Supporter packs and cosmetics. This is the entire income. Mostly artists.' },
    infra: { name: 'Servers and tech', what: 'Launch-day stability and paying down tech debt. Mostly programmers.' },
    future: { name: 'The long game', what: 'The secret multi-year project. Pays off only when it ships.' }
  };

  /* Long projects that land with a specific release. */
  D.futures = [
    { id: 'awakening', short: 'Act 4', name: 'Act 4 and a real fix for desync', start: '2014-08-20', cycle: 'c_awakening' },
    { id: 'oriath', short: 'The 3.0 expansion', name: 'The 3.0 expansion', start: '2015-08-15', cycle: 'c_oriath' },
    { id: 'poe2', short: 'Path of Exile 2', name: 'The 4.0 mega-expansion', start: '2017-12-08', cycle: 'c_poe2ea' }
  ];

  /* Named hires. Real people, public roles, small friendly bonuses. */
  D.heroes = {
    weissman: { name: 'Brian, in Seattle', perk: { content: 0.04 }, blurb: 'Magic: The Gathering deck-building legend, designing from another hemisphere.' },
    mark: { name: 'Mark, first QA', perk: { polish: 0.1 }, blurb: 'Hired on the strength of a flame totem build. Takes responsibility for things before anyone offers it.' },
    kamil: { name: 'Kamil, composer', perk: { hype: 0.5 }, blurb: 'Every trailer now has a choir in it.' },
    bex: { name: 'Bex, community', perk: { mood: 3 }, blurb: 'Reads the subreddit so you do not have to. Ten years of it.' },
    rory: { name: 'Rory, balance', perk: { polish: 0.06 }, blurb: 'The voice of "this was stronger than intended".' },
    pob: { name: 'The Path of Building author', perk: { infra: 0.08 }, blurb: 'Wrote the tool every player uses instead of your character sheet. Now writes tools for you.' }
  };

  D.text = {
    moods: ['Pitchforks', 'Outrage', 'Salty', 'Grumbling', 'Whelmed', 'Happy', 'Praise Chris'],
    hypes: ['Dead', 'Quiet', 'Warm', 'Hyped', 'Hype train'],
    visions: ['Sold out', 'Crowd-pleaser', 'Balanced', 'The Vision', 'Ruthless'],
    sanities: ['Gone', 'Twitching', 'Fraying', 'Still sane'],
    debts: ['Clean', 'Creaky', 'Spaghetti', 'Held together by a hideout decoration'],
    serverTiers: ['Lean', 'Sensible', 'Overkill'],
    // Said when the player picks something that did not happen. History then proceeds as recorded.
    flips: [
      "Nice try. That is not what happened, and this is a history game.",
      "Chris reads your decision, nods, and does the other thing.",
      "Jonathan stares at you until you take it back.",
      "You are the fourth founder. You have been outvoted three to one.",
      "Bold. Wrong, but bold.",
      "The timeline rejects your offering.",
      "Reddit would have loved that. Which is exactly why it did not happen.",
      "This is a buff to historical accuracy.",
      "Your decision has been nerfed. Reverting to the vision.",
      "Working as intended. Your choice was ignored.",
      "The designers thank you for your feedback.",
      "A manifesto explaining why you are wrong has been posted. It is 95 pages.",
      "You closed your eyes and slammed. It bricked. Restoring from the real timeline.",
      "Your suggestion has been added to the list. The list is not real.",
      "Still sane, founder? Apparently not.",
      "That was the Vaal option. It corrupted into the opposite.",
      "Interesting idea. We will look into it in Path of Exile 2.",
      "Human error. Yours. Corrected.",
      "You have been moved to Standard. The real decision stays in the league.",
      "Tested extensively. It failed.",
      "A redditor suggested that once. Look what happened to him.",
      "No.",
      // The spicy ones name names. y = [from, to) keeps them in the right era.
      { t: "Chris Wilson overruled you. He has The Vision.", y: [2006, 2024] },
      { t: "Chris read your proposal and wrote a manifesto against it. The thread is on page 95.", y: [2012, 2024] },
      { t: "Chris closed his eyes, slammed an Exalted Orb on your idea, and it rolled \"no\".", y: [2011, 2024] },
      { t: "Chris was sleeving Magic cards and did not hear you. Motion denied.", y: [2006, 2024] },
      { t: "The Vision does not include your opinion. Chris checked.", y: [2006, 2024] },
      { t: "Chris says friction gives decisions weight. Yours weighed nothing.", y: [2010, 2024] },
      { t: "Chris will explain on the podcast why you were wrong. He will be very calm about it.", y: [2019, 2024] },
      { t: "Erik says it needs to be darker. Your idea was too bright and has been removed.", y: [2007, 2022] },
      { t: "Erik was busy with the hero that spins. He voted against you anyway.", y: [2007, 2022] },
      { t: "Mark says the mechanics do not work that way. Mark has spoken.", y: [2012, 2099] },
      { t: "Mark tested your idea alone on a Saturday. It did not seem fine.", y: [2012, 2099] },
      { t: "Jonathan overruled you. He rewrote the netcode in the time it took you to decide.", y: [2006, 2019] },
      { t: "Jonathan says that is solved in Path of Exile 2.", y: [2019, 2024.9] },
      { t: "Jonathan overruled you. He will explain why in a two-hour interview.", y: [2024, 2099] },
      { t: "Jonathan nerfed your decision mid-league and enjoyed doing it.", y: [2025, 2099] },
      { t: "Jonathan dodge-rolled your suggestion. Mark's character died to it on stage.", y: [2024, 2099] },
      { t: "Jonathan says your idea ruined his Christmas. It is gone now.", y: [2025.9, 2099] }
    ],
    late: [
      "You took too long. History got bored and decided for you.",
      "No answer. The thirteen-week clock does not wait.",
      "You were AFK. The timeline went ahead without you."
    ],
    tips: [
      'Tip: league content is finished when the launch date arrives.',
      'Tip: you cannot please everyone, but you can displease everyone at once.',
      'Tip: every stat on this screen is somebody\'s job to worry about. That somebody is you.',
      'Tip: the queue is the first boss.',
      'Tip: a nerf is just a buff to everything you did not nerf.',
      'Tip: "soon" is a unit of time. Nobody at the studio knows how long it is either.',
      'Tip: the passive tree is not a loading screen. It only feels like one.',
      'Tip: if nobody is complaining, check that the servers are up.',
      'Tip: the kiwi does nothing. It is there for morale.',
      'Tip: there is a button for fixing desync. Keep pressing it.'
    ],
    queue: [
      'Login queue: {n} ahead of you. The queue is moving. The queue is the content.',
      'Queue position {n}. A man in Ohio has been in it since Thursday.',
      'The queue held. {n} people learned patience against their will.'
    ],
    crash: [
      'The realm fell over. Twice. "Restarting in 10 minutes" is posted four times.',
      'Instance servers on fire. Rollbacks. One player loses a Mirror and writes 4,000 words about it.',
      'An unexpected disconnection occurred. For everyone. Simultaneously.'
    ],
    smooth: [
      'Servers held. The subreddit is suspicious.',
      'No queue to speak of. Veterans check they launched the right game.',
      'Smooth launch. Someone posts "is the league dead already?" at minute 4.'
    ],
    bugs: [
      'A skill deals 1,000x damage if you stand on stairs',
      'A quest NPC is missing in Act 2 and cannot be un-missed',
      'The new boss can be killed by leaving the room',
      'Loot filter sounds play at ear-surgery volume',
      'A stash tab sorts itself alphabetically in Russian',
      'The league mechanic does not spawn in maps beginning with "C"',
      'Minions refuse to attack on Tuesdays',
      'An unintended interaction prints currency. It is being enjoyed',
      'The client crashes when a specific hideout decoration is rotated',
      'Trade whispers arrive from players who logged out in 2019',
      'A support gem supports the wrong gem, emotionally',
      'Shaders compile again every time you look left',
      'The new unique drops already corrupted, into itself',
      'Ground effects are invisible. They always were, but more now'
    ],
    bubbles: {
      normal: ['"Who touched the drop tables?"', '"It works on my machine."', '"Is that intended?" "It is now."', '"Has anyone read the subreddit today?" "Don\'t."', '"We could just ship it and see."', '"Thirteen weeks is a long time." "It is week eleven."', '"Add it to the list." "Which list?" "The list."'],
      crunch: ['"What day is it?"', '"I live here now."', '"The build is green. I am not."', '"Coffee is a food group."', '"My hideout is this desk."'],
      garage: ['"It smells like petrol in here."', '"Can we afford a second heater?"', '"Nobody is making an action RPG. We are fine."', '"When this ships, we get chairs."', '"I photographed some grass. For the grass."'],
      sad: ['"They hate it."', '"I read the comments."', '"We did buff it though."', '"Still sane?" "No."'],
      happy: ['"They like it?"', '"Front page says thank you. Is this a trap?"', '"Record numbers. Nobody touch anything."']
    },
    board: ['"13 WEEKS" is underlined three times.', 'Days since last DDoS: 0.', 'A drawing of the passive tree. Someone gave up halfway.', '"NERF LIST" with one word under it: "yes".', '"DO NOT PROMISE DATES" is circled twice. Nobody reads it.', '"What would the players expect us to announce? Do the other thing."'],
    rack: ['The server hums. It is fine. Everything is fine.', 'A sticky note: "do not restart during league launch". It is league launch.', 'One light is red. It has always been red. Nobody knows what it means.'],
    kiwi: ['The kiwi looks at you. It has seen the garage.', 'Peep.', 'It is nocturnal. So is the team.', 'Kiwi pet: $25, closed beta, 2012. Still here.', 'The kiwi does not care about the patch notes.'],
    sign: ['Grinding Gear Games. The gears are a metaphor. So is the grinding.']
  };
})(typeof window !== 'undefined' ? window : globalThis);
