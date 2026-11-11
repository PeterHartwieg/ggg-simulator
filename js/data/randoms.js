/* Undated office events. Each fires at most once, in the years given by "y". */
(function (root) {
  'use strict';
  var D = root.GGG.data;

  D.randoms = [
    {
      id: 'r_mirror', y: [2013, 2027], icon: 'mirror', who: 'The subreddit', title: 'A Mirror dropped',
      text: "A new player found a Mirror of Kalandra in a level 3 zone and asked the subreddit whether it is worth anything.",
      choices: [{ label: "Good for them", fx: { mood: 3, flags: { mirrorShard: 1 } }, result: "Most players never see one in thousands of hours. Something glints in the corner of your office." }]
    },
    {
      id: 'r_dupe', y: [2013, 2027], icon: 'bug', who: 'Crisis', title: 'It prints currency',
      text: "An unintended interaction is printing currency. A few groups have been on it for eight hours.",
      choices: [
        { label: "Fix it and ban the worst twenty until the league ends", fx: { vision: 3, mood: -3, egg: 'bans' },
          result: "One of the twenty reported the bug himself and then kept using it on stream. The rule from now on is report it, then stop." },
        { label: "Fix it and let them keep it", fx: { mood: 3, vision: -4 }, result: "Exploit early, exploit often. The players wrote that down." },
        { label: "Roll the whole realm back", fx: { mood: -9, sanity: -5 }, result: "Everyone loses a day. Everyone tells you which day it was." }
      ]
    },
    {
      id: 'r_rip', y: [2013, 2027], icon: 'skull', who: 'Twitch', title: 'What killed me?',
      text: "A famous hardcore streamer died to something off screen. The clip has a million views. His chat wants to know what it was. The game does not say.",
      choices: [
        { label: "Add \"death recap\" to the board", fx: { mood: 1 }, result: "It goes on the board. The board is long." },
        { label: "Dying to the unknown is the experience", fx: { vision: 4, mood: -4 }, result: "The clip gets a second million views with your reply in the title." }
      ]
    },
    {
      id: 'r_mathil', y: [2015, 2027], icon: 'hammer', who: 'Balance', title: 'Nerf Mathil',
      text: "A streamer who plays a new off-meta build every few days has made a forgotten skill look incredible. Its price has tripled and the balance team has opened a spreadsheet.",
      choices: [
        { label: "Nerf it", fx: { vision: 3, mood: -3, egg: 'mathil' }, result: "The patch note thanks nobody by name. Everybody knows." },
        { label: "Leave it", fx: { mood: 2 }, result: "He has moved on to another skill by Thursday anyway." }
      ]
    },
    {
      id: 'r_fishing', y: [2013, 2027], icon: 'kiwi', who: 'The forum', title: 'A fishing rod',
      text: "A player asks on the forum what the fishing rod is for.",
      choices: [
        { label: "Say nothing", fx: { vision: 2, egg: 'fishing' }, result: "The thread is locked without comment. The player is never heard from again. Probably a coincidence." },
        { label: "Explain fishing", fx: { egg: 'fishing' }, result: "You begin to type. You stop. Some things are not for patch notes." }
      ]
    },
    {
      id: 'r_stash', y: [2013, 2027], icon: 'money', who: 'The shop', title: 'It is the weekend',
      text: "It is a weekend, so the stash tabs are on sale.",
      choices: [
        { label: "Run the sale", fx: { revW: 2, egg: 'stash' }, result: "Veterans tell every new player the game is free and costs about thirty dollars." },
        { label: "Give everyone a free tab instead", fx: { mood: 6, revMult: 0.97 }, result: "Goodwill. The accountant frames the email in which you proposed it." }
      ]
    },
    {
      id: 'r_toucan', y: [2013, 2027], icon: 'heart', who: 'Global chat', title: 'Le Toucan has arrived',
      text: "Global chat fills with a bird drawn in text characters. Every reply is the same word.",
      choices: [
        { label: "PRAISE", fx: { mood: 2, egg: 'toucan' }, result: "PRAISE." },
        { label: "Mute global chat", fx: { mood: -2 }, result: "The toucan does not need your approval." }
      ]
    },
    {
      id: 'r_whisper', y: [2013, 2025], icon: 'scroll', who: 'Trade', title: 'Nobody answers',
      text: "A player has whispered 43 sellers for the same item. None replied. Three were price fixers and the rest were in a map.",
      choices: [
        { label: "That is the friction working", fx: { vision: 3, mood: -3 }, result: "The 44th seller replies. The price has doubled." },
        { label: "Feature a how-to-trade video", fx: { mood: 1 }, result: "The video is eleven minutes long. For buying a belt." }
      ]
    },
    {
      id: 'r_datamine', y: [2014, 2024], icon: 'bug', who: 'The files', title: 'Dataminers',
      text: "The patch files are out a day early and dataminers are reading them like tea leaves.",
      reality: "Chris Wilson admitted in 2026 that GGG used to plant decoy assets in the files to send dataminers after content that did not exist.",
      choices: [
        { label: "Plant a fake boss in the files", fx: { hype: 5, egg: 'plant' }, result: "A boss that does not exist tops the subreddit for two days." },
        { label: "Let them read", fx: { hype: 2 }, result: "They find the league mechanic, the new uniques and your lunch order." }
      ]
    },
    {
      id: 'r_survey', y: [2014, 2027], icon: 'scroll', who: 'Marketing', title: 'Ask the players',
      text: "Marketing proposes a big survey. Which features do players want?",
      reality: "Chris Wilson argued in a 2026 video that studios should not survey their players, because audiences spot problems well and solve them badly.",
      choices: [
        { label: "No surveys", fx: { vision: 5, egg: 'survey' }, result: "Players are good at spotting problems and bad at solving them. You keep your direction and skip the poll." },
        { label: "Run it", fx: { mood: 3, vision: -4 }, result: "The top answer is an auction house. The second is \"not an auction house\"." }
      ]
    },
    {
      id: 'r_ai', y: [2025, 2027], icon: 'gear', who: 'A consultant', title: 'The consultant',
      text: "A consultant offers to have AI write the patch notes and half the code.",
      reality: "At the 2026 roundtable Jonathan Rogers said he will not force anyone to use AI or stop anyone who wants to, that almost nobody at GGG wants to, and that nothing made with it goes into the game.",
      choices: [
        { label: "No", fx: { sanity: 3, egg: 'ai' }, result: "Jonathan's worry is ownership. Programmers do not want to touch code a machine wrote, and code nobody owns is dead." },
        { label: "Try it on the patch notes", fx: { mood: -6 }, result: "The notes say every change is a buff. Business as usual, except this time the players can tell." }
      ]
    },
    {
      id: 'r_sleeves', y: [2008, 2023], icon: 'card', who: 'A meeting', title: 'Sleeves',
      text: "Design meeting. Chris has brought a box of Magic cards and is putting each one in a plastic sleeve while people talk.",
      reality: "Mark Roberts joked in 2026 that Chris sleeved Magic cards through design discussions and business meetings.",
      choices: [{ label: "Carry on", fx: { sanity: 2, egg: 'sleeves' }, result: "He does not miss a point in the discussion. Three hundred cards get sleeved." }]
    },
    {
      id: 'r_spin', y: [2008, 2021], icon: 'clock', who: 'After hours', title: 'The hero that spins',
      text: "It is past midnight and the office is still working. Erik is playing an online arena game, as he does every evening, with the hero that spins.",
      reality: "Erik Olofsson confirmed at the 2026 roundtable that he picks the spinning build in every game.",
      choices: [{ label: "Let him spin", fx: { sanity: 2, egg: 'spin' }, result: "Years later the most played skill in your game is a man spinning in a circle. Nobody investigates the connection." }]
    },
    {
      id: 'r_bananas', y: [2014, 2027], icon: 'banana', who: 'A secret', title: 'Bananas',
      text: "Mark has hidden something in the game again. He will not say what or where.",
      reality: "Mark Roberts said in 2026 that he is proud of the hidden bananas in the game that not everyone has found.",
      choices: [{ label: "Do not ask", fx: { egg: 'bananas' }, result: "There are bananas in the game. Not everyone has found them. There may be some in this office." }]
    },
    {
      id: 'r_hoax', y: [2014, 2027], icon: 'fire', who: 'Crisis', title: 'A bad week',
      text: "Someone has invented an accusation against the studio and the gaming press has picked it up.",
      reality: "Chris Wilson recalled a week like this at the 2026 roundtable, along with the constant dread of running a live game where any day can turn terrible without warning.",
      choices: [
        { label: "Answer calmly, with facts", fx: { mood: -3, sanity: -6 }, result: "It takes a week for the correction to travel half as far as the claim." },
        { label: "Stay silent", fx: { mood: -8 }, result: "Silence reads as guilt. It takes a month." }
      ]
    },
    {
      id: 'r_backups', y: [2013, 2027], icon: 'server', who: '3 a.m.', title: 'The dread',
      text: "It is 3 a.m. and you are awake imagining mass database corruption, followed by the news that the backups failed.",
      reality: "Chris Wilson gave this as his example of live-service dread at the 2026 roundtable. He added that it never happened and praised the backup staff.",
      choices: [{ label: "Check the backups", fx: { debt: -3, sanity: -2, egg: 'backups' }, result: "The backups are fine. They have always been fine. You check again." }]
    },
    {
      id: 'r_notes', y: [2014, 2027], icon: 'scroll', who: 'Patch notes', title: 'Patch notes when',
      text: "The patch notes are due today. They are 14,000 words long and not finished. The subreddit has been asking since Monday.",
      choices: [
        { label: "Post them late and complete", fx: { mood: -2, polish: 0.04 }, result: "Streamers read them aloud for four hours. Every line is sorted into buff or nerf." },
        { label: "Post on time, fix them later", fx: { mood: 2, polish: -0.05 }, result: "Version two of the notes quietly removes three buffs." },
        { label: "Add \"(This is a buff)\" to the scary ones", fx: { mood: 1, egg: 'buff' }, result: "Nobody believes the brackets. Everybody quotes them." }
      ]
    },
    {
      id: 'r_einhar', y: [2018, 2027], icon: 'kiwi', who: 'The community', title: 'A worthy contest',
      text: "Fans have entered an Einhar talent contest. Someone learned the accordion for it.",
      choices: [{ label: "Judge it", fx: { mood: 4, egg: 'einhar' }, result: "The winner captured the essence of the beast. He would say so himself." }]
    },
    {
      id: 'r_wiki', y: [2021, 2023], icon: 'scroll', who: 'The wiki', title: 'The wiki wants to move',
      text: "The volunteers who write the wiki want off their host, which covers every page in adverts.",
      reality: "The community wiki moved to poewiki.net in 2021 on hosting GGG provided for free.",
      choices: [
        { label: "Host it for them, free", fx: { mood: 6, moneyW: -0.5, egg: 'wiki' }, result: "For two years search engines keep sending players to the old one. Reddit shares tricks for hiding it." },
        { label: "Not our problem", fx: { mood: -3 }, result: "It is your problem. Your game cannot be played without it." }
      ]
    },
    {
      id: 'r_filter', y: [2015, 2027], icon: 'gear', who: 'Tools', title: 'The filter',
      text: "One hobbyist in Germany maintains the loot filter nearly every player uses. Without it nobody can see the floor.",
      choices: [
        { label: "Send him the item data early", fx: { mood: 4, egg: 'filter' }, result: "The filter is ready at launch. \"Did you update your filter?\" replaces \"hello\"." },
        { label: "Drop less loot yourself", fx: { vision: -3, mood: 2 }, result: "A designer asks what the weight of an item is if there is only one of it." }
      ]
    },
    {
      id: 'r_tft', y: [2019, 2025], icon: 'building', who: 'Trade', title: 'The Discord',
      text: "Bulk trading, boss carries and crafting services have moved to one enormous third-party Discord with its own rules and its own blacklist.",
      choices: [
        { label: "Leave it be", fx: { vision: 2 }, result: "It passes 700,000 members. You do not run the largest marketplace for your own game." },
        { label: "Put the tools on the board so nobody needs it", fx: { mood: 2, vision: -2 }, result: "Another line on the requests board. It is a long board." }
      ]
    },
    {
      id: 'r_union', y: [2025, 2027], icon: 'heart', who: 'The subreddit', title: 'Unions',
      text: "The subreddit has formed unions by playstyle. The Alch and Go Corps is the largest. There is an Anti Sanctum Alliance.",
      reality: "The satirical \"OSHA\" unions appeared on reddit in February 2025 and GGG played along.",
      choices: [{ label: "Recognise them", fx: { mood: 5, egg: 'union' }, result: "The Einhar trapping association requests a seat at the balance meeting." }]
    },
    {
      id: 'r_pants', y: [2013, 2027], icon: 'money', who: 'Art', title: 'Pants of Exile',
      text: "A player points out that almost no free armour in the game includes trousers. Characters fight gods bare-legged.",
      choices: [
        { label: "Sell trousers", fx: { revW: 1, egg: 'pants' }, result: "They have wings on them. They sell." },
        { label: "Bare legs are the art direction", fx: { vision: 2, egg: 'pants' }, result: "Wraeclast is a hard place. There is no time for trousers." }
      ]
    },
    {
      id: 'r_boat', y: [2014, 2024], icon: 'scroll', who: 'Teaser season', title: 'Boat?',
      text: "A teaser image has water in it. The subreddit is certain the next league is about boats. It has been certain for years.",
      choices: [{ label: "Say nothing", fx: { hype: 5, egg: 'boatmeme' }, result: "It is not about boats. One day it will be, and nobody will believe it." }]
    },
    {
      id: 'r_dead', y: [2014, 2027], icon: 'reddit', who: 'The subreddit', title: 'League is dead',
      text: "Day ten. Someone has posted the Steam chart with a red arrow on it.",
      choices: [
        { label: "Explain that leagues always do this", fx: { mood: -1 }, result: "They know. They post it every league out of habit, good ones included." },
        { label: "Announce a mid-league event", fx: { mood: 3, content: -0.04 }, result: "A weekend of faster monsters. Someone has to build it." }
      ]
    },
    {
      id: 'r_calm', y: [2013, 2027], icon: 'fire', who: 'Crisis', title: 'It is fine',
      text: "Everything is on fire. The realm is down, the patch is broken and the forum is melting. The staff are watching the leads to see how bad it is.",
      reality: "Mark Roberts said he learned crisis handling from how calm Chris stayed when everything was on fire, because panic in a lead spreads to the staff.",
      choices: [
        { label: "Stay calm where they can see you", fx: { sanity: 6, egg: 'fine' }, result: "It is fine. It is not fine, but everyone works as if it is, and then it is." },
        { label: "Panic", fx: { sanity: -8 }, result: "It spreads faster than the outage." }
      ]
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
