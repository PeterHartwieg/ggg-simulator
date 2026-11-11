/* Headless balance check. Runs the real engine and data under Node with a few
   scripted play styles and prints how each release went.
   Usage: node tools/sim.js [par|lazy|greedy|casual|crunch|chaos] [-v]
   casual never hires or touches a flask. crunch does the same with crunch switched on whenever it is off.
   chaos is casual with a random answer to every card. As in the game, a wrong answer to a
   decision the real studio faced is overruled, so only the free decisions are truly random. */
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, Date: Date, JSON: JSON };
ctx.globalThis = ctx;
vm.createContext(ctx);
['js/util.js', 'js/data/tune.js', 'js/data/cycles.js', 'js/data/events.js', 'js/data/randoms.js',
  'js/data/requests.js', 'js/data/feed.js', 'js/data/eggs.js', 'js/engine.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
});
var G = ctx.GGG, E = G.engine, D = G.data, U = G.util;
E.init();

var mode = process.argv[2] && process.argv[2][0] !== '-' ? process.argv[2] : 'par';
var verbose = process.argv.indexOf('-v') >= 0;
var seed = 12345;
E.rand = function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

var HANDS_OFF = { casual: 1, crunch: 1, chaos: 1 };
function staffUp(S) {
  if (HANDS_OFF[mode]) return;
  // Hire toward a multiple of the real studio's headcount, in the par mix.
  var mult = mode === 'lazy' ? 0.6 : mode === 'greedy' ? 1.35 : 1.0;
  var want = E.parHeadcount(S.week + 20) * mult;
  while (E.headcount(S) + 2 > E.capacity(S) && E.nextOffice(S) && S.money > E.nextOffice(S).cost * 1.5) E.moveOffice(S);
  var guard = 0;
  while (E.headcount(S) < want && E.canHire(S) > 0 && guard++ < 400) {
    var best = null, gap = -1e9;
    E.DEPTS.forEach(function (d) {
      var g = want * E.COMP[d] - S.staff[d];
      if (g > gap) { gap = g; best = d; }
    });
    if (S.money < E.hireCost(S, 1) * 6 || !E.hire(S, best, 1)) break;
  }
}

function play() {
  var S = E.newGame(), ticks = 0, modals = 0, broke = 0, minMoney = 1e12, brokeAt = [];
  while (!S.over && ticks < 20000) {
    if (S.pending) {
      modals++;
      var t = S.pending.type;
      if (t === 'intro') {
        var dl = E.cycle(S).dilemma;
        E.resolveIntro(S, !dl ? null : mode === 'chaos' && dl.free ? Math.floor(E.rand() * dl.choices.length) : mode === 'chaos' ? (dl.canon || 0) : 0);
        staffUp(S);
      }
      else if (t === 'event') {
        var ev = E.pendingEvent(S);
        if (ev.id === 'sys_broke') { broke++; brokeAt.push(U.fmtDate(S.week)); }
        var fixed = ev.date && !ev.free;
        E.choose(S, mode !== 'chaos' ? 0 : fixed ? (ev.canon || 0) : Math.floor(E.rand() * E.choices(S, ev).length));
      } else if (t === 'launch') {
        var r = S.pending.result;
        if (verbose || true) {
          console.log([U.fmtDate(r.week).padEnd(9), (r.ver + ' ' + r.name).slice(0, 34).padEnd(34),
            'Q' + r.quality.toFixed(2), 'c' + r.contentQ.toFixed(2), 'p' + r.polishQ.toFixed(2),
            r.futQ != null ? 'f' + r.futQ.toFixed(2) : '     ',
            r.online ? (U.short(r.peak) + '/' + U.short(r.realPeak)).padEnd(13) : ''.padEnd(13),
            (r.crash ? 'CRASH' : r.queue ? 'queue' : '     '), 'b' + r.bugs,
            'mood' + Math.round(S.mood), 'hype' + Math.round(r.hype), 'san' + Math.round(S.sanity), 'debt' + Math.round(S.debt),
            'staff' + E.headcount(S) + '/' + Math.round(E.parHeadcount(S.week)), U.money(S.money)].join(' '));
        }
        E.closeLaunch(S);
      } else break;
      continue;
    }
    // Press the desync button like a player would.
    if (S.week % 6 === 0 && !HANDS_OFF[mode]) E.clickRequest(S, 'desync');
    if (mode === 'crunch' && !S.crunch && S.sanity > 60) S.crunch = true;
    E.tick(S); ticks++;
    if (S.money < minMoney) minMoney = S.money;
  }
  var e = E.ending(S);
  console.log('\nmode=' + mode + ' ticks=' + ticks + ' modals=' + modals + ' broke=' + broke +
    ' minMoney=' + U.money(minMoney) + ' final=' + U.money(S.money) + ' revenue=' + U.money(e.revenue));
  console.log('beat ' + e.beat + '/' + e.launches + ' avgQ=' + e.avgQ.toFixed(2) + ' vsReality=' + e.vsReality.toFixed(2) +
    ' mood=' + Math.round(e.mood) + ' vision=' + Math.round(e.vision) + ' eggs=' + e.eggs + '/' + e.eggTotal +
    ' fired=' + Object.keys(S.fired).length + ' feed posts seen=' + Object.keys(S.seen).length);
  if (brokeAt.length) console.log('broke in: ' + brokeAt.join(', '));
}
play();
