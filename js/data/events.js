/* Dated moments from the studio's history. Choices are ours, "reality" is what happened. */
(function (root) {
  'use strict';
  var D = root.GGG.data;
  function inCycle(id) { return function (S) { return D.cycles[S.ci].id === id; }; }
  function dropHero(S, id) { var i = S.heroes.indexOf(id); if (i >= 0) S.heroes.splice(i, 1); }
  /* The card has just said the game is ready, so production does not get to say it is not. */
  function ready(S) { S.cyc.asked = true; }

  D.events = [
    {
      id: 'e_erik', date: '2007-03-05', icon: 'garage', who: 'Arrivals', title: 'The artist from the internet',
      text: "Erik, a Swede Chris met online, lands in Auckland with a suitcase and a drawing tablet. He looks at the prototype. He looks at the garage. He says the game should be darker.",
      reality: "Erik Olofsson was art director and creative director for about 17 years. He told the 2026 roundtable that early art reference meant going outside to photograph grass.",
      choices: [{ label: "Welcome to the garage", fx: { staff: { art: 1 }, egg: 'grass', fn: function (S) { S.founders = 3; } },
        result: "For reference textures he goes outside and photographs grass. The grass in the game is that grass." }]
    },
    {
      id: 'e_brian', date: '2007-09-03', icon: 'card', who: 'Email', title: 'A fourth founder, by email',
      text: "Brian lives in Seattle and is famous among Magic players for inventing a deck simply called The Deck. He will write and design from eleven thousand kilometres away.",
      reality: "Brian Weissman described himself as the fourth co-founder and is credited as executive producer and writer.",
      choices: [{ label: "Add him to the thread", fx: { hero: 'weissman' }, result: "The design emails now arrive while Auckland is asleep. It is like having a night shift." }]
    },
    {
      id: 'e_orbs', date: '2008-04-07', icon: 'orb', who: 'Design', title: 'What do monsters drop?',
      text: "Every action RPG has gold. Gold piles up, inflates and ends in an auction house. Chris has another idea, from years of trading cards.",
      reality: "Path of Exile launched with no gold. Its tradeable crafting orbs became the economy.",
      choices: [
        { label: "No gold. Currency is a set of orbs that also craft items.", fx: { vision: 8, egg: 'orbs' },
          result: "Every orb has a use, so every orb has a price. Players will learn the exchange rates before they learn the story." },
        { label: "Gold coins", fx: { vision: -8 }, result: "Gold it is. Somewhere in the future an auction house clears its throat." }
      ]
    },
    {
      id: 'e_invest1', date: '2008-08-04', icon: 'money', who: 'Money', title: 'Money from America',
      text: "The savings are thinner than the plan. A few private investors in the US will put money into a studio they have never visited, making a game they have not seen.",
      reality: "GGG was funded by Chris Wilson's security-job earnings, the founders' own money and some private US investors. About NZ$2 million went in before the game earned anything.",
      choices: [
        { label: "Take it", fx: { money: 380000 }, result: "The wire arrives. You buy a second heater." },
        { label: "Stay independent", fx: { vision: 3, sanity: -3 }, result: "You keep every share. You also keep the one heater." }
      ]
    },
    {
      id: 'e_office', date: '2008-11-17', icon: 'building', who: 'Property', title: 'The garage is full',
      cond: function (S) { return S.office === 0; },
      text: "Late 2008. There is an office for rent in Titirangi. It has walls on all four sides.",
      reality: "GGG moved from the New Lynn garage to its first office in Titirangi in late 2008.",
      choices: [
        { label: "Move in", fx: { office: 1, money: -12000, sanity: 6 }, result: "Chairs. Actual chairs." },
        { label: "One more winter in the garage", fx: { sanity: -6 }, result: "It still smells of petrol. You can move later from the team panel." }
      ]
    },
    {
      id: 'e_tree', date: '2009-06-01', icon: 'gear', who: 'Design', title: 'The passive tree',
      text: "Jonathan has a tool that draws passive skills as a web. The designers keep adding to it. It no longer fits on a monitor.",
      reality: "The passive tree, about 1,325 nodes, is the game's best-known screenshot and its harshest filter for new players.",
      choices: [
        { label: "One giant tree for every class. Thirteen hundred nodes.", fx: { vision: 8, hype: 4, egg: 'tree' },
          result: "New players will open it, say a short word and close the game. The ones who stay will never leave." },
        { label: "A small tidy tree per class", fx: { vision: -8 }, result: "Readable and sensible. Nobody ever screenshots it." }
      ]
    },
    {
      id: 'e_gems', date: '2009-11-02', icon: 'orb', who: 'Design', title: 'Sockets',
      text: "Skills are gems. Gems go in sockets. Sockets have colours, and sockets can be linked so one gem changes another. How does a player get six sockets linked?",
      choices: [
        { label: "Luck. One orb at a time.", fx: { vision: 5, egg: 'sixlink' },
          result: "Someone will do it in three orbs. Someone else will need four thousand. Both will tell you about it." },
        { label: "Pay a fixed price", fx: { vision: -5, mood: 2 }, result: "Fair and predictable. Nobody will ever scream at their monitor in joy." }
      ]
    },
    {
      id: 'e_invest2', date: '2010-03-01', icon: 'money', who: 'Money', title: 'The investors, again',
      text: "The same investors will go again. They ask when it ships. You say 2011.",
      choices: [
        { label: "Take it", fx: { money: 480000 }, result: "You said 2011 with a straight face. Everyone in the room is proud of you." },
        { label: "Decline", fx: { vision: 3, sanity: -4 }, result: "The runway gets shorter. So do the lunches." }
      ]
    },
    {
      id: 'e_announce', date: '2010-09-01', icon: 'stage', who: 'Marketing', title: 'Path of Exile, announced',
      text: "A trailer, screenshots, a website. Free to play, PC only, coming 2011. Four years of secrecy end today.",
      reality: "The announcement site drew only about 2,000 views on day one despite press coverage. Later that month the team showed the game at PAX in Seattle.",
      choices: [{ label: "Publish", fx: { flags: { announced: 1 }, hype: 12, fn: function (S) { S.mood = 60; } },
        result: "The gaming press covers it. The website gets about two thousand views. A subreddit appears. It has opinions already." }]
    },
    {
      id: 'e_invest3', date: '2011-05-02', icon: 'money', who: 'Money', title: 'The last round',
      text: "One more cheque from the investors. After this one the game pays for itself or nobody does.",
      choices: [
        { label: "Take it", fx: { money: 420000 }, result: "That is everything. The next money has to come from players." },
        { label: "Decline", fx: { vision: 3, sanity: -5 }, result: "Brave. Possibly other words too." }
      ]
    },
    {
      id: 'e_mark', date: '2011-11-07', icon: 'totem', who: 'Hiring', title: 'The QA hire',
      text: "You need a tester and you have none. The best applicant is a player who made a flame totem build Chris liked enough to feature in Build of the Week. One founder worries about hiring someone who plays games all day.",
      reality: "Mark Roberts told this story at ExileCon 2026. He now directs Path of Exile 1 and co-directs Path of Exile 2.",
      choices: [
        { label: "Hire the totem guy", fx: { hero: 'mark', staff: { qa: 1 }, egg: 'totem' },
          result: "In his first week Chris asks him to test a patch and will not say what is in it, because Mark is still a player and it nerfs exalted orb drops. He comes in on Saturday expecting the team, finds an empty office, runs a checklist alone and says it seems fine. The patch goes out." },
        { label: "Hire someone with a CV", fx: { staff: { qa: 1 } },
          result: "A competent tester who has never died to a Rhoa. Bugs get found. Nobody finds out why they matter." }
      ]
    },
    {
      id: 'e_stress', date: '2012-03-30', icon: 'server', who: 'Servers', title: 'Stress test weekend',
      text: "The first public weekend. Anyone can log in for three days.",
      choices: [{ label: "Open the gates", fx: { hype: 8, debt: 3, players: 1.5 }, result: "The servers stay up, mostly. Thousands of people now know what desync is." }]
    },
    {
      id: 'e_packs', date: '2012-04-04', icon: 'kiwi', who: 'Money', title: 'The money is almost gone',
      text: "Eighteen people on payroll and no income. The game is not finished. An idea. Sell beta access and shop points in advance, in tiers. Ten dollars at the bottom. At the top a thousand, and the buyer helps design a unique item.",
      reality: "Closed beta supporter packs went on sale on 4 April 2012 and raised about US$2.5 million over 35 weeks. By June the studio was breaking even on staff costs.",
      choices: [
        { label: "Sell supporter packs", fx: { unlock: ['mtx'], money: 245000, mood: 4, flags: { packs: 1 }, egg: 'kiwipack' },
          result: "US$245,000 in six days. The $25 tier comes with a pet kiwi. For the first time since 2006 you are not about to run out of money." },
        { label: "Charging for a beta feels wrong", fx: { vision: 4, unlock: ['mtx'] },
          result: "You open a small cosmetic shop with almost nothing in it. The accountant emails you a single question mark." }
      ]
    },
    {
      id: 'e_payment', date: '2012-04-09', icon: 'bug', who: 'Crisis', title: 'It took the money and gave nothing back',
      cond: function (S) { return !!S.flags.packs; },
      text: "The moment the store takes its first real payments, the payment system breaks. People are charged and get nothing. The forum fills up.",
      reality: "Jonathan Rogers told this story at ExileCon 2026. The company was about 18 people and refunded everyone. He called it the first real stress.",
      choices: [
        { label: "Everyone on the forums. Refund every single one.", fx: { mood: 7, sanity: -6, moneyW: -1 },
          result: "Eighteen people answer players one at a time until it is fixed and refunded. It stops being friends in a garage and becomes a business with customers." },
        { label: "They will get their points eventually", fx: { mood: -12, vision: -3 },
          result: "They do get their points. They also get a forum thread that outlives the payment provider." }
      ]
    },
    {
      id: 'e_d3', date: '2012-05-15', icon: 'fire', who: 'The competition', title: 'Error 37',
      text: "The biggest action RPG in the world launches today. Its servers refuse logins all night and it has an auction house that takes real money. Your second beta weekend ended two days ago.",
      reality: "Diablo III launched on 15 May 2012. Path of Exile's pitch of no pay-to-win and tradeable orbs made it the alternative. GGG later thanked the streamer Kripparrian for popularising the game.",
      choices: [
        { label: "Say nothing. Leave the signup page open.", fx: { hype: 14, players: 1.4, rep: 0.06, egg: 'error37' },
          result: "Disappointed players go looking for something darker with no cash shop for power. A hardcore streamer brings his audience with him. Signups triple." },
        { label: "Add a real-money auction house of our own", fx: { vision: -30, mood: -15, revMult: 1.25, flags: { rmah: 1 }, egg: 'rmah' },
          result: "It makes money straight away. It also turns every drop into a price tag. The other studio will shut theirs in two years. Yours stays, because the accountant loves it." }
      ]
    },
    {
      id: 'e_bex', date: '2013-08-05', icon: 'heart', who: 'Hiring', title: 'Someone to read the forum',
      text: "The forum has outgrown anyone's spare time. One applicant for community manager is 23 and puts a joke in her cover letter.",
      reality: "Bex was GGG's community lead for about ten years.",
      choices: [
        { label: "Hire her", fx: { hero: 'bex', staff: { comm: 1 } }, result: "For the next ten years, when the subreddit shouts, somebody answers." },
        { label: "The devs can post when they have time", fx: { mood: -3 }, result: "They never have time." }
      ]
    },
    {
      id: 'e_garena', date: '2013-11-14', icon: 'building', who: 'Business', title: 'Southeast Asia',
      text: "A publisher called Garena wants to run the game in Singapore, Malaysia and beyond.",
      reality: "GGG signed with Garena in November 2013. Regional realms followed, and some later closed or moved publisher.",
      choices: [
        { label: "Sign", fx: { revMult: 1.06 }, result: "A second realm, a second set of patch days, a second forum." },
        { label: "Keep one realm", fx: { vision: 2 }, result: "Everyone in Singapore keeps playing on 300 ping and telling you about it." }
      ]
    },
    {
      id: 'e_goty', date: '2013-12-09', icon: 'trophy', who: 'Press', title: 'Game of the Year',
      text: "GameSpot names it PC Game of the Year. Four million accounts, fifty-five staff, and the company is in profit. Chris is a finalist for Business Leader of the Year, which is an odd thing to happen to someone who started this to play more Diablo.",
      choices: [{ label: "Put the trophy where the kiwi can see it", fx: { flags: { trophy: 1 }, hype: 6, sanity: 6, mood: 4, egg: 'goty' }, result: "Seven years from a garage to a trophy shelf. The shelf is from a hardware store." }]
    },
    {
      id: 'e_d3ah', date: '2014-03-18', icon: 'money', who: 'The competition', title: 'They closed the auction house',
      text: "The other studio shuts its auction houses and ships a good expansion a week later. Some of your players go back for a look.",
      choices: [{ label: "Wish them well", fx: { players: 0.88, hype: -4 }, result: "Chris says competition is good for the genre. He means it. It still shows on the chart." }]
    },
    {
      id: 'e_henderson', date: '2014-09-08', icon: 'building', who: 'Property', title: 'Henderson',
      cond: function (S) { return S.office < 2; },
      text: "The office is out of desks. There is space in Henderson, West Auckland.",
      reality: "GGG has been based in Henderson since about 2014. By 2026 all 260 staff worked there.",
      choices: [
        { label: "Move the studio", fx: { office: 2, money: -90000, sanity: 4 }, result: "More floor, more desks, a car park with a supermarket attached." },
        { label: "Squeeze in", fx: { sanity: -6 }, result: "Two people now share the server cupboard. You can move later from the team panel." }
      ]
    },
    {
      id: 'e_cats', date: '2015-04-01', icon: 'cat', who: 'April 1st', title: 'A typo',
      text: "The April Fools patch notes claim a typo turned \"cast\" into \"cats\" across the trigger gems.",
      reality: "The 2015 April Fools patch really did put cats in the game. Jonathan Rogers said in 2026 that if they do a joke, he wants it to be a real feature.",
      choices: [
        { label: "Ship the cats", fx: { mood: 5, hype: 3, egg: 'cats' }, result: "Cats on Critical Strike. Players ask to keep it." },
        { label: "No jokes this year", result: "A normal Wednesday." }
      ]
    },
    {
      id: 'e_sixacts', date: '2016-06-20', icon: 'scroll', who: 'The long game', title: 'One act or six?',
      cond: function (S) { return S.fut.id === 'oriath'; },
      text: "The 3.0 plan was a fifth act. Halfway through, the team wants to throw out the three-difficulty replay and build six acts instead. The work roughly doubles.",
      reality: "The decision to build six acts instead of one came halfway through 3.0's development. It launched in August 2017 and drew half again as many players as any earlier release.",
      choices: [
        { label: "Six acts. Kill the replay.", fx: { futScale: 1.5, flags: { sixacts: 1 }, hype: 6 },
          result: "The expansion is now the biggest thing the studio has tried, with a year to go. Feed the long game or it will ship thin." },
        { label: "One act, as planned", result: "A sensible Act 5. Players keep playing the same campaign three times and keep mentioning it." }
      ]
    },
    {
      id: 'e_xbox', date: '2017-01-18', icon: 'gear', who: 'Business', title: 'Console',
      text: "Microsoft would like the game on Xbox One. It needs a controller scheme for a game with nine hundred buttons.",
      reality: "The Xbox One version was announced in January 2017 and released that August. PlayStation 4 followed in March 2019 after certification delays.",
      choices: [
        { label: "Port it", fx: { revMult: 1.06, content: -0.06, debt: 4 }, result: "It works. Console trade gets its own board, which PC players will be jealous of for eight years." },
        { label: "PC only", fx: { vision: 2 }, result: "The mouse stays undefeated." }
      ]
    },
    {
      id: 'e_ten', date: '2017-04-24', icon: 'building', who: 'Press', title: 'Ten years',
      text: "Reporters visit for the tenth anniversary. They describe an old office block beside the Henderson Pak'nSave car park, more than a hundred staff, and fourteen million people who have tried the game. Chris tells them about one in ten players ever pays.",
      choices: [{ label: "Give them the tour", fx: { mood: 3, egg: 'paknsave' }, result: "The photo they run is of the car park." }]
    },
    {
      id: 'e_manifesto', date: '2017-11-02', icon: 'scroll', who: 'The forum', title: 'The trade question',
      text: "The official trade site launches today. You can search for an item. To buy it you still have to whisper a stranger and hope they leave their map. The forum wants an auction house. It has wanted one since 2012.",
      reality: "Chris Wilson posted the trade manifesto on 2 November 2017. Instant buyout reached Path of Exile 1 in October 2025.",
      choices: [
        { label: "Write a manifesto", fx: { vision: 10, mood: -6, egg: 'manifesto' },
          result: "Easy trade shortens the item hunt, forces lower drop rates and invites bots. You write it all down. The thread runs to 95 pages. \"Read the manifesto\" becomes a complete sentence." },
        { label: "Promise to look into it", fx: { mood: 3, vision: -4 },
          result: "You have now promised. The request moves to the top of the board and stays there." }
      ]
    },
    {
      id: 'e_royale', date: '2018-03-12', icon: 'skull', who: 'April 1st', title: 'Battle royale',
      text: "It is 2018 and every game is becoming a battle royale. April Fools is in three weeks.",
      reality: "Path of Exile: Royale was a playable April Fools mode in 2018, with 27,989 matches in 31 hours. It came back for weekends in 2021.",
      choices: [
        { label: "Build a real one. A hundred players, one beach.", fx: { hype: 8, sanity: -4, content: -0.04, egg: 'royale' },
          result: "You rename the game on Steam for the day. The joke is that it works." },
        { label: "Post a fake screenshot", fx: { hype: 2 }, result: "People smile and scroll on." }
      ]
    },
    {
      id: 'e_tencent', date: '2018-05-21', icon: 'building', who: 'Business', title: 'An offer',
      text: "Tencent, your publisher in China, wants to buy most of the company. The price is not public. It is over a hundred million. They promise you keep running the studio your way.",
      reality: "Tencent took a majority stake in May 2018, reported at about 80%, and owned 100% by 2024. GGG promised no pay-to-win and kept operating from Henderson.",
      choices: [
        { label: "Sell a majority", fx: { flags: { tencent: 1, ownerShare: 0.8 }, mood: -8, sanity: 8, revMult: 1.15, egg: 'tencent' },
          result: "The founders are rich. The studio's bank balance has not changed, because that is how selling shares works. From now on four dollars in every five of profit leave as dividends. The subreddit decides the game is pay-to-win now and waits for proof." },
        { label: "Stay independent", fx: { vision: 6, mood: 5, flags: { indie: 1 }, egg: 'indie' },
          result: "You keep the company. You also keep doing your own publishing deals, your own payroll and your own worrying." }
      ]
    },
    {
      id: 'e_phones', date: '2018-11-03', icon: 'fire', who: 'The competition', title: 'Do you guys not have phones?',
      text: "Another studio's convention ends with a mobile game and a booing crowd. You had planned to announce a mobile experiment of your own this year.",
      reality: "Blizzard revealed Diablo Immortal in November 2018. GGG later joked the backlash made it shelve its own 2018 mobile announcement.",
      choices: [
        { label: "Shelve the announcement. Say nothing.", fx: { hype: 12, players: 1.1, egg: 'phones' },
          result: "Thousands of players from the other game arrive in time for the next league. A year later you open your own mobile reveal with a joke about it." },
        { label: "Announce Path of Exile Mobile next week", fx: { mood: -10, hype: -5 },
          result: "The top comment is one question. You know which one." }
      ]
    },
    {
      id: 'e_pob', date: '2018-11-08', icon: 'gear', who: 'Hiring', title: 'The spreadsheet guy',
      text: "Players do not use your character sheet. They use a free offline planner made by one programmer in his spare time. They call it the real game.",
      reality: "GGG hired the Path of Building author on 8 November 2018 and said the tool would stay unofficial.",
      choices: [
        { label: "Hire him", fx: { hero: 'pob', staff: { code: 1 }, mood: 4, egg: 'pob' },
          result: "He joins as a gameplay programmer. The tool stays unofficial. Players keep doing their homework in it before every league." },
        { label: "Send a cease and desist", fx: { mood: -14 },
          result: "The top post is your letter with four thousand comments under it. You withdraw the letter." }
      ]
    },
    {
      id: 'e_gdc', date: '2019-03-22', icon: 'stage', who: 'Conference', title: 'Played forever',
      text: "Chris gives a talk in San Francisco about how to design a game people play for ever. Thirteen-week seasons, reuse everything, let the dice build the levels.",
      reality: "The GDC 2019 talk was called \"Designing Path of Exile to Be Played Forever\".",
      choices: [{ label: "Take a bow", fx: { rep: 0.04, hype: 3 }, result: "Other studios take notes. Two of them start a league system the next year." }]
    },
    {
      id: 'e_crunch', date: '2019-06-17', icon: 'clock', who: 'The team', title: 'Bigger leagues',
      text: "Players compare every league to the best one and ask why they are not all that size. The honest answer is hours.",
      reality: "In 2019 Chris Wilson wrote that he would not run the studio on crunch to make leagues bigger.",
      choices: [
        { label: "We will not run this company on crunch", fx: { sanity: 10, mood: -3, flags: { nocrunch: 1 }, egg: 'nocrunch' },
          result: "You say it in public. Some leagues will be smaller. People will go home at night." },
        { label: "Passion has no clock", fx: { sanity: -12, content: 0.12 }, result: "The league is bigger. So are the bags under everyone's eyes." }
      ]
    },
    {
      id: 'e_exilecon19', date: '2019-11-16', icon: 'stage', who: 'ExileCon', title: 'ExileCon',
      text: "Auckland, November 2019. Fourteen hundred people have flown to New Zealand to watch a keynote. Chris has joked it could turn into Fyre Festival. The planning advice came from other studios' conventions. One of them mostly wanted to talk about alcohol management.",
      reality: "ExileCon 2019 revealed Path of Exile 2 as the 4.0 mega-expansion, with a beta hoped for late 2020. Chris's thank-you post said over a million unique viewers saw the keynote.",
      choices: [{
        label: "Walk on stage and announce the sequel",
        fx: { moneyW: -5, sanity: 8, flags: { exilecon: 1 }, egg: 'exilecon', fn: function (S, chip) {
          var f = root.GGG.engine.activeFuture(S), ok = f && S.fut.pts / (f._target * (S.fut.scale || 1)) >= 0.22;
          S.hype = Math.min(100, S.hype + (ok ? 24 : 10)); S.rep = Math.min(2, S.rep + (ok ? 0.08 : 0.02));
          S.flags.demoGood = ok ? 1 : 0;
          chip('Hype +' + (ok ? 24 : 10), true);
        } },
        result: function (S) {
          return S.flags.demoGood
            ? "Path of Exile 2, a mobile game whose trailer mocks mobile games, and a new expansion, all in one keynote. The demo holds up under a thousand hands. It is the most goodwill the studio has ever had in one room."
            : "Path of Exile 2 is announced. The demo is two rooms and a boss, because the long game has been starved. The crowd cheers anyway. The crowd is very kind.";
        }
      }]
    },
    {
      id: 'e_lockdown', date: '2020-03-26', icon: 'garage', who: 'New Zealand', title: 'Everyone go home',
      text: "New Zealand goes into national lockdown. A hundred and forty people carry their PCs to their cars.",
      reality: "GGG worked from home through the 2020 lockdowns, and the Path of Exile 2 beta slipped from its late-2020 target.",
      choices: [
        { label: "Work from home. Let the sequel slip.", fx: { sanity: -6, future: -0.02, flags: { wfh: 1 } },
          result: "Leagues keep shipping from kitchens. The 2020 beta date quietly stops being mentioned." },
        { label: "Keep every date", fx: { sanity: -14, future: 0.02 }, result: "Every date holds. Every person frays." }
      ]
    },
    {
      id: 'e_bafta', date: '2020-04-02', icon: 'trophy', who: 'Awards', title: 'Best Evolving Game',
      text: "A BAFTA, for Best Evolving Game. The ceremony is a video call.",
      choices: [{ label: "Accept it from the kitchen", fx: { flags: { trophy: 1 }, sanity: 5, hype: 4 }, result: "Someone holds the kiwi up to the webcam." }]
    },
    {
      id: 'e_cyberpunk', date: '2020-10-27', icon: 'clock', who: 'The calendar', title: 'Another game moved',
      cond: inCycle('c_ritual'),
      text: "The biggest release of the year just moved its date to the 10th of December. Your expansion was set for the 11th.",
      reality: "CD Projekt delayed Cyberpunk 2077 to 10 December 2020, a day before 3.13's planned date. GGG moved to January and had its best launch to date.",
      choices: [
        { label: "Move to January", fx: { hype: 6, mood: 2, egg: 'cyberpunk' },
          result: "You tell the players exactly why. December gets a few short event leagues. The extra month goes into the expansion." },
        { label: "Hold the date. We blink for nobody.", fx: { delay: -5, peak: 0.8, vision: 4 },
          result: "You launch the day after the biggest game of the year. A lot of people are busy." }
      ]
    },
    {
      id: 'e_priority', date: '2021-04-17', icon: 'server', who: 'Launch day', title: 'The queue',
      text: "A missed step in the deploy has the login queue crawling and kicking people out. Waits pass two hours. You paid streamers for two hours of launch coverage and they are stuck in it as well.",
      reality: "This happened at the Ultimatum launch on 16 April 2021. Chris Wilson apologised, called it clearly a mistake, and still lists it among his.",
      choices: [
        { label: "Let the streamers skip the queue", fx: { mood: -15, vision: -3, flags: { priority: 1 }, egg: 'priority' },
          result: "Tens of thousands of people in a queue watch other people play the game they cannot get into. The megathread passes thirteen thousand upvotes. You apologise and promise it will never happen again." },
        { label: "Everyone waits. Eat the marketing spend.", fx: { moneyW: -2, mood: -3, sanity: -4 },
          result: "The streamers broadcast a queue for two hours. Oddly, it is good content." }
      ]
    },
    {
      id: 'e_baeclast', date: '2021-08-10', icon: 'stage', who: 'The community', title: 'The podcast',
      cond: function (S) { return !!S.flags.nerf315; },
      text: "The community podcast wants you on, live, to answer for 3.15. No script.",
      reality: "Chris Wilson went on Baeclast in August 2021 to answer for the 3.15 changes.",
      choices: [
        { label: "Go on", fx: { mood: 6, sanity: -4, egg: 'baeclast' },
          result: "Two hours of hard questions. You concede the mana costs went too far. People are still angry, but now at someone who showed up." },
        { label: "Decline", fx: { mood: -5 }, result: "They do the episode without you. It is longer." }
      ]
    },
    {
      id: 'e_sorcery', date: '2022-03-14', icon: 'card', who: 'Departures', title: 'Sorcery',
      cond: function (S) { return S.founders === 3; },
      text: "Erik's side project, a hand-painted card game, raises millions on Kickstarter. After about seventeen years of making Wraeclast too dark to see, he is leaving to run it.",
      reality: "Erik Olofsson left around 2022 to make Sorcery: Contested Realm. In 2026 he named the original character selection and login screens as the work he is quietly proud of.",
      choices: [{ label: "Wish him luck", fx: { staff: { art: -1 }, sanity: -6, egg: 'sorcery' }, result: "The grim look he set stays. So does his login screen." }]
    },
    {
      id: 'e_aus', date: '2022-07-04', icon: 'money', who: 'Government', title: 'Thirty percent',
      text: "Australia now refunds game studios thirty percent of what they spend. New Zealand offers nothing. Recruiters in Melbourne have your staff list.",
      reality: "Chris Wilson said in 2022 that GGG was tempted by Australia's tax offset. New Zealand's 20% rebate began in April 2023 and GGG received the $3m maximum.",
      choices: [
        { label: "Stay in Henderson and lobby Wellington", fx: { staffPct: -0.03, vision: 2, flags: { lobby: 1 } },
          result: "You lose a few people across the Tasman and say so in the newspaper. Nine months later New Zealand announces a rebate of its own." },
        { label: "Open an office in Australia", fx: { moneyW: -6, revMult: 1.04, sanity: -4 }, result: "A second office, a second set of everything." }
      ]
    },
    {
      id: 'e_whathappened', date: '2022-08-26', icon: 'scroll', who: 'The subreddit', title: 'What happened with items',
      cond: function (S) { return !!S.flags.kalandra; },
      text: "A week in. Players have the drop rates in spreadsheets. You have to say something.",
      choices: [
        { label: "Explain everything, with percentages, and add some loot back", fx: { mood: 5, sanity: -5 },
          result: "A long post. More unique drops, more basic currency. Players dispute it line by line. You admit you had not understood how big the change was." },
        { label: "Revert the lot", fx: { mood: 13, vision: -12 }, result: "The floor is covered in items again. The designers go quiet for a month." },
        { label: "Working as intended", fx: { mood: -10, vision: 8, ret: 0.9 }, result: "The league empties out. You were right, in an empty room." }
      ]
    },
    {
      id: 'e_rebate', date: '2023-04-03', icon: 'money', who: 'Government', title: 'The rebate',
      cond: function (S) { return !!S.flags.lobby; },
      text: "New Zealand's game development rebate starts. Twenty percent back, capped at three million a year.",
      choices: [{ label: "Claim the maximum", fx: { money: 1900000 }, result: "You hit the cap in the first quarter." }]
    },
    {
      id: 'e_d4', date: '2023-06-06', icon: 'fire', who: 'The competition', title: 'Sanctuary',
      text: "The other studio's new game is out and selling in the millions.",
      reality: "Diablo IV launched in June 2023. GGG's leads said they felt sorry for their counterparts during its rough first season.",
      choices: [{ label: "Say competition is good for the genre", fx: { players: 0.9, hype: 8, egg: 'd4' },
        result: "Your numbers dip for a month. One of your racers takes their first hardcore level 100, which the subreddit enjoys. By their first season patch, their players are asking yours for advice." }]
    },
    {
      id: 'e_exilecon23', date: '2023-07-29', icon: 'stage', who: 'ExileCon', title: 'One more thing',
      cond: function (S) { return S.fut.id === 'poe2'; },
      text: "ExileCon 2023. For four years the plan was that Path of Exile 2 replaces the campaign inside the same game. The two have grown apart. Jonathan wants to say so on stage.",
      reality: "At ExileCon 2023 GGG announced Path of Exile 2 as a separate game, with a closed beta promised for June 2024. That beta did not happen.",
      choices: [
        { label: "Split them. Two games.", fx: { futScale: 1.3, hype: 18, flags: { split: 1 }, moneyW: -5, egg: 'split' },
          result: "Path of Exile 2 is its own game with its own campaign and economy. The crowd cheers. Every demo PC is taken in ten minutes. You now run two live games with one studio, and the room has not done that sum yet." },
        { label: "Keep it as one game", fx: { hype: 8, vision: 4, moneyW: -5 },
          result: "4.0 stays an expansion. It will replace a game people have played for ten years, and they have feelings about that." }
      ]
    },
    {
      id: 'e_bexleaves', date: '2023-08-03', icon: 'heart', who: 'Departures', title: 'Ten years',
      cond: function (S) { return S.heroes.indexOf('bex') >= 0; },
      text: "Bex is leaving after ten years. The farewell thread fills with thanks, and some worry about what the community has turned into.",
      reality: "Bex announced her departure on 3 August 2023. She later said she did not leave because of the community.",
      choices: [{ label: "Thank her", fx: { mood: -3, sanity: -5, fn: function (S) { dropHero(S, 'bex'); } }, result: "Older players will date things as \"back when Bex posted\"." }]
    },
    {
      id: 'e_chris', date: '2023-12-18', icon: 'garage', who: 'Departures', title: 'Stepping back',
      text: "Chris has run the studio for seventeen years. He wants to make things again, and he does not want to be chief executive of two hundred people while he does it. He will step away quietly, with no announcement.",
      reality: "Chris Wilson's own site says he stepped down at the end of 2023. Company filings recorded it in January 2025 and the press noticed a month later.",
      choices: [{ label: "Hand over the keys", fx: { sanity: -4, flags: { chrisgone: 1 }, egg: 'whereischris' },
        result: "He stops appearing in reveals. It takes the forum about a year to ask where he went. Jonathan runs the company now. Mark runs Path of Exile 1." }]
    },
    {
      id: 'e_lastepoch', date: '2024-02-21', icon: 'clock', who: 'The competition', title: 'A friendly rival',
      text: "An indie action RPG hits 1.0 and sells very well. Its trade system has two modes and players pick one. People keep sending you the link.",
      choices: [{ label: "Play it at lunch", fx: { hype: -4, players: 0.94 }, result: "It is good. Half the office has a character by Friday." }]
    },
    {
      id: 'e_tencent100', date: '2024-03-11', icon: 'building', who: 'Business', title: 'The last shares',
      cond: function (S) { return !!S.flags.tencent; },
      text: "The founders sell what they have left. Tencent owns all of it.",
      reality: "Tencent's holding reached 100% in 2024. For the year to September 2024, GGG paid NZ$98.7 million in dividends on NZ$38.6 million of profit.",
      choices: [{ label: "Sign", fx: { flags: { ownerShare: 0.9 } }, result: "From now on nine dollars in ten of profit leave as dividends." }]
    },
    {
      id: 'e_beta24', date: '2024-06-07', icon: 'clock', who: 'The long game', title: 'June 2024',
      cond: function (S) { return S.fut.id === 'poe2'; },
      text: "A closed beta for the sequel was promised for this month. It is not ready.",
      choices: [
        { label: "Skip the beta. Sell early access at the end of the year.", fx: { hype: -6, mood: -4 }, result: "You move the goalposts once and try to make it the last time." },
        { label: "Run a tiny invite-only beta anyway", fx: { future: -0.03, hype: 3 }, result: "Forty streamers play a build held together with tape. It leaks in an hour." }
      ]
    },
    {
      id: 'e_eadelay', date: '2024-10-29', icon: 'server', who: 'The long game', title: 'Three more weeks',
      cond: inCycle('c_poe2ea'),
      text: "Early access was dated for 15 November. The game is ready. The account system that carries purchases across both games and the consoles is not, and nobody has load-tested it.",
      reality: "GGG delayed early access by three weeks to 6 December 2024 for backend work, and pushed Path of Exile 1's 3.26 into 2025.",
      choices: [
        { label: "Delay to 6 December and say why", fx: { mood: -3, debt: -6, fn: ready },
          result: "Three weeks. Also, the next league for the old game moves to next year. That part of the post gets the most comments." },
        { label: "Hold the 15th", fx: { delay: -3, debt: 12, mood: 2, fn: ready }, result: "You launch on the 15th with a login system nobody has stress-tested. Good luck." }
      ]
    },
    {
      id: 'e_admin', date: '2025-01-10', icon: 'bug', who: 'Security', title: 'The admin account',
      text: "Someone talked Steam's support desk into handing over an old account. It was linked to one of your admin logins. At least 66 player accounts have had their passwords reset and their items taken.",
      reality: "This happened in January 2025. GGG apologised, unlinked Steam from staff accounts and tightened access. The stolen items were not restored.",
      choices: [
        { label: "Own it in public and lock everything down", fx: { mood: -4, debt: -4, sanity: -5, egg: 'admin' },
          result: "You apologise and restrict the admin tools. The stolen items stay stolen." },
        { label: "Fix it without a statement", fx: { mood: -12 }, result: "A journalist finds out anyway. Now it is a cover-up." }
      ]
    },
    {
      id: 'e_hold', date: '2025-01-28', icon: 'clock', who: 'Two games', title: 'The other game',
      cond: inCycle('c_hunt'),
      text: "Path of Exile 1's next league was due months ago. Its team has been on loan to the sequel since before early access, and the 0.2.0 patch still needs them.",
      reality: "Jonathan Rogers posted a video apology in late January 2025. Settlers of Kalguur ran from July 2024 to June 2025.",
      choices: [
        { label: "Keep them on the sequel. Apologise on video.", fx: { mood: -9, content: 0.2, sanity: -4, egg: 'apology' },
          result: "Jonathan sits in front of a camera and says the league is on hold, that he was overconfident, and that he should have pushed back. Settlers will run for 46 weeks." },
        { label: "Send them back to the old game now", fx: { mood: 5, content: -0.15 },
          result: "Path of Exile 1 gets its league sooner. The sequel's first big patch goes out thin." }
      ]
    },
    {
      id: 'e_phrecia', date: '2025-02-20', icon: 'card', who: 'Stopgap', title: 'Phrecia',
      text: "A stopgap event for the old game. Every ascendancy class is swapped for a strange alternate from the pile of ideas that never left the whiteboard.",
      choices: [{ label: "Ship the whiteboard", fx: { mood: 4, players: 1.05 }, result: "Players spend a month on builds that should not exist. It buys you until June." }]
    },
    {
      id: 'e_light', date: '2025-06-30', icon: 'garage', who: 'Old friends', title: 'Light Pattern',
      text: "Chris gives an interview to the man who made Diablo and announces a new studio. About ten people, something small. He says his happiest memories of all this are from the garage.",
      reality: "Chris Wilson announced Light Pattern in mid-2025, on Diablo II's 25th anniversary, in an interview with David Brevik.",
      choices: [{ label: "Send a card", fx: { sanity: 2, egg: 'lightpattern' }, result: "The card has a kiwi on it." }]
    },
    {
      id: 'e_hotfix', date: '2026-06-04', icon: 'server', who: 'Crisis', title: 'Hotfix 0.5.0b',
      text: "A small hotfix goes out at 10:45 on a weekday morning. A data file for the passive tree is missing from the build. Servers crash. The rollback stalls because crash dumps have filled the disks, which has never happened before.",
      reality: "GGG published a full incident report for the 0.5.0b outage of 4 June 2026. Service was back in 69 minutes.",
      choices: [
        { label: "Publish the full incident report", fx: { mood: 5, debt: -5, sanity: -4, egg: 'postmortem' },
          result: "The write-up names the missing file and the full disks. Players who run servers for a living nod along." },
        { label: "Call it human error", fx: { mood: -5, egg: 'humanerror' }, result: "The community's favourite two words. They have them on a mug." }
      ]
    },
    {
      id: 'e_lotus', date: '2026-07-13', icon: 'card', who: 'Old friends', title: 'Fourteen',
      text: "Chris posts a video of his rebuilt Magic collection. Years ago he sold cards to help pay for the studio. He now owns fourteen Black Lotuses.",
      reality: "The July 2026 video showed one of the largest Magic collections in the world.",
      choices: [{ label: "Do the maths on that", fx: { egg: 'lotus' }, result: "Players start pricing Mirrors of Kalandra in Lotuses. The exchange rate is not kind to the Mirror." }]
    },
    {
      id: 'e_gamescom', date: '2026-08-25', icon: 'stage', who: 'Marketing', title: 'The eleventh of December',
      text: "Gamescom. The sequel leaves early access on 11 December, free to play, and it ships with swords. Two years without the most common weapon in fantasy are over.",
      reality: "GGG announced the full-release date at gamescom Opening Night Live on 25 August 2026.",
      choices: [{ label: "Say the date out loud", fx: { hype: 10, egg: 'swords' }, result: "Now it is a promise. There is a whiteboard for those." }]
    }
  ];

  /* Fired by the engine itself. */
  D.system = [
    {
      id: 'sys_broke', repeat: true, icon: 'money', who: 'The accountant', title: 'The account is empty',
      text: "Payroll is due and the bank says no.",
      choices: [
        { label: "Rush out an emergency supporter pack", cond: function (S) { return !!S.flags.u_mtx; }, fx: { moneyW: 14, mood: -5 },
          result: "It has wings on it. It sells. The top comment asks whether you are okay." },
        { label: "Call the investors", fx: { moneyW: 18, revMult: 0.96 }, result: "They wire it. They also want a slice of everything from now on." },
        { label: "Lay off a fifth of the studio", fx: { staffPct: -0.2, sanity: -15, moneyW: 8 }, result: "The office is quieter. Nobody uses the good coffee machine." }
      ]
    },
    {
      id: 'sys_notready', repeat: true, icon: 'clock', who: 'Production', title: 'It is not ready',
      text: "Launch is days away and the release is well short of done.",
      choices: [
        { label: "Ship it. Fix it live.", fx: { mood: -2 }, result: "Version x.x.0b is already in the build queue." },
        { label: "Delay two weeks", fx: { delay: 2, hype: -8, mood: -4 }, result: "The countdown resets. So does the subreddit's patience." },
        { label: "Crunch", fx: { content: 0.15, sanity: -12 }, result: "Pizza boxes. A sleeping bag appears under a desk." }
      ]
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
