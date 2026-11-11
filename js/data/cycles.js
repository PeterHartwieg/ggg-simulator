/* One entry per release, in order. Dates and Steam peaks are the real ones
   (see research/01-ggg-poe-timeline.md). "est" marks a baseline with no public figure.
   The jokes are ours. The "reality" lines are what actually happened. */
(function (root) {
  'use strict';
  var D = root.GGG.data;

  D.cycles = [
    {
      id: 'c_proto', kind: 'proto', ver: 'Pre-alpha', name: 'The Prototype', date: '2008-11-01', icon: 'garage',
      blurb: "November 2006. A garage in New Lynn, West Auckland. Chris has savings from a software security job. Jonathan has an engine in his head. You both have a Diablo II habit and no new game to feed it. The plan is to build an online action RPG, in secret, before the money runs out.",
      reality: "GGG worked in secret from 2006 to 2010. The founders paid for it themselves, with help from a few private investors in the US.",
      dilemma: {
        text: "First decision. What are you building?",
        choices: [
          { label: "An online action RPG for people who still play Diablo II", hint: "Nobody else is making one.", fx: { vision: 8 },
            result: "Nobody else is making one. That is the whole business plan, and for the next four years it is enough.",
            reality: "Jonathan Rogers said at ExileCon 2026 that the team never doubted the game would succeed if they finished it. The only fear was running out of money first." },
          { label: "An MMO. With mounts.", fx: { debt: 8, vision: -6 },
            result: "Jonathan looks at you for a long time. Then he opens the editor and starts on an action RPG anyway. You have lost a week and some respect." },
          { label: "A mobile game", fx: { vision: -6, sanity: -3, egg: 'phones' },
            result: "It is 2006. The iPhone comes out next year. Do you guys not have phones? You have Nokias. You make the action RPG." }
        ]
      }
    },
    {
      id: 'c_alpha', kind: 'proto', ver: 'Alpha', name: 'The Alpha', date: '2010-06-01', icon: 'gear',
      blurb: "The prototype runs. A man hits a zombie and the zombie falls over. Now it needs skill gems, a passive tree, a first act and a server your friends and family can log in to. If they start trading with each other without being asked, you have a game.",
      reality: "The friends and family alpha started around June 2010. Watching testers trade and grind on their own convinced Chris the game worked.",
      dilemma: {
        text: "The game will be online only, so it needs a business model. Which one?",
        choices: [
          { label: "Free to play. Sell looks, never power.", hint: "Ethical microtransactions. Whatever those are.", fx: { vision: 8, flags: { f2p: 1 } },
            result: "Free game, paid cosmetics, no pay-to-win. In 2010 most free games sell power, so this sounds either principled or broke. You are both.",
            reality: "Asked in 2026 what he was quietly proud of, Chris Wilson named launching free to play without pay-to-win when most competitors were pay-to-win." },
          { label: "Box price, $40", fx: { hype: -4, moneyW: -4, flags: { f2p: 1 } },
            result: "You email eleven publishers. Two reply. One asks whether New Zealand has broadband. You go free to play after all, four weeks poorer." },
          { label: "Free to play. Sell power.", fx: { vision: -25, revMult: 1.25, flags: { p2w: 1 }, egg: 'p2w' },
            result: "The spreadsheet looks great. Somewhere a forum you have not launched yet is already angry." }
        ]
      }
    },
    {
      id: 'c_cb', kind: 'beta', ver: '0.9.0', name: 'Closed Beta', date: '2011-08-10', realPeak: 3000, est: true, icon: 'server', unlock: ['servers'],
      blurb: "Announced, shown at PAX, and nobody has played it at home yet. Closed beta is two acts with no trade screen and no shop. The server capacity is a guess.",
      reality: "Closed beta began in August 2011 with version 0.9.0.",
      dilemma: {
        text: "Thousands of people signed up. The servers will not hold thousands of people. How do you let them in?",
        choices: [
          { label: "A timer on the website picks one random signup every few minutes", fx: { hype: 8, sanity: 2, egg: 'timer' },
            result: "People leave the page open all day to watch a countdown hand strangers a beta key. It is the most played feature you have.",
            reality: "The real closed beta did exactly this. The beta key timer drip-fed invites so the servers never got swamped." },
          { label: "Open the doors", fx: { peak: 1.6, debt: 10, mood: -6, sanity: -6 },
            result: "Everyone gets in. Nobody gets to play. The realm restarts until Tuesday." },
          { label: "Friends of friends only", fx: { hype: -8, polish: 0.1 },
            result: "A quiet, well-behaved beta. Too quiet." }
        ]
      },
      posts: [
        { t: "Got my key from the timer after 9 days of staring at it", f: 'Fluff' },
        { t: "Desync killed me through a door I had already closed", f: 'Complaint', c: "/oos" }
      ]
    },
    {
      id: 'c_ob', kind: 'beta', ver: '0.10.0', name: 'Open Beta', date: '2013-01-23', realPeak: 69850, icon: 'server',
      blurb: "Open beta. Free for everyone, the first half of Act 3, the cosmetic shop opens, and you are promising this is the last time anyone's characters get wiped. About fifty thousand people are waiting to download a 1.5 GB patch the second it goes up.",
      reality: "Open beta launched 23 January 2013. Concurrency reached 69,850 before the realm fell over. The closed beta supporter packs ended the same day, having raised about US$2.5 million in 35 weeks.",
      dilemma: {
        text: "Launch is tomorrow. The content delivery network is on the cheap plan. Upgrade it?",
        choices: [
          { label: "It will be fine", fx: { mood: -5, sanity: -6, debt: 5, egg: 'cdn' },
            result: "Fifty thousand people download 1.5 GB at once. The CDN chokes. The realm falls over several times and a login bug forces a shutdown. Developers answer support tickets by hand.",
            reality: "That is what happened. Launch-day web traffic matched the whole first year after the announcement." },
          { label: "Pay for the big plan", fx: { moneyW: -6, mood: 3 },
            result: "The patch downloads. The realm still wobbles, because now everyone gets in at the same moment. You moved the fire one room over." }
        ]
      },
      posts: [
        { t: "No more wipes. My level 34 Marauder is forever", f: 'Fluff' },
        { t: "Realm down again", f: 'Complaint', c: "small indie company", when: 'crash' },
        { t: "Came from Diablo 3. Where is the auction house?", f: 'Question', c: "You are going to love the forums." }
      ]
    },
    {
      id: 'c_anarchy', kind: 'league', ver: '0.11.0', name: 'Anarchy and Onslaught', date: '2013-06-07', realPeak: 38000, est: true, icon: 'skull',
      blurb: "Players finish Act 3, hit the level cap and leave. The economy on the permanent realm is already full of items nobody needs.",
      reality: "Anarchy and Onslaught were the first challenge leagues. Only 61 players finished all eight challenges.",
      dilemma: {
        text: "How do you bring them back?",
        choices: [
          { label: "Four-month challenge leagues. Fresh economy, a twist, and then it ends.", fx: { rep: 0.05, vision: 5, flags: { leagues: 1 }, egg: 'leagues' },
            result: "Anarchy sends rogue exiles after players. Onslaught makes monsters faster and deaths permanent. Everyone starts from zero on the same day. Without quite meaning to, you have planned your next thirteen years." },
          { label: "More acts, faster", fx: { content: -0.15, sanity: -5 },
            result: "Acts take a year each. Players finish them in an evening. You do the maths, then you do leagues anyway." },
          { label: "Reset the ladder and nothing else", fx: { ret: 0.85, hype: -5 },
            result: "It works for the two hundred people who race. Everyone else shrugs." }
        ]
      },
      posts: [
        { t: "Rogue exile killed me in The Ledge. 10/10 league", f: 'Fluff' },
        { t: "61 people finished all 8 challenges. Do they have jobs?", f: 'Discussion' }
      ]
    },
    {
      id: 'c_release', kind: 'release', ver: '1.0.0', name: 'Release', date: '2013-10-23', realPeak: 34371, icon: 'trophy',
      blurb: "Version 1.0. The end of Act 3 with Dominus on top of his tower, a seventh class, guilds and two new leagues. Nobody can blame the beta from here on.",
      reality: "1.0 launched on Steam on 23 October 2013 with a Steam peak of 34,371. By December the studio had about 55 staff, four million accounts, GameSpot's PC Game of the Year and a profit. Chris called the profit a big relief.",
      onLaunch: { flags: { foundersPaid: 1 } },
      dilemma: {
        text: "Release day. Do you put it on Steam?",
        choices: [
          { label: "Yes, same day", fx: { hype: 6, egg: 'steam' },
            result: "Steam takes its cut and sends you a crowd. From now on the whole internet can watch your player count fall three weeks after every launch, on a public graph." },
          { label: "Own client only. Keep the 30%.", fx: { peak: 0.7, rev: 1.2, vision: 3 },
            result: "You keep every dollar. There are fewer dollars." }
        ]
      },
      posts: [
        { t: "Dominus says this world is an illusion. I am desynced inside a wall, so yes", f: 'Meme' },
        { t: "Touch of God one-shot my hardcore character through max block", f: 'Complaint', c: "he literally announces it" },
        { t: "Found a belt called Headhunter. Is it good?", f: 'Question', c: "vendor it" }
      ]
    },
    {
      id: 'c_vaal', kind: 'expansion', ver: '1.1.0', name: 'Sacrifice of the Vaal', date: '2014-03-05', realPeak: 19489, icon: 'orb',
      blurb: "The first expansion. Corrupted side areas, a queen called Atziri at the bottom of them, and an orb that changes an item in a way nobody can predict or undo.",
      reality: "Sacrifice of the Vaal launched 5 March 2014. The Invasion league that came with it killed hardcore characters so often that players still bring it up.",
      dilemma: {
        text: "The designers want the Vaal Orb to be able to ruin an item for good. Ship it like that?",
        choices: [
          { label: "Ship it. Regret is content.", fx: { vision: 7, hype: 4, flags: { vaal: 1 } },
            result: "A player corrupts the best amulet on the server into a worse amulet and posts the clip. It gets more views than the trailer. A new button appears on your desk." },
          { label: "Add an undo button", fx: { vision: -9, mood: 3, flags: { vaal: 1 } },
            result: "Nobody is ever sad. Nobody ever posts a clip either." }
        ]
      },
      posts: [
        { t: "Vaal or no balls?", f: 'Question', c: "you know the answer" },
        { t: "An Invasion boss followed me into the next zone and then into my dreams", f: 'Complaint' }
      ]
    },
    {
      id: 'c_masters', kind: 'expansion', ver: '1.2.0', name: 'Forsaken Masters', date: '2014-08-20', realPeak: 24493, icon: 'heart',
      blurb: "Seven masters who hand out missions, a crafting bench, and a private hideout to put it all in. It is the biggest budget you have ever signed off.",
      reality: "Forsaken Masters introduced Zana, whose greeting became the most quoted line in the game. GGG later said this expansion's budget, huge at the time, equals about a week of spending by 2018.",
      dilemma: {
        text: "Hideouts. Every player will want one. The business side has an idea.",
        choices: [
          { label: "Hideouts are free. Sell the furniture.", fx: { mood: 6, rev: 1.05, flags: { hideouts: 1 }, egg: 'sane' },
            result: "Players spend forty hours arranging rugs in a game about killing demons. One of the masters greets them each time by asking if they are still sane. It catches on." },
          { label: "Hideouts cost money", fx: { mood: -9, vision: -6, rev: 1.25 },
            result: "Revenue is up. So is a forum thread called Path of Paywall, now on page 40." }
        ]
      },
      posts: [
        { t: "\"Still sane, exile?\" No, Zana. I have run 30 Dried Lakes today", f: 'Meme', hot: true },
        { t: "Vorici wants 1,500 fusings for a six-link. I got there in 3,912", f: 'Complaint', c: "mine took 4. sorry" },
        { t: "My hideout has 600 decorations and my character has no boots", f: 'Fluff' }
      ]
    },
    {
      id: 'c_torment', kind: 'league', ver: '1.3.0', name: 'Torment and Bloodlines', date: '2014-12-12', realPeak: 13689, icon: 'skull',
      blurb: "A winter patch. Ghosts possess monsters, packs share nasty modifiers, and there is a plan to make PvP a real thing with tournaments.",
      reality: "1.3.0 had the lowest Steam launch on record at 13,689. The PvP tournaments and their Twitch channel did not last.",
      dilemma: {
        text: "How much of the team goes on PvP?",
        choices: [
          { label: "A real push. Arenas, tournaments, a Twitch channel.", fx: { content: -0.12, vision: 3 },
            result: "The tournaments are well run. Dozens of people watch. The rest of the playerbase is in Dried Lake and does not look up." },
          { label: "PvP is a checkbox. Spend the time on the leagues.", fx: { content: 0.1 },
            result: "The leagues are better for it. The eleven PvP players write a manifesto of their own." }
        ]
      },
      posts: [
        { t: "A Bloodlines pack killed me after it was already dead", f: 'Complaint' },
        { t: "Is the game dying? Steam chart inside", f: 'Discussion', c: "see you in 2.0" }
      ]
    },
    {
      id: 'c_awakening', kind: 'expansion', ver: '2.0.0', name: 'The Awakening', date: '2015-07-10', realPeak: 32284, icon: 'gear',
      blurb: "Act 4, jewels for the passive tree, divination cards. And the thing players have asked for since 2011, a real fix for desync, if Jonathan has worked one out by now. There is a button for that on the requests board.",
      reality: "The Awakening shipped lockstep networking, which GGG credits with fixing the game's notorious desync. It took about eight years from the first line of code.",
      onLaunch: function (S) {
        return S.req.desync && S.req.desync.built != null
          ? { post: { t: "Lockstep mode. I am standing where I am standing. Thank you Jonathan", f: 'Fluff', hot: true } }
          : { mood: -9, post: { t: "2.0 is out and I still died in a room I left ten seconds ago", f: 'Complaint', hot: true, c: "/oos /oos /oos" } };
      },
      posts: [
        { t: "Divination cards. Collect 8 of a thing to get the thing. Fine", f: 'Discussion' },
        { t: "Malachai killed me in every phase including the cutscene", f: 'Complaint' }
      ]
    },
    {
      id: 'c_talisman', kind: 'league', ver: '2.1.0', name: 'Talisman', date: '2015-12-11', realPeak: 22345, icon: 'clock',
      blurb: "The plan was Ascendancy for Christmas. Ascendancy needs three more months.",
      reality: "Talisman started the 13-week cycle. Chris Wilson later said watching players leave after each release was horrifying until one full cycle showed that they returned.",
      dilemma: {
        text: "What ships in December?",
        choices: [
          { label: "A small league on its own, on time. Then another one thirteen weeks later.", fx: { flags: { cycle13: 1 }, rep: 0.04, sanity: 4, egg: 'weeks13' },
            result: "Talisman goes out alone. Players leave after a month, which is horrifying. Thirteen weeks later they all come back, which is a business model." },
          { label: "Crunch Ascendancy into December", fx: { sanity: -16, q: 0.08, debt: 10, flags: { cycle13: 1 } },
            result: "It ships. Half of it works. The team spends Christmas hotfixing the Labyrinth from their parents' houses." }
        ]
      },
      posts: [
        { t: "Talisman is fine. Just fine", f: 'Discussion' },
        { t: "See you all in 13 weeks", f: 'Fluff' }
      ]
    },
    {
      id: 'c_ascendancy', kind: 'expansion', ver: '2.2.0', name: 'Ascendancy', date: '2016-03-04', realPeak: 37266, icon: 'skull',
      blurb: "Nineteen ascendancy classes, the biggest power boost the game has ever handed out. To earn it a player must cross the Lord's Labyrinth. Spinning blades, an emperor with opinions, no checkpoints.",
      reality: "The Labyrinth has had a removal campaign running since March 2016. The Perandus league that shipped alongside was reworked a week before launch and became one of the best liked.",
      dilemma: {
        text: "QA reports that a disconnect in the Labyrinth sends you back to the start. Fix?",
        choices: [
          { label: "Working as intended. Traps are content.", fx: { vision: 9, mood: -5, flags: { lab: 1 }, egg: 'lab' },
            result: "Players cross the Labyrinth because the reward is too good to skip. They hate every blade of it and tell you so in a thread that does not close for ten years." },
          { label: "Add checkpoints", fx: { vision: -7, mood: 4, flags: { lab: 1 } },
            result: "It is now a slightly annoying corridor. Izaro still narrates it." }
        ]
      },
      posts: [
        { t: "Remove the Labyrinth", f: 'Feedback', hot: true, c: "day 1 of asking" },
        { t: "Cadiro offered me a Headhunter for 14,000 coins. I have 900", f: 'Complaint' },
        { t: "Izaro says justice will be served. I am on trap 40. Please serve it", f: 'Meme' }
      ]
    },
    {
      id: 'c_prophecy', kind: 'league', ver: '2.3.0', name: 'Prophecy', date: '2016-06-03', realPeak: 26111, icon: 'scroll',
      blurb: "A seer sells riddles for silver coins. The patch also has an endgame Labyrinth, new skills, a renderer upgrade and five other things someone promised.",
      reality: "GGG's own verdict on Prophecy was that it tried to do too much at once. A garbled-text bug from patch 2.3.0 survived until 2022, and the community's word for it, krangled, stuck.",
      dilemma: {
        text: "The feature list is long.",
        choices: [
          { label: "Ship all of it", fx: { polish: -0.12, debt: 6, content: 0.05, egg: 'krangled' },
            result: "Everything makes it in. Nothing is quite finished. A text bug sneaks into the client this patch and nobody finds it for six years." },
          { label: "Cut it to three things", fx: { polish: 0.12, content: -0.06 },
            result: "Three things, done properly. The cut features go on a list. The list is still there." }
        ]
      },
      posts: [
        { t: "Navali said I would find a unique. I found a Tabula. Prophecy fulfilled?", f: 'Fluff' },
        { t: "My item text is krangled again", f: 'Complaint', c: "what does krangled mean" }
      ]
    },
    {
      id: 'c_atlas', kind: 'expansion', ver: '2.4.0', name: 'Atlas of Worlds', date: '2016-09-02', realPeak: 33220, icon: 'scroll',
      blurb: "Maps have been the last thing players do since beta. Now they get a board. Thirty new maps, a route across them, and something called the Shaper waiting in the middle.",
      reality: "Atlas of Worlds launched 2 September 2016 with the Essence league. The Atlas has been rebuilt several times since and is still how the late game works.",
      dilemma: {
        text: "Where does the team's time go?",
        choices: [
          { label: "The Atlas. Make the last hundred hours the best hundred.", fx: { ret: 1.15, rep: 0.04 },
            result: "Players stop asking for Act 5 for a while. They are busy colouring in a map." },
          { label: "A fifth act instead", fx: { ret: 0.92, hype: 5 },
            result: "The trailer is great. Players finish the act in an evening and go back to running the same six maps." }
        ]
      },
      posts: [
        { t: "Atlas completion 126/126. I should go outside", f: 'Fluff' },
        { t: "Can it do Shaper?", f: 'Question', c: "the only question" }
      ]
    },
    {
      id: 'c_breach', kind: 'league', ver: '2.5.0', name: 'Breach', date: '2016-12-02', realPeak: 46807, icon: 'fire',
      blurb: "A purple hand on the ground. Touch it and a timed rift opens, monsters pour out and loot comes with them. It takes eleven seconds to understand.",
      reality: "Breach is a community hall-of-fame league. GGG later judged new leagues against what it called the Breach test for risk and reward.",
      dilemma: {
        text: "How much should a league mechanic pay out?",
        choices: [
          { label: "A lot. Bury them in splinters.", fx: { mood: 7, vision: -4, ret: 1.1, flags: { breachtest: 1 } },
            result: "It is fast, generous and everywhere. From now on players hold every league up against this one." },
          { label: "Keep it lean", fx: { vision: 6, mood: -6, ret: 0.9 },
            result: "Players open a breach, receive four splinters and a lesson about weight. They skip the next one." }
        ]
      },
      posts: [
        { t: "Breach is the best league ever made", f: 'Discussion', when: 'good', hot: true },
        { t: "I have clicked 11,000 splinters this week. My hand hurts. More please", f: 'Fluff' }
      ]
    },
    {
      id: 'c_legacy', kind: 'league', ver: '2.6.0', name: 'Legacy', date: '2017-03-03', realPeak: 65200, icon: 'trophy',
      blurb: "Most of the studio is buried in the secret 3.0 expansion. Someone still has to ship a league in March.",
      reality: "Legacy was built cheaply to cover 3.0 development, ran 22 weeks and became the most successful release up to then. It also added Solo Self-Found.",
      dilemma: {
        text: "What do you ship with almost nobody on it?",
        choices: [
          { label: "A remix. Every old league at once, cheap to build.", fx: { content: 0.3, future: 0.04, egg: 'legacy' },
            result: "It costs almost nothing and players love it more than the leagues you bled for. Nobody at the studio knows how to feel about that." },
          { label: "A proper new league. Pull people off 3.0.", fx: { future: -0.08, sanity: -5 },
            result: "The league is decent. The expansion slips a little further to the right." }
        ]
      },
      posts: [
        { t: "Legacy is a greatest hits album and I am fine with that", f: 'Discussion' },
        { t: "SSF btw", f: 'Fluff', c: "nobody asked" }
      ]
    },
    {
      id: 'c_oriath', kind: 'expansion', ver: '3.0.0', name: 'The Fall of Oriath', date: '2017-08-04', realPeak: 98110, icon: 'fire',
      blurb: "The big one. New acts replace the old trick of playing the same campaign three times. Also this month, the Xbox version and the China launch with Tencent.",
      reality: "3.0 peaked at 98,110 on Steam, about half again above any earlier launch. China open beta followed on 22 August and Xbox One on 24 August 2017.",
      onStart: function (S) { return S.flags.sixacts ? null : { peak: 0.74 }; },
      dilemma: {
        text: "Three launches in three weeks. Do them all?",
        choices: [
          { label: "All three", fx: { sanity: -10, revMult: 1.12, hype: 8 },
            result: "PC on the 4th, Shanghai on the 22nd, Xbox on the 24th. Nobody remembers August." },
          { label: "PC now. The rest when everyone has slept.", fx: { sanity: 4, revMult: 1.05 },
            result: "A calm launch. Tencent's calendar is less calm about it." }
        ]
      },
      posts: [
        { t: "Kitava took 30% of my resistances and I did not notice for two acts", f: 'Complaint', c: "cap your res" },
        { t: "Ten acts and no more Cruel difficulty. Is this real", f: 'Fluff', hot: true, when: 'good', flag: 'sixacts' },
        { t: "The patch notes say \"(This is a buff)\". I do not believe them", f: 'Meme' }
      ]
    },
    {
      id: 'c_abyss', kind: 'expansion', ver: '3.1.0', name: 'War for the Atlas', date: '2017-12-08', realPeak: 70314, icon: 'scroll',
      blurb: "Four months after the biggest expansion in the studio's history, the plan is another expansion. Thirty-two maps, two cosmic entities fighting over the Atlas, and cracks in the ground that monsters climb out of.",
      reality: "GGG built War for the Atlas in about four months, called that ambitious, and said it would go back to 13-week releases.",
      dilemma: {
        text: "A full expansion in four months?",
        choices: [
          { label: "Do it", fx: { q: 0.07, sanity: -9 },
            result: "It ships and it is good. In the retrospective you call the schedule ambitious, which is the polite word." },
          { label: "A league and some maps", fx: { q: -0.05, sanity: 5 },
            result: "A sensible patch from a rested team. The trailer has less to say." }
        ]
      },
      posts: [
        { t: "Can it do Uber Elder?", f: 'Question', c: "no" },
        { t: "Abyss jewels are going to be a problem", f: 'Discussion' }
      ]
    },
    {
      id: 'c_bestiary', kind: 'league', ver: '3.2.0', name: 'Bestiary', date: '2018-03-02', realPeak: 81781, icon: 'kiwi',
      blurb: "A monster-collecting league. A hunter called Einhar teaches players to capture beasts and sacrifice them at a blood altar for crafts.",
      reality: "Bestiary got a mixed reception and a heavy rework mid-league. The nets went. Einhar stayed and became the game's mascot.",
      dilemma: {
        text: "How does a player capture a beast?",
        choices: [
          { label: "Buy nets. Get the beast to low life. Throw the right net. Hope.", fx: { mood: -9, vision: 5, ret: 0.88, egg: 'nets' },
            result: "Players kill the beast by accident nine times in ten. They call the league Pathmon and beg for the nets to go. Everybody loves Einhar." },
          { label: "Einhar throws the net", fx: { mood: 5, vision: -3 },
            result: "You fight, Einhar shouts, the beast is yours. It took you one meeting to get here." }
        ]
      },
      posts: [
        { t: "Pathmon: gotta net them all", f: 'Meme', hot: true },
        { t: "Killed a red beast by accident again. I am a danger to wildlife", f: 'Complaint' },
        { t: "Einhar is the best NPC in the game", f: 'Fluff', c: "A worthy post, exile!" }
      ]
    },
    {
      id: 'c_incursion', kind: 'league', ver: '3.3.0', name: 'Incursion', date: '2018-06-01', realPeak: 95824, icon: 'clock',
      blurb: "Time travel. A treasure hunter sends players back for ten-second raids on a Vaal temple, room by room, then lets them loot the finished thing in the present.",
      reality: "Incursion launched 1 June 2018, days after the Tencent deal went public, and was well liked.",
      posts: [
        { t: "The Incursion timer is too short", f: 'Feedback' },
        { t: "The temple had a double-corrupt room. I bricked both items", f: 'Fluff', c: "vaal or no balls" },
        { t: "So is this game pay to win now or", f: 'Question', flag: 'tencent', c: "read the announcement" }
      ]
    },
    {
      id: 'c_delve', kind: 'league', ver: '3.4.0', name: 'Delve', date: '2018-08-31', realPeak: 75500, icon: 'garage',
      blurb: "An infinite mine. A madman with a crawler drives a cart of light into the dark and players follow it, because stepping out of the light kills them.",
      reality: "Delve was very popular. Its infinite Azurite Mine stayed in the game for good.",
      dilemma: {
        text: "How deep does it go?",
        choices: [
          { label: "No bottom", fx: { ret: 1.18, vision: 4 },
            result: "Someone reaches depth 1,000 in a month. Someone else reaches 6,000 and stops answering messages." },
          { label: "A hundred levels and a boss", fx: { ret: 0.95, polish: 0.08 },
            result: "A tidy dungeon. Players finish it by week two and ask what is next." }
        ]
      },
      posts: [
        { t: "Need more sulphite", f: 'Complaint', c: "the darkness..." },
        { t: "Depth 600. The dark is my hideout now", f: 'Fluff' }
      ]
    },
    {
      id: 'c_betrayal', kind: 'expansion', ver: '3.5.0', name: 'Betrayal', date: '2018-12-07', realPeak: 123462, icon: 'card',
      blurb: "The masters from 2014 retire. In their place, a criminal syndicate with ranks and grudges, tracked on a board with string. It is announced a few weeks after another studio's convention goes badly.",
      reality: "Betrayal became GGG's most popular expansion to that point, peaking at 123,462 on Steam. Fans decided the Immortal Syndicate was a jab at Diablo Immortal.",
      dilemma: {
        text: "The enemy faction needs a name.",
        choices: [
          { label: "The Immortal Syndicate", fx: { hype: 8, mood: 3, egg: 'immortal' },
            result: "You say the name was chosen months ago. Nobody believes you and nobody minds." },
          { label: "The Shadow Council", fx: { hype: 2 },
            result: "A fine name. No one screenshots it." }
        ]
      },
      posts: [
        { t: "The syndicate board looks like my wall when I plan a build", f: 'Meme' },
        { t: "Got one-shot by a syndicate member through a wall", f: 'Complaint', c: "which one", hot: true },
        { t: "Diablo refugee here. What is a six-link and why is everyone crying", f: 'Question', c: "welcome, exile" }
      ]
    },
    {
      id: 'c_synthesis', kind: 'league', ver: '3.6.0', name: 'Synthesis', date: '2019-03-08', realPeak: 111114, icon: 'mirror',
      blurb: "Players collect fragments of decaying memories, place them on a board to build paths, and run the paths before they collapse. There is also a new item type made by fusing three others.",
      reality: "Synthesis is remembered as confusing and a miss. The PlayStation 4 version launched during it, on 26 March 2019.",
      dilemma: {
        text: "Nobody in the meeting can explain the league in one sentence.",
        choices: [
          { label: "Ship it. They will work it out.", fx: { q: -0.1, mood: -6, vision: 4 },
            result: "They do not work it out. A two-hour explainer video becomes the top post. Its conclusion is to skip the mechanic." },
          { label: "Rip out the board. Keep the items.", fx: { content: -0.15, mood: 2 },
            result: "Half the league goes in the bin three weeks before launch. What is left makes sense." }
        ]
      },
      posts: [
        { t: "300 hours in Synthesis and I still do not know what the memory board wants", f: 'Complaint', hot: true },
        { t: "Synthesis explained in 140 slides", f: 'Guide' }
      ]
    },
    {
      id: 'c_legion', kind: 'league', ver: '3.7.0', name: 'Legion', date: '2019-06-07', realPeak: 113258, icon: 'hammer',
      blurb: "Five armies frozen in time under a monolith. Break them out and fight them all before the timer ends. Also in this patch, six years late, somebody finally looks at melee.",
      reality: "Legion shipped the melee rework and launched in Korea the same week. All-platform concurrency hit a record of about 224,000. Cyclone was everywhere.",
      dilemma: {
        text: "Melee has been bad since 2013.",
        choices: [
          { label: "Rework all of it. Animations, targeting, the numbers.", fx: { mood: 8, content: -0.05, egg: 'cyclone' },
            result: "Melee works. Then one skill works much better than the others and half the ladder is spinning in a circle." },
          { label: "Melee is fine", fx: { vision: 4, mood: -7 },
            result: "You post it. Every reply is the same picture of a Marauder dying to a bird." }
        ]
      },
      posts: [
        { t: "Every build on the ladder is Cyclone", f: 'Discussion', c: "spin to win" },
        { t: "Legion is Breach 2 and I mean that as the highest praise", f: 'Fluff', when: 'good' }
      ]
    },
    {
      id: 'c_blight', kind: 'league', ver: '3.8.0', name: 'Blight', date: '2019-09-06', realPeak: 74653, icon: 'bug',
      blurb: "Tower defence. A woman with a pump and a song asks players to build turrets along lanes of fungus. ExileCon is ten weeks away and half the building is working on something they cannot talk about.",
      reality: "Blight had the weakest Steam launch in two years at 74,653. Chris Wilson later named it as a league that underperformed and needed rework.",
      dilemma: {
        text: "Who works on Blight?",
        choices: [
          { label: "Whoever is left", fx: { q: -0.08, future: 0.05, debt: 5 },
            result: "Blight ships with two hundred towers on screen at four frames per second. The convention demo, meanwhile, looks incredible." },
          { label: "Pull people back from the convention demo", fx: { future: -0.05, q: 0.05 },
            result: "Blight runs properly. The demo for November has one boss fewer." }
        ]
      },
      posts: [
        { t: "Blight encounter running at 4 fps. Is this the tower defence experience", f: 'Complaint' },
        { t: "Cassia will not stop singing", f: 'Meme' }
      ]
    },
    {
      id: 'c_conquerors', kind: 'expansion', ver: '3.9.0', name: 'Conquerors of the Atlas', date: '2019-12-13', realPeak: 117757, icon: 'skull',
      blurb: "Announced on stage at ExileCon. A new story for the Atlas, five new bosses, a bow rework, and a league where a polite scientist asks players to build a monster out of organs.",
      reality: "Conquerors launched 13 December 2019. Launch-era Sirus was infamous for arena-wide storms and a bored one-word taunt.",
      dilemma: {
        text: "The final boss, Sirus, is not quite finished.",
        choices: [
          { label: "Ship him", fx: { polish: -0.08, mood: -3, egg: 'sirus' },
            result: "He teleports away, says one word and deletes the character. His storms cover the whole arena. Players quote the word at each other for years." },
          { label: "Take people off the league to finish the fight", fx: { content: -0.06, mood: 3 },
            result: "The fight is fair. It is a little sad that nobody has a story about it." }
        ]
      },
      posts: [
        { t: "Sirus: \"Die.\" Me: ok", f: 'Meme', hot: true },
        { t: "Tane is the only man in Wraeclast who has ever been kind to me", f: 'Fluff' },
        { t: "I have a stash tab full of organs. Is that normal", f: 'Question' }
      ]
    },
    {
      id: 'c_delirium', kind: 'league', ver: '3.10.0', name: 'Delirium', date: '2020-03-13', realPeak: 132508, icon: 'mirror',
      blurb: "Step through a mirror and a fog rolls over the map. Everything in it gets harder and pays better the longer you keep up. Launch is Friday the 13th of March 2020.",
      reality: "Delirium launched into a long DDoS attack that knocked about 40 servers offline. It still set an all-platform record of 237,160. New Zealand went into lockdown two weeks later.",
      dilemma: {
        text: "Hours after launch, about forty servers drop offline. It is a DDoS attack.",
        choices: [
          { label: "All hands on the servers. Post updates every hour.", fx: { mood: 4, sanity: -6, egg: 'ddos' },
            result: "The team fights it through the night and posts as it goes. The league sets a concurrency record anyway." },
          { label: "Say nothing until it is fixed", fx: { mood: -8, sanity: -3 },
            result: "It is fixed by morning. The subreddit spent the night writing its own explanation and likes that one better." }
        ]
      },
      posts: [
        { t: "Days since last DDoS: 0", f: 'Meme' },
        { t: "Delirium fog makes my PC sound like a jet", f: 'Complaint' },
        { t: "Stuck at home for a month. Guess I will play 14 hours a day", f: 'Fluff' }
      ]
    },
    {
      id: 'c_harvest', kind: 'league', ver: '3.11.0', name: 'Harvest', date: '2020-06-19', realPeak: 125432, icon: 'heart',
      blurb: "Built from kitchens and spare rooms during lockdown. Players plant seeds in a private garden, grow monsters, kill them and spend the result on crafts. The crafts let you pick the modifier you want.",
      reality: "Harvest was divisive while it ran because of the garden layout puzzle. Players missed its crafting badly once it was cut back.",
      dilemma: {
        text: "Deterministic crafting. Players choosing their own modifiers.",
        choices: [
          { label: "Let them", fx: { mood: 7, vision: -11, ret: 1.1, flags: { harvest: 1 } },
            result: "Players make the item they wanted, on purpose, for the first time since 2011. They are very happy. Your item designers look ill." },
          { label: "Random results only", fx: { vision: 6, mood: -4 },
            result: "It is a nice garden. Players water it, sigh, and close their eyes when they craft, same as always." }
        ]
      },
      posts: [
        { t: "Made a perfect item in Harvest. Is this what joy is", f: 'Fluff', flag: 'harvest', hot: true },
        { t: "I came here to kill monsters and I am laying irrigation pipes", f: 'Complaint' }
      ]
    },
    {
      id: 'c_heist', kind: 'league', ver: '3.12.0', name: 'Heist', date: '2020-09-18', realPeak: 121595, icon: 'money',
      blurb: "The ambitious lockdown project. A whole town of thieves with skills and voice lines, stealth, alarms, vaults. The Mac version and the Epic store launch are this month too. Auckland has just gone back into restrictions.",
      reality: "Heist launched 18 September 2020 with crashes, broken skills and quest blockers. GGG billed it as its ambitious lockdown project.",
      dilemma: {
        text: "It is two weeks out and Heist is not done.",
        choices: [
          { label: "Ship it", fx: { polish: -0.2, mood: -5, sanity: -6 },
            result: "Doors do not open. Rogues stand in doorways. A quest blocks itself. The hotfixes work their way down the alphabet." },
          { label: "Cut the grand heists and polish the rest", fx: { content: -0.14, polish: 0.15 },
            result: "A smaller league that works. The cut content turns up two leagues later and nobody notices it was late." }
        ]
      },
      posts: [
        { t: "The Heist door will not open. I live here now", f: 'Complaint' },
        { t: "Finally playing on Mac. It runs at 9 fps but it runs", f: 'Fluff' }
      ]
    },
    {
      id: 'c_ritual', kind: 'expansion', ver: '3.13.0', name: 'Echoes of the Atlas', date: '2021-01-15', realPeak: 157091, icon: 'scroll',
      blurb: "The extra weeks all went into the Atlas. There are passive trees for each region and a cosmic child called the Maven who watches boss fights for fun.",
      reality: "Echoes of the Atlas set an all-platform record of 265,250, up 11% on Delirium. A month's delay produced the best launch to date.",
      posts: [
        { t: "The Maven is watching me fail", f: 'Meme' },
        { t: "Harvest in Ritual league is the best crafting this game has ever had", f: 'Discussion', flag: 'harvest', hot: true },
        { t: "The Maven's memory game was designed by someone who hates me", f: 'Complaint' }
      ]
    },
    {
      id: 'c_ultimatum', kind: 'league', ver: '3.14.0', name: 'Ultimatum', date: '2021-04-16', realPeak: 155138, icon: 'card',
      blurb: "A masked showman offers a fight and a prize. Win, and he offers to double it. Players can walk away at any time and they will not. Before launch, the balance team has a manifesto to publish.",
      reality: "The Harvest manifesto went up on 10 March 2021. \"Close your eyes\" has been shorthand for defending randomness ever since.",
      dilemma: {
        text: "Harvest crafting has made near-perfect gear routine. The manifesto is drafted.",
        choices: [
          { label: "Publish it. Cut Harvest back hard.", fx: { vision: 10, mood: -11, flags: { harvestNerf: 1 }, egg: 'eyes' },
            result: "The post quotes a designer who misses the feeling of closing your eyes when you use an Exalted Orb. Players read that as a studio in love with bad luck. The thread passes 470 pages." },
          { label: "Leave Harvest alone", fx: { vision: -9, mood: 5 },
            result: "Everyone has perfect gear by week three and asks what the point of loot is. That thread is shorter." }
        ]
      },
      posts: [
        { t: "I close my eyes every time I open the patch notes", f: 'Meme', flag: 'harvestNerf', hot: true },
        { t: "The Trialmaster asked if I wanted to keep going. I always want to keep going", f: 'Fluff' }
      ]
    },
    {
      id: 'c_expedition', kind: 'league', ver: '3.15.0', name: 'Expedition', date: '2021-07-23', realPeak: 116106, icon: 'hammer',
      blurb: "Kalguuran traders dig up their dead with explosives. That is the league. The patch around it is the one people will remember. Players clear whole screens in a blink and the designers want the game they made in 2013 back.",
      reality: "Expedition launched with 23% fewer players than the record. GGG shipped six hotfixes in the first weekend and Chris Wilson conceded the mana changes went too far. His \"Some thoughts from Chris\" post gave the community \"the vision\".",
      dilemma: {
        text: "The balance proposal for 3.15 is on your desk.",
        choices: [
          { label: "All of it. Support gems, flasks, movement skills, mana costs.", fx: { vision: 15, mood: -16, peak: 0.85, ret: 0.82, flags: { nerf315: 1 }, egg: 'vision' },
            result: "Nearly every build gets weaker on the same day. Launch numbers fall by about a quarter. You write a long post about where the game should go, and the subreddit pulls two words out of it and never gives them back." },
          { label: "Trim the three worst outliers", fx: { vision: 3, mood: -3 },
            result: "Three builds die. Their owners are furious for nine days. Power keeps creeping." },
          { label: "Buff everything else instead", fx: { vision: -14, mood: 8, peak: 1.08, debt: 6, flags: { creep: 1 } },
            result: "Players love it. Bosses now die during their intro line." }
        ]
      },
      posts: [
        { t: "Some thoughts from Chris", f: 'GGG', g: true, flag: 'nerf315', hot: true, c: "the vision" },
        { t: "Path of Nerfs", f: 'Meme', flag: 'nerf315' },
        { t: "My flasks are empty and so am I", f: 'Complaint', flag: 'nerf315' },
        { t: "Combatting power creep: vision vs. reality", f: 'Discussion', flag: 'nerf315', hot: true }
      ]
    },
    {
      id: 'c_scourge', kind: 'league', ver: '3.16.0', name: 'Scourge', date: '2021-10-22', realPeak: 148447, icon: 'fire',
      blurb: "Fill a blood jar, flip the world into a demon dimension, kill until the jar empties. There is also a new belt that makes magic flasks permanent, which is a strange thing to add one patch after nerfing flasks.",
      reality: "Mageblood arrived with Scourge in October 2021 and overtook Headhunter as the item every guide quietly assumes you own.",
      dilemma: {
        text: "The belt. Ship it?",
        choices: [
          { label: "Ship it. Make it absurdly rare.", fx: { vision: -4, hype: 5, egg: 'mageblood' },
            result: "Every build guide written after this month assumes the reader owns one. Nobody owns one." },
          { label: "Cut it", fx: { vision: 4 },
            result: "Headhunter stays the unit of wealth. Players who chance Leather Belts every league breathe out." }
        ]
      },
      posts: [
        { t: "Budget version of my build. Only needs one Mageblood", f: 'Guide', c: "thanks" },
        { t: "Scourge map crashed with my best item inside", f: 'Complaint' }
      ]
    },
    {
      id: 'c_siege', kind: 'expansion', ver: '3.17.0', name: 'Siege of the Atlas', date: '2022-02-04', realPeak: 158140, icon: 'scroll',
      blurb: "The regional Atlas trees merge into one enormous tree. Two new bosses eat the stars. A new commander hands out map missions and the old cartographer has gone missing. The league lets players stack modifiers on rare monsters by hand.",
      reality: "Siege of the Atlas set another all-platform record at 270,260. The expansion was praised. The Archnemesis league on top of it is not the part people remember fondly.",
      posts: [
        { t: "Where is Zana? What did they do to her", f: 'Question', hot: true },
        { t: "The Atlas tree is the best thing GGG has ever shipped", f: 'Discussion', when: 'good' },
        { t: "Kirac, you are not her", f: 'Meme' }
      ]
    },
    {
      id: 'c_sentinel', kind: 'league', ver: '3.18.0', name: 'Sentinel', date: '2022-05-13', realPeak: 131010, icon: 'gear',
      blurb: "Little drones that fly alongside players and power up monsters for better loot. A pleasant league. The other half of the patch is a rebuild of every rare monster in the game.",
      reality: "Patch 3.18 made Archnemesis modifiers core. GGG removed the system in 3.20 with a manifesto. For most players the name still means a rare that will not die.",
      dilemma: {
        text: "Last league's monster modifiers were hand-built and deadly. Design wants them on every rare monster, for good.",
        choices: [
          { label: "Make them core. It has been tested extensively.", fx: { vision: 7, mood: -6, flags: { archnem: 1 }, egg: 'tested' },
            result: "Every rare monster is now a small unreadable boss with four mechanics and all the loot. \"Tested extensively\" enters the language." },
          { label: "Keep the old modifiers", fx: { vision: -4, mood: 3 },
            result: "Rares stay speed bumps. A designer puts the proposal in a drawer and labels it \"later\"." }
        ]
      },
      posts: [
        { t: "A rare with four Archnemesis mods has more health than the map boss", f: 'Complaint', flag: 'archnem', hot: true },
        { t: "Tested extensively", f: 'Meme', flag: 'archnem' }
      ]
    },
    {
      id: 'c_kalandra', kind: 'league', ver: '3.19.0', name: 'Lake of Kalandra', date: '2022-08-19', realPeak: 151145, icon: 'mirror',
      blurb: "Mirrored tablets and a lake of reflections. Underneath, an economy rework. League monsters have carried a large hidden loot bonus for years. The plan is to remove it and move the rewards onto rare monsters.",
      reality: "Players found drops gutted within days, in the worst cases by about ten times. Chris Wilson's follow-up admitted he had not understood the impact and that it was not playtested enough. His phrase \"massive historic bonus\" outlived the league.",
      dilemma: {
        text: "The loot change. How do you handle it?",
        choices: [
          { label: "Remove the bonus. Leave it out of the patch notes.", fx: { vision: 10, mood: -22, ret: 0.72, sanity: -10, flags: { kalandra: 1 }, egg: 'historic' },
            result: "Players measure the drops themselves within days. Some farms pay a tenth of what they did. Your reply becomes the most downvoted post the subreddit has seen." },
          { label: "Remove it and say so, with numbers", fx: { vision: 6, mood: -10, ret: 0.88, flags: { kalandra: 1 } },
            result: "Players hate it with complete information. The threads are angrier and better sourced." },
          { label: "Leave the loot alone", fx: { vision: -6, mood: 4 },
            result: "The floor stays covered in items nobody picks up. The designers stare at it." }
        ]
      },
      posts: [
        { t: "What Happened with Items", f: 'GGG', g: true, flag: 'kalandra', hot: true, c: "most downvoted post in subreddit history" },
        { t: "Killed a loot goblin. It dropped my whole week", f: 'Fluff', flag: 'kalandra' },
        { t: "League retention graph. It is a cliff", f: 'Discussion', flag: 'kalandra', hot: true },
        { t: "Where is my massive historic bonus", f: 'Meme', flag: 'kalandra' }
      ]
    },
    {
      id: 'c_sanctum', kind: 'league', ver: '3.20.0', name: 'The Forbidden Sanctum', date: '2022-12-09', realPeak: 127169, icon: 'skull',
      blurb: "A roguelike inside the action RPG. Rooms, boons, afflictions, a resource called resolve. Archnemesis goes in the bin with a manifesto. There is also the mode Chris has wanted since 3.15.",
      reality: "Ruthless shipped with 3.20 as an optional mode with extreme item scarcity. Chris Wilson compared its pace to Diablo II.",
      dilemma: {
        text: "Hard Mode. Almost no item drops, no crafting bench, everything slower.",
        choices: [
          { label: "Ship it as an optional flag. Call it Ruthless.", fx: { vision: 8, mood: 2, flags: { ruthless: 1 }, egg: 'ruthless' },
            result: "A small group of players loves it with their whole hearts. Everyone else now has a place to send people who say the game is too easy." },
          { label: "Make it the main game", fx: { vision: 25, mood: -25, peak: 0.7, ret: 0.8, flags: { ruthless: 1 }, egg: 'ruthless' },
            result: "You did it. The game you saw in the garage. Three quarters of the playerbase see something else and leave." },
          { label: "Shelve it", fx: { vision: -8 },
            result: "The design doc goes in a drawer. Chris opens the drawer sometimes." }
        ]
      },
      posts: [
        { t: "Go play Ruthless", f: 'Meme', flag: 'ruthless' },
        { t: "Sanctum is the best league mechanic in years and I will not be taking questions", f: 'Discussion', when: 'good' },
        { t: "Archnemesis is gone. I can read rare monsters again", f: 'Fluff', flag: 'archnem', hot: true }
      ]
    },
    {
      id: 'c_crucible', kind: 'league', ver: '3.21.0', name: 'Crucible', date: '2023-04-07', realPeak: 209526, icon: 'hammer',
      blurb: "Passive trees on weapons, earned by holding a button at a forge while monsters spawn. Something odd is going on with the numbers this quarter. Another big action RPG is two months from launch and the whole genre is awake.",
      reality: "Crucible set an all-time concurrency record of 321,180, beating the old one by more than 50,000. The mechanic itself got a lukewarm response.",
      posts: [
        { t: "Record launch for a league where I hold a button and wait", f: 'Discussion' },
        { t: "My weapon has a passive tree. My passive tree wants a passive tree", f: 'Meme' }
      ]
    },
    {
      id: 'c_ancestor', kind: 'league', ver: '3.22.0', name: 'Trial of the Ancestors', date: '2023-08-18', realPeak: 165243, icon: 'totem',
      blurb: "Three weeks after ExileCon. Players go to the Karui afterlife to manage a team in an auto-battler tournament. Some of the playerbase did not expect a strategy game today.",
      reality: "Trial of the Ancestors split players and picked up a cult following. GGG brought it back as an event in 2026.",
      posts: [
        { t: "I did not come to this game to manage a sports team", f: 'Complaint' },
        { t: "Ancestor league is secretly the best one. I will die on this totem", f: 'Discussion' }
      ]
    },
    {
      id: 'c_affliction', kind: 'league', ver: '3.23.0', name: 'Affliction', date: '2023-12-08', realPeak: 167593, icon: 'fire',
      blurb: "A dark wood inside every map. Run in, collect coloured wisps, come out and watch them make the rest of the map absurd. It launches straight into the New Zealand summer holiday.",
      reality: "Affliction was loved and had the best day-7 retention of its period. December leagues run into the NZ summer break, and players know it.",
      dilemma: {
        text: "Wisps multiply loot with no real ceiling. The office is empty until mid-January.",
        choices: [
          { label: "Leave it. Enjoy the beach.", fx: { mood: 9, vision: -8, ret: 1.15, sanity: 6, egg: 'beach' },
            result: "Players stack wisps until a single map drops more than a week used to. Retention is the best in years. You come back from holiday and decide not to look at the economy." },
          { label: "Hotfix a cap from the beach", fx: { vision: 6, mood: -9, sanity: -8 },
            result: "You patch it from a deck chair. The top post is a photo of an empty office captioned \"they never sleep\"." }
        ]
      },
      posts: [
        { t: "GGG is on holiday. Exploit early, exploit often", f: 'Meme' },
        { t: "One map dropped 40 divines. Affliction is the best league ever", f: 'Fluff', hot: true }
      ]
    },
    {
      id: 'c_necropolis', kind: 'league', ver: '3.24.0', name: 'Necropolis', date: '2024-03-29', realPeak: 187416, icon: 'skull',
      blurb: "A lantern shows which modifiers haunt each monster pack and lets players shuffle them. Corpses of those monsters go in a graveyard. Arrange the corpses in a grid and an item comes out.",
      reality: "Necropolis had the second-biggest Steam launch to that point and weak retention. The league mechanic was unpopular. The Atlas changes in the same patch were well liked.",
      dilemma: {
        text: "Crafting by arranging corpses in a spreadsheet.",
        choices: [
          { label: "Ship the graveyard", fx: { q: -0.08, mood: -6, ret: 0.85 },
            result: "Players open a second monitor for the corpse calculator. Most stop opening the graveyard." },
          { label: "Cut the graveyard, keep the lantern", fx: { content: -0.1, mood: 2 },
            result: "Half a league, clearly explained." }
        ]
      },
      posts: [
        { t: "I need a spreadsheet to bury a corpse", f: 'Complaint', hot: true },
        { t: "Necropolis crafting guide. It is 47 pages", f: 'Guide' }
      ]
    },
    {
      id: 'c_settlers', kind: 'league', ver: '3.25.0', name: 'Settlers of Kalguur', date: '2024-07-26', realPeak: 229337, icon: 'building',
      blurb: "Players build a town. Miners, farmers, a shipping office with actual boats. Jonathan plays city builders to relax and it shows. This league also has to carry Path of Exile 1 for a while, because everyone else in the building is on the sequel.",
      reality: "Settlers set records with 229,337 on Steam and about 350,000 across platforms. Because of Path of Exile 2 it ran 46 weeks, by far the longest league ever.",
      dilemma: {
        text: "After ten years of jokes, the league has boats in it. How big do you go?",
        choices: [
          { label: "A whole town, gold, shipping, the lot", fx: { mood: 8, hype: 8, ret: 1.15, egg: 'boat' },
            result: "Boat league is real. Players send ships to ports and get crates back. The best-received league in years is also the one that has to last eleven months." },
          { label: "Keep it small. People are needed on the sequel.", fx: { future: 0.04, ret: 0.9 },
            result: "A pleasant small league. Players finish the town in a week and settle in for a long wait." }
        ]
      },
      posts: [
        { t: "BOAT LEAGUE IS REAL", f: 'Fluff', hot: true },
        { t: "My town has 40 workers and I pay them more than I pay myself", f: 'Meme' },
        { t: "Day 200 of Settlers", f: 'Discussion', c: "still sane?" }
      ]
    },
    {
      id: 'c_poe2ea', kind: 'poe2', ver: 'PoE2 0.1.0', name: 'Path of Exile 2 Early Access', date: '2024-12-06', realPeak: 578569, icon: 'stage',
      blurb: "Seven years after someone first wrote \"4.0\" on a whiteboard. Three acts of a planned six, six classes of a planned twelve, a dodge roll. More than a million people have bought in before the servers open, which is more than the backend has ever been tested with.",
      reality: "Early access opened 6 December 2024 at US$30. Steam peaked at 578,569 two days later. NZ press later cited more than 850,000 online across platforms.",
      dilemma: {
        text: "How do you sell an unfinished game?",
        choices: [
          { label: "Paid early access, $30 and up", fx: { rev: 1.7, hype: 6, egg: 'million' },
            result: "A million keys before launch day. The website falls over the night before. The queue lasts all weekend and people stay in it." },
          { label: "Free open beta", fx: { peak: 1.4, rev: 0.45, debt: 12, mood: -6 },
            result: "Everyone on Earth logs in. Nobody on Earth gets past the login screen." }
        ]
      },
      posts: [
        { t: "Queue position 384,112", f: 'Fluff', c: "see you tomorrow", hot: true },
        { t: "One portal per map. Who asked for this", f: 'Complaint', c: "the vision" },
        { t: "PoE2 is just Ruthless 2", f: 'Meme' },
        { t: "New player here. What is a resistance", f: 'Question', c: "tourist" }
      ]
    },
    {
      id: 'c_hunt', kind: 'poe2', ver: 'PoE2 0.2.0', name: 'Dawn of the Hunt', date: '2025-04-04', realPeak: 245870, icon: 'hammer',
      blurb: "The first big early access patch. A spear class and a hundred new things to fight. In the first three months players found builds that erase bosses in seconds. It is a little sad to build a boss and watch that.",
      reality: "Dawn of the Hunt sent recent Steam reviews to Mostly Negative. GGG patched within days and promised the next update would go after every problem it could find.",
      dilemma: {
        text: "The balance pass for 0.2.0.",
        choices: [
          { label: "Nerf broadly. Slow the whole game down.", fx: { vision: 10, mood: -15, ret: 0.78, flags: { hunt: 1 }, egg: 'hunt' },
            result: "Recent reviews turn Mostly Negative inside a week. You ship emergency patches, then sit for a two-hour interview and admit the mistakes were blatant." },
          { label: "Fix the two silliest builds and move on", fx: { vision: -6, mood: 4 },
            result: "Bosses still die fast. Players like it that way and say so." }
        ]
      },
      posts: [
        { t: "Where's the loot, GGG?", f: 'Complaint', flag: 'hunt', hot: true },
        { t: "A famous group player says the patch is miserable", f: 'Discussion', flag: 'hunt', c: "big if true" },
        { t: "Still no swords", f: 'Meme' }
      ]
    },
    {
      id: 'c_secrets', kind: 'expansion', ver: '3.26.0', name: 'Secrets of the Atlas', date: '2025-06-13', realPeak: 179556, icon: 'scroll',
      blurb: "The first Path of Exile 1 league in 322 days. Hired mercenaries, a new story for the Atlas, and a playerbase that has been refreshing the announcements page since last July.",
      reality: "3.26 launched 13 June 2025 and peaked near 180,000 on Steam, far above Path of Exile 2 that week. A barrage of DDoS attacks hit the launch and GGG apologised for the service.",
      posts: [
        { t: "322 days. We are so back", f: 'Fluff', hot: true },
        { t: "PoE1 has three times the players of PoE2 this week. Just saying", f: 'Discussion' },
        { t: "EU servers are being DDoSed again", f: 'Complaint' }
      ]
    },
    {
      id: 'c_edict', kind: 'poe2', ver: 'PoE2 0.3.0', name: 'The Third Edict', date: '2025-08-29', realPeak: 352104, icon: 'heart',
      blurb: "The apology patch. A fourth act, interludes to replace the second playthrough, a sprint button, and trading that works while the seller is asleep. The stated goal is to fix every problem anyone has.",
      reality: "The Third Edict was received as the turnaround after Dawn of the Hunt. It peaked at 352,104 on Steam with a free weekend.",
      posts: [
        { t: "I bought an item and the seller did not have to be awake", f: 'Fluff', hot: true },
        { t: "They fixed every problem except mine", f: 'Complaint' }
      ]
    },
    {
      id: 'c_keepers', kind: 'league', ver: '3.27.0', name: 'Keepers of the Flame', date: '2025-10-31', realPeak: 184633, icon: 'fire',
      blurb: "A sequel league. Breach from 2016, rebuilt. Bloodline ascendancies on top of the old ones. The trade system from the other game could come across too, if anyone finds the hours.",
      reality: "Keepers of the Flame launched on Halloween 2025 and brought asynchronous trade to Path of Exile 1, eight years after the trade manifesto.",
      posts: [
        { t: "Breach 2. The hands are back", f: 'Fluff' },
        { t: "Read the manifesto, they said", f: 'Meme' }
      ]
    },
    {
      id: 'c_druids', kind: 'poe2', ver: 'PoE2 0.4.0', name: 'The Last of the Druids', date: '2025-12-12', realPeak: 290305, icon: 'kiwi',
      blurb: "A druid who turns into a bear. A league about building Vaal temples. Some of the late-game content will not make the date. And it is December, so the office empties out the week after launch.",
      reality: "Players broke the 0.4 league with temple farming over the summer break. Jonathan Rogers said it ruined his Christmas and that he enjoyed nerfing it mid-league.",
      dilemma: {
        canon: 1,
        text: "Players find a temple layout that prints currency. It is the 23rd of December.",
        choices: [
          { label: "Let it ride until January", fx: { mood: 5, vision: -6, sanity: 5 },
            result: "The economy inflates for three weeks. Jonathan thinks about it over Christmas dinner anyway." },
          { label: "Nerf it mid-league and enjoy doing it", fx: { vision: 8, mood: -7, sanity: -5, egg: 'temple' },
            result: "The fix goes out between Christmas and New Year. The subreddit is furious. Jonathan is at peace." }
        ]
      },
      posts: [
        { t: "Temple farm makes 200 exalts an hour. Do it before they are back from the beach", f: 'Guide', hot: true },
        { t: "I am a bear", f: 'Fluff' }
      ]
    },
    {
      id: 'c_mirage', kind: 'expansion', ver: '3.28.0', name: 'Mirage', date: '2026-03-06', realPeak: 184284, icon: 'orb',
      blurb: "Djinn, wishes and a full rebuild of the Atlas. Maps now live on the Atlas itself and the passive tree has 138 points on it.",
      reality: "Mirage launched 6 March 2026 with login queues and lag in Europe, and ran 20 weeks. Three weeks in, GGG banned the founder of the biggest trading Discord with no public reason.",
      posts: [
        { t: "Mirage might be the best state PoE1 has ever been in", f: 'Discussion', when: 'good' },
        { t: "Queue, disconnect, queue. It is a real league launch", f: 'Complaint', when: 'queue' }
      ]
    },
    {
      id: 'c_ancients', kind: 'poe2', ver: 'PoE2 0.5.0', name: 'Return of the Ancients', date: '2026-05-29', realPeak: 420409, icon: 'totem',
      blurb: "The last big early access patch. A rebuilt Atlas with fifty hours of new content, fifteen bosses and build guides inside the client. After this the only thing left to ship is the game.",
      reality: "Return of the Ancients peaked at 420,409 on Steam, the best since launch month, and needed twelve hotfixes in five days.",
      posts: [
        { t: "A crab killed me. An ordinary crab", f: 'Complaint', hot: true, c: "third deadliest monster in the game" },
        { t: "0.5 is what the game should have been at launch", f: 'Discussion' }
      ]
    },
    {
      id: 'c_allflame', kind: 'league', ver: '3.29.0', name: 'Curse of the Allflame', date: '2026-07-24', realPeak: 187116, icon: 'fire',
      blurb: "Sunken artifacts and things from the deep. Charts, voyages, and the mercenaries are back. The convention is in November and everything interesting is being saved for it.",
      reality: "Curse of the Allflame launched 24 July 2026 to a split reception. Within three days GGG conceded the rewards fell short and added 20 to 40 percent more loot.",
      posts: [
        { t: "Another boat league. I am not complaining", f: 'Fluff' },
        { t: "Rewards buffed on day 3. Tradition", f: 'Discussion' }
      ]
    },
    {
      id: 'c_rites', kind: 'poe2', ver: 'PoE2 0.5.5', name: 'Forbidden Rites', date: '2026-09-04', realPeak: 147624, icon: 'card',
      blurb: "An event league to keep the sequel warm until its full release. Fresh economy, eight challenges. Every real feature is being held back for the convention stage.",
      reality: "Forbidden Rites launched 4 September 2026 and peaked at 147,624 on Steam. Eight days later Blizzard revealed Diablo V for spring 2029.",
      posts: [
        { t: "An event league before 1.0. I will take it", f: 'Discussion' },
        { t: "Swords in December. I will believe it when I am holding one", f: 'Meme' }
      ]
    },
    {
      id: 'c_con26', kind: 'con', ver: 'Keynote', name: 'ExileCon 2026', date: '2026-11-07', icon: 'stage',
      blurb: "The third convention, in Auckland. The keynote has to date the sequel's full release, show its last two acts and two new classes, and reveal the next expansion for the old game. The demo build is the release.",
      reality: "ExileCon 2026 ran 7 to 8 November in Auckland. Path of Exile 2 was dated for 11 December 2026, free to play, with Conquerors of Wraeclast as its launch league. When this game was written, neither that nor Covens of Umbra had launched.",
      onLaunch: { hype: 15, sanity: 5 },
      dilemma: {
        text: "The designers start from the stage and work backwards. What would nobody expect you to announce?",
        choices: [
          { label: "A league where players raise armies and fight over a hundred castles", fx: { content: -0.1, q: 0.1, egg: 'conquerors' },
            result: "It began when Mark set up a battle, sent Jonathan a screenshot and said they had a league. Chris, shown a teaser with no context, asks what game it is. He works it out because the picture has no sky.",
            reality: "Both stories were told at the ExileCon 2026 roundtable. Chris said he would have argued for a tiny launch league nobody would notice. Jonathan went big." },
          { label: "A tiny launch league nobody will notice", fx: { sanity: 6, content: 0.1 },
            result: "A calm keynote. The campaign carries it. Chris, in the audience, approves." }
        ]
      }
    },
    {
      id: 'c_sim', kind: 'sim', ver: 'One more thing', name: 'GGG Simulator', date: '2026-12-21', icon: 'garage',
      blurb: "Sunday morning at ExileCon, the founders sit down for a roundtable. Someone asks what each of them would make if it could not be an action RPG. Jonathan says a city builder. Chris says an idea just hit him. A tycoon game about running a live-service action RPG, with limited people and limited time split between bugs and content, where you read the Reddit posts inside the game. Someone says that sounds like hell. Chris says that is the point. On Monday there is a new line on the whiteboard and nobody admits to writing it.",
      reality: "That bit runs about ninety seconds from 25:39 of the ExileCon 2026 Founders Roundtable. Chris Wilson said he would make it one day. This is a fan's version, made in the meantime.",
      dilemma: {
        free: true,
        text: "The pitch meeting for the simulator.",
        choices: [
          { label: "Make the player feel all of it. The queue, the nerfs, the comments.", fx: { vision: 10, egg: 'sim' },
            result: "The design doc is one line long. It is hell, and that is the point." },
          { label: "Make it fun", fx: { vision: -10, mood: 5, egg: 'sim' },
            result: "Someone asks what fun would mean here. The meeting runs long." }
        ]
      }
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
