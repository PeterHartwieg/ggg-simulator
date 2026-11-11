/* Game rules. No DOM in here, so tools/sim.js can run the same code under Node. */
(function (root) {
  'use strict';
  var GGG = root.GGG, U = GGG.util, D = GGG.data;
  var E = GGG.engine = {};

  var STREAMS = E.STREAMS = ['content', 'polish', 'mtx', 'infra', 'future'];
  var MAKERS = ['code', 'art', 'design', 'qa'];
  E.DEPTS = ['code', 'art', 'design', 'qa', 'comm'];
  E.PIPS = 10;
  E.rand = Math.random;

  /* How much of a discipline's time each kind of work can soak up. */
  var AFF = {
    content: { code: 1.0, art: 1.0, design: 1.6, qa: 0 },
    polish: { code: 0.5, art: 0, design: 0.8, qa: 2.0 },
    mtx: { code: 0.15, art: 1.2, design: 0.2, qa: 0.1 },
    infra: { code: 1.6, art: 0, design: 0, qa: 0.3 },
    future: { code: 1.0, art: 1.0, design: 1.0, qa: 0.2 }
  };
  /* The "par" studio: real GGG headcount, a sensible staff mix, a sensible focus. */
  var COMP = E.COMP = { code: 0.30, art: 0.31, design: 0.18, qa: 0.12, comm: 0.09 };
  var PAR = { content: 5, polish: 2, mtx: 1, infra: 1, future: 1 };

  var listeners = [];
  E.on = function (fn) { listeners.push(fn); };
  function emit(type, data) { for (var i = 0; i < listeners.length; i++) listeners[i](type, data); }
  E.emit = emit;

  /* ---------- setup ---------- */

  E.init = function () {
    D.events.forEach(function (ev) { ev._w = ev.date ? U.weekOf(ev.date) : null; });
    D.events.sort(function (a, b) { return (a._w == null ? 1e9 : a._w) - (b._w == null ? 1e9 : b._w); });
    D.futures.forEach(function (f) {
      f._start = U.weekOf(f.start);
      var c = D.cycles.filter(function (x) { return x.id === f.cycle; })[0];
      f._due = U.weekOf(c.date);
      f._target = 0;
    });
    D.futures.forEach(function (f) {
      for (var w = f._start; w < f._due; w++) f._target += parRates(w).future;
    });
    D.requests.forEach(function (r) {
      r._from = U.weekOf(r.from);
      r._until = r.until ? U.weekOf(r.until) : null;
    });
    D.feed.forEach(function (p, i) { p._i = i; });
    E._eventById = {};
    D.events.concat(D.randoms, D.system).forEach(function (ev) { E._eventById[ev.id] = ev; });
  };

  E.newGame = function () {
    var S = {
      v: 1, week: 0, money: D.tune.startMoney,
      staff: { code: 1, art: 0, design: 1, qa: 0, comm: 0 },
      founders: 2, heroes: [], office: 0,
      alloc: { content: 6, polish: 2, mtx: 0, infra: 2, future: 0 },
      crunch: false, serverTier: 1,
      mood: 60, hype: 0, vision: 70, sanity: 85, debt: 5, rep: 1,
      players: 0, peak: 0, floor: 0, launchWeek: -1, decay: 0.2,
      mtxQ: 1, revMult: 1,
      ci: 0, cyc: null, fut: { pts: 0, done: {}, id: null, scale: 1 }, postQueue: [],
      hiresLeft: 2, flags: {}, fired: {}, eggs: {}, seen: {}, req: {},
      history: [], chart: [], feed: [], log: [],
      tot: { revenue: 0, beat: 0, launches: 0, crunchWeeks: 0, choices: 0 },
      lastRandom: 0, redWeeks: 0, pending: null, over: false
    };
    startCycle(S);
    return S;
  };

  /* ---------- people and production ---------- */

  E.headcount = function (S) {
    var n = 0;
    E.DEPTS.forEach(function (d) { n += S.staff[d] || 0; });
    return n;
  };
  E.parHeadcount = function (week) { return U.curve(D.tune.headcount, U.yearOf(week)); };
  E.salary = function (year) { return U.curve(D.tune.salary, year); };
  E.capacity = function (S) { return D.offices[S.office].cap; };

  function heroSum(S, key) {
    var v = 0;
    for (var i = 0; i < S.heroes.length; i++) {
      var h = D.heroes[S.heroes[i]];
      if (h && h.perk && h.perk[key]) v += h.perk[key];
    }
    return v;
  }
  E.heroSum = heroSum;

  E.overstaff = function (S) { return E.headcount(S) / Math.max(3, E.parHeadcount(S.week)); };
  E.prod = function (S) {
    var p = 0.7 + 0.4 * S.sanity / 100;
    p *= 1 - S.debt / 300;
    if (S.crunch) p *= 1.3;
    var over = E.overstaff(S);
    if (over > 1) p *= (1 + (over - 1) * 0.5) / over;
    return p * (1 + heroSum(S, 'prod'));
  };

  function split(alloc, dept) {
    var out = {}, sum = 0;
    STREAMS.forEach(function (s) { out[s] = alloc[s] * (AFF[s][dept] || 0); sum += out[s]; });
    if (sum <= 0) return null;
    STREAMS.forEach(function (s) { out[s] /= sum; });
    return out;
  }
  function rawRates(staff, alloc, prod) {
    var r = { content: 0, polish: 0, mtx: 0, infra: 0, future: 0 };
    MAKERS.forEach(function (d) {
      var n = staff[d] || 0;
      if (!n) return;
      var sh = split(alloc, d);
      if (!sh) { r.content += n * 0.3 * prod; return; } // nothing they can do: they "help"
      STREAMS.forEach(function (s) { r[s] += n * sh[s] * prod; });
    });
    return r;
  }

  function mtxOpenAt(week) { return week >= U.weekOf(D.tune.mtxFrom); }
  function futureAt(week) {
    for (var i = 0; i < D.futures.length; i++) {
      var f = D.futures[i];
      if (week >= f._start && week < f._due) return f;
    }
    return null;
  }
  function parAlloc(week) {
    var a = { content: PAR.content, polish: PAR.polish, mtx: PAR.mtx, infra: PAR.infra, future: PAR.future };
    if (!mtxOpenAt(week)) { a.content += a.mtx; a.mtx = 0; }
    if (!futureAt(week)) { a.content += a.future; a.future = 0; }
    return a;
  }
  function parRates(week) {
    var h = E.parHeadcount(week), staff = {};
    MAKERS.forEach(function (d) { staff[d] = h * COMP[d]; });
    return rawRates(staff, parAlloc(week), 1);
  }
  E.parRates = parRates;

  E.futTarget = function (S, f) { return f._target * (S.fut.scale || 1); };
  E.activeFuture = function (S) {
    for (var i = 0; i < D.futures.length; i++) {
      var f = D.futures[i];
      if (!S.fut.done[f.id] && S.week >= f._start) return f;
    }
    return null;
  };

  E.rates = function (S) {
    var r = rawRates(S.staff, S.alloc, E.prod(S));
    STREAMS.forEach(function (s) { r[s] *= 1 + heroSum(S, s); });
    if (!E.activeFuture(S)) r.future = 0;
    if (!S.flags.u_mtx) r.mtx = 0;
    return r;
  };

  E.commRatio = function (S) {
    var par = Math.max(0.6, E.parHeadcount(S.week) * COMP.comm);
    return U.clamp((S.staff.comm || 0) / par, 0, 1.6);
  };

  /* ---------- money ---------- */

  function mtxFactor(S) { return S.flags.u_mtx ? U.clamp(0.45 + 0.6 * S.mtxQ, 0.4, 1.5) * (1 + heroSum(S, 'rev')) : 0; }
  function moodFactor(S) { return 0.7 + 0.6 * S.mood / 100; }

  E.finance = function (S) {
    var T = D.tune, y = U.yearOf(S.week);
    var paid = E.headcount(S) - (S.flags.foundersPaid ? 0 : S.founders);
    var payroll = Math.max(0, paid) * E.salary(y);
    var rent = D.offices[S.office].rent;
    var servers = S.flags.u_servers
      ? Math.max(S.players, S.peak * 0.15, 500) * T.serverCost * [0.6, 1, 1.7][S.serverTier] : 0;
    var revenue = S.players * U.curve(T.arpu, y) * mtxFactor(S) * moodFactor(S) * S.revMult;
    var costs = payroll + rent + servers;
    var gross = revenue - costs;
    var cut = S.flags.ownerShare && gross > 0 ? gross * S.flags.ownerShare : 0;
    return { payroll: payroll, rent: rent, servers: servers, revenue: revenue, costs: costs, cut: cut, net: gross - cut };
  };

  function weeklyBase(S) { return Math.max(E.finance(S).payroll, D.tune.minWeek); }

  /* ---------- player actions ---------- */

  E.freePips = function (S) {
    var used = 0;
    STREAMS.forEach(function (s) { used += S.alloc[s]; });
    return E.PIPS - used;
  };
  E.streamOpen = function (S, s) {
    if (s === 'mtx') return !!S.flags.u_mtx;
    if (s === 'future') return !!E.activeFuture(S);
    return true;
  };
  E.setPip = function (S, s, delta) {
    if (!E.streamOpen(S, s)) return false;
    if (delta > 0 && E.freePips(S) <= 0) {
      // Take from the fattest other stream so one click always does something.
      var from = null;
      STREAMS.forEach(function (o) { if (o !== s && S.alloc[o] > 0 && (!from || S.alloc[o] > S.alloc[from])) from = o; });
      if (!from) return false;
      S.alloc[from]--;
    }
    if (delta < 0 && S.alloc[s] <= 0) return false;
    S.alloc[s] += delta > 0 ? 1 : -1;
    return true;
  };

  E.hireCost = function (S, n) { return n * E.salary(U.yearOf(S.week)) * D.tune.hireWeeks; };
  E.canHire = function (S) {
    return Math.max(0, Math.min(S.hiresLeft, E.capacity(S) - E.headcount(S)));
  };
  E.hire = function (S, dept, n) {
    n = Math.min(n, E.canHire(S));
    while (n > 0 && E.hireCost(S, n) > S.money) n--;
    if (n <= 0) return 0;
    S.money -= E.hireCost(S, n);
    S.staff[dept] += n;
    S.hiresLeft -= n;
    return n;
  };
  E.fire = function (S, dept, n) {
    var min = (dept === 'code' || dept === 'design') ? 1 : 0;
    n = Math.min(n, S.staff[dept] - min);
    if (n <= 0) return 0;
    S.staff[dept] -= n;
    S.sanity = U.clamp(S.sanity - 1.5 * n, 0, 100);
    return n;
  };
  /* One-button hiring: fills the biggest gap against the real studio's mix and moves office when full. */
  E.hireMix = function (S, n) {
    var hired = 0;
    for (var i = 0; i < n; i++) {
      if (E.headcount(S) >= E.capacity(S) && !E.moveOffice(S)) break;
      var want = Math.max(E.headcount(S) + 1, E.parHeadcount(S.week)), best = null, gap = -1e9;
      E.DEPTS.forEach(function (d) { var g = want * COMP[d] - S.staff[d]; if (g > gap) { gap = g; best = d; } });
      if (!E.hire(S, best, 1)) break;
      hired++;
    }
    return hired;
  };
  E.marketingCost = function (S) { return Math.max(15000, Math.round(E.finance(S).payroll * 3)); };
  E.canMarket = function (S) { return !!S.flags.announced && !!E.cycle(S).realPeak && !S.cyc.marketed; };
  E.marketing = function (S) {
    var cost = E.marketingCost(S);
    if (!E.canMarket(S) || S.money < cost) return false;
    S.money -= cost;
    S.cyc.marketed = true;
    return true;
  };
  E.nextOffice = function (S) { return D.offices[S.office + 1] || null; };
  E.moveOffice = function (S) {
    var o = E.nextOffice(S);
    if (!o || S.money < o.cost) return false;
    S.money -= o.cost;
    S.office++;
    S.sanity = U.clamp(S.sanity + 6, 0, 100);
    return true;
  };

  /* ---------- cycles (one per release) ---------- */

  E.cycle = function (S) { return D.cycles[S.ci]; };
  E.shipWeek = function (S) { return U.weekOf(E.cycle(S).date) + (S.cyc.delay || 0); };
  E.stepOf = function (c) { return c.step || (c.kind === 'proto' ? 4 : c.kind === 'beta' ? 2 : 1); };

  function targets(from, to, scope) {
    var t = { content: 0, polish: 0, mtx: 0, infra: 0 };
    for (var w = from; w < to; w++) {
      var r = parRates(w);
      t.content += r.content; t.polish += r.polish; t.mtx += r.mtx; t.infra += r.infra;
    }
    t.content *= scope || 1;
    return t;
  }

  function unlock(S, k) {
    if (S.flags['u_' + k]) return;
    S.flags['u_' + k] = true;
    if (k === 'mtx' && S.alloc.mtx === 0) givePip(S, 'mtx');
  }
  function givePip(S, s) {
    if (E.freePips(S) > 0) { S.alloc[s]++; return; }
    if (S.alloc.content > 1) { S.alloc.content--; S.alloc[s]++; }
  }

  function startCycle(S) {
    var c = D.cycles[S.ci];
    S.cyc = {
      start: S.week, delay: 0, asked: false,
      pts: { content: 0, polish: 0, mtx: 0, infra: 0 },
      mods: { peak: 1, ret: 1, rev: 1, q: 0, mood: 0 }
    };
    var ship = Math.max(U.weekOf(c.date), S.week + 1);
    S.cyc.target = targets(S.week, ship, c.scope);
    (c.unlock || []).forEach(function (k) { unlock(S, k); });
    S.hiresLeft = Math.max(2, Math.min(D.tune.hireCap, Math.ceil(E.headcount(S) * D.tune.hireRate))) * Math.max(1, Math.round((ship - S.week) / 16));
    if (c.onStart) E.apply(S, c.onStart(S));
    S.pending = { type: 'intro', id: c.id };
  }

  /* Player answers the cycle's opening dilemma (or just clicks through). */
  E.resolveIntro = function (S, idx) {
    var c = E.cycle(S), out = null;
    if (c.dilemma && idx != null) {
      var ch = c.dilemma.choices[idx];
      out = { text: ch.result || '', reality: ch.reality || c.dilemma.reality || '', chips: E.apply(S, ch.fx), label: ch.label };
      S.tot.choices++;
      S.log.push({ w: S.week, id: c.id, pick: idx });
    }
    S.pending = null;
    return out;
  };

  E.projection = function (S) {
    var ship = E.shipWeek(S), left = Math.max(0, ship - S.week), r = E.rates(S), out = {};
    var span = Math.max(1, ship - S.cyc.start);
    ['content', 'polish', 'mtx', 'infra'].forEach(function (s) {
      var t = S.cyc.target[s] || 0;
      out[s] = t > 0
        ? { now: S.cyc.pts[s] / t, proj: (S.cyc.pts[s] + r[s] * left) / t }
        : { now: 0, proj: 0 };
    });
    var f = E.activeFuture(S);
    if (f) {
      var fl = Math.max(0, f._due - S.week);
      var ft = E.futTarget(S, f);
      out.future = { now: S.fut.pts / ft, proj: (S.fut.pts + r.future * fl) / ft, name: f.name, due: f._due };
    }
    out.elapsed = U.clamp((S.week - S.cyc.start) / span, 0, 1);
    out.weeksLeft = left;
    return out;
  };

  /* ---------- effects ---------- */

  var STAT_LABEL = { mood: 'Reddit', hype: 'Hype', vision: 'Vision', sanity: 'Sanity', debt: 'Tech debt' };

  E.apply = function (S, fx) {
    var chips = [];
    if (!fx) return chips;
    function chip(text, good) { chips.push({ text: text, good: good }); }
    function cash(amount) {
      if (!amount) return;
      S.money += amount;
      if (amount > 0) S.tot.revenue += amount;
      chip((amount > 0 ? '+' : '') + U.money(amount), amount > 0);
    }
    cash(fx.money);
    if (fx.moneyW) cash(Math.round(fx.moneyW * weeklyBase(S)));
    if (fx.revW) cash(Math.round(fx.revW * Math.max(E.finance(S).revenue, D.tune.minWeek)));
    ['mood', 'hype', 'vision', 'sanity', 'debt'].forEach(function (k) {
      if (!fx[k]) return;
      var dv = fx[k];
      if (k === 'vision') {
        if (dv > 0 && S.vision > 60) dv *= Math.max(0.15, (100 - S.vision) / 40);
        if (dv < 0 && S.vision < 40) dv *= Math.max(0.15, S.vision / 40);
      }
      S[k] = U.clamp(S[k] + dv, 0, 100);
      var good = k === 'debt' ? fx[k] < 0 : fx[k] > 0;
      chip(STAT_LABEL[k] + ' ' + (fx[k] > 0 ? '+' : '') + fx[k], k === 'vision' ? null : good);
    });
    if (fx.rep) { S.rep = U.clamp(S.rep + fx.rep, 0.4, 2); chip('Reputation ' + (fx.rep > 0 ? 'up' : 'down'), fx.rep > 0); }
    if (fx.staff) {
      Object.keys(fx.staff).forEach(function (d) {
        var min = (d === 'code' || d === 'design') ? 1 : 0;
        S.staff[d] = Math.max(min, (S.staff[d] || 0) + fx.staff[d]);
        chip((fx.staff[d] > 0 ? '+' : '') + fx.staff[d] + ' ' + D.depts[d].short, fx.staff[d] > 0);
      });
    }
    if (fx.staffPct > 0) {
      E.DEPTS.forEach(function (d) { S.staff[d] = Math.round(S.staff[d] * (1 + fx.staffPct)); });
      chip('+' + Math.round(fx.staffPct * 100) + '% staff', true);
    } else if (fx.staffPct < 0) {
      var gone = cutStaff(S, -fx.staffPct);
      if (gone) chip('-' + gone + ' staff', false);
    }
    if (fx.flags) Object.keys(fx.flags).forEach(function (k) { S.flags[k] = fx.flags[k]; });
    if (fx.unlock) fx.unlock.forEach(function (k) { unlock(S, k); });
    if (fx.peak) { S.cyc.mods.peak *= fx.peak; chip('Launch crowd ' + pct(fx.peak), fx.peak > 1); }
    if (fx.ret) { S.cyc.mods.ret *= fx.ret; chip('Retention ' + pct(fx.ret), fx.ret > 1); }
    if (fx.rev) { S.cyc.mods.rev *= fx.rev; chip('Launch sales ' + pct(fx.rev), fx.rev > 1); }
    if (fx.q) { S.cyc.mods.q += fx.q; chip('Release quality ' + (fx.q > 0 ? 'up' : 'down'), fx.q > 0); }
    if (fx.content) { S.cyc.pts.content += fx.content * S.cyc.target.content; chip('Content ' + signPct(fx.content), fx.content > 0); }
    if (fx.polish) { S.cyc.pts.polish += fx.polish * S.cyc.target.polish; chip('Polish ' + signPct(fx.polish), fx.polish > 0); }
    if (fx.future) {
      var f = E.activeFuture(S);
      if (f) { S.fut.pts = Math.max(0, S.fut.pts + fx.future * E.futTarget(S, f)); chip(f.short + ' ' + signPct(fx.future), fx.future > 0); }
    }
    if (fx.futScale) { S.fut.scale = (S.fut.scale || 1) * fx.futScale; chip('Long game scope ' + pct(fx.futScale), null); }
    if (fx.revMult) { S.revMult *= fx.revMult; chip('Income ' + pct(fx.revMult) + ' for good', fx.revMult > 1); }
    if (fx.players) {
      S.peak *= fx.players; S.floor *= fx.players; S.players *= fx.players;
      chip('Players ' + pct(fx.players), fx.players > 1);
    }
    if (fx.delay) {
      S.cyc.delay += fx.delay;
      var dw = Math.abs(fx.delay);
      chip('Ships ' + dw + (dw === 1 ? ' week ' : ' weeks ') + (fx.delay > 0 ? 'late' : 'early'), false);
    }
    if (fx.hero && S.heroes.indexOf(fx.hero) < 0 && D.heroes[fx.hero]) {
      S.heroes.push(fx.hero);
      chip(D.heroes[fx.hero].name + ' joins', true);
    }
    if (fx.office && S.office < fx.office) S.office = fx.office;
    if (fx.egg) E.egg(S, fx.egg);
    if (fx.post) [].concat(fx.post).forEach(function (p) { E.post(S, p); });
    if (fx.fn) fx.fn(S, chip);
    return chips;
  };
  /* Let go a share of the whole studio, so a small team still loses someone. The largest
     departments go first, in proportion, and one coder and one designer always stay. */
  var KEEP = { code: 1, design: 1 };
  E.removable = function (S) {
    var n = 0;
    E.DEPTS.forEach(function (d) { n += Math.max(0, (S.staff[d] || 0) - (KEEP[d] || 0)); });
    return n;
  };
  function cutStaff(S, frac) {
    var before = E.headcount(S), cut = Math.max(1, before - Math.round(before * (1 - frac))), gone = 0, aim = {};
    E.DEPTS.forEach(function (d) { aim[d] = (S.staff[d] || 0) * (1 - frac); });
    while (gone < cut) {
      var pick = null, over = -1e9;
      E.DEPTS.forEach(function (d) {
        if ((S.staff[d] || 0) <= (KEEP[d] || 0)) return;
        var o = S.staff[d] - aim[d];
        if (o > over) { over = o; pick = d; }
      });
      if (!pick) break;
      S.staff[pick]--; gone++;
    }
    return gone;
  }
  /* The layoff button: shown while the studio is bigger than the real one or the account is empty. */
  E.layoffShown = function (S) { return E.headcount(S) > E.parHeadcount(S.week) * 1.1 || S.money < 0; };
  E.canLayoff = function (S) { return E.removable(S) > 0; };
  E.layoff = function (S) {
    if (!E.canLayoff(S)) return null;
    var gone = cutStaff(S, 0.1), chips = [{ text: '-' + gone + ' staff', good: false }];
    S.sanity = U.clamp(S.sanity - 12, 0, 100);
    chips.push({ text: 'Sanity -12', good: false });
    if (S.flags.announced) {
      S.mood = U.clamp(S.mood - 6, 0, 100);
      chips.push({ text: 'Reddit -6', good: false });
      E.post(S, { t: gone === 1 ? 'GGG let a developer go today' : 'GGG let {n} developers go today', f: 'Discussion', c: 'who fixes desync now', hot: true }, { n: gone });
    }
    S.tot.layoffs = (S.tot.layoffs || 0) + gone;
    return { gone: gone, chips: chips };
  };
  function pct(mult) { var p = Math.round((mult - 1) * 100); return (p > 0 ? '+' : '') + p + '%'; }
  function signPct(frac) { var p = Math.round(frac * 100); return (p > 0 ? '+' : '') + p + '%'; }

  /* ---------- community requests ----------
     Features the players keep asking for. Each costs hours (1 point = one
     person-week = 40 hours) taken straight out of the current release. */

  E.HOURS = 40;
  E.openRequests = function (S) {
    return D.requests.filter(function (r) {
      var st = S.req[r.id];
      if (st && st.built != null) return false;
      if (S.week < r._from) return false;
      if (r._until != null && S.week >= r._until) return false;
      return !r.cond || r.cond(S);
    });
  };
  E.requestVotes = function (S, r) {
    var age = Math.max(0, S.week - r._from);
    return Math.round((r.votes || 400) * (1 + age / 40) * U.curve(D.tune.upvotes, U.yearOf(S.week)) / 2000);
  };
  E.bankedHours = function (S) { return Math.max(0, S.cyc.pts.content) * E.HOURS; };
  E.buildRequest = function (S, id) {
    var r = D.requests.filter(function (x) { return x.id === id; })[0];
    if (!r || r.kind === 'click') return null;
    var cost = r.hours / E.HOURS;
    if (S.cyc.pts.content < cost) return { ok: false, need: r.hours, have: Math.floor(E.bankedHours(S)) };
    S.cyc.pts.content -= cost;
    S.req[id] = { built: S.week };
    var chips = E.apply(S, r.fx);
    S.tot.requests = (S.tot.requests || 0) + 1;
    return { ok: true, text: r.done || '', reality: r.real || '', chips: chips, name: r.name };
  };
  /* The button you press for eight years. */
  E.clickRequest = function (S, id) {
    var r = D.requests.filter(function (x) { return x.id === id; })[0];
    if (!r || r.kind !== 'click') return null;
    var st = S.req[id] || (S.req[id] = { clicks: 0 });
    if (st.built != null) return null;
    st.clicks++;
    if (st.clicks >= r.clicks && S.week >= U.weekOf(r.earliest)) {
      st.built = S.week;
      var chips = E.apply(S, r.fx);
      return { ok: true, done: true, text: r.done || '', reality: r.real || '', chips: chips, name: r.name };
    }
    if (r.clickEgg && st.clicks === 8) E.egg(S, r.clickEgg);
    var lines = r.lines || ['Nothing happens.'];
    return { ok: true, done: false, clicks: st.clicks, text: lines[Math.min(lines.length - 1, Math.floor(st.clicks / (r.every || 5)))] };
  };

  /* Vaal or no balls: once per release, corrupt it. Unpredictable, cannot be undone. */
  E.vaal = function (S) {
    if (!S.flags.vaal || S.cyc.vaaled) return null;
    S.cyc.vaaled = true;
    E.egg(S, 'vaalorb');
    var r = E.rand(), out;
    if (r < 0.25) {
      out = { title: 'Bricked', text: 'The release is now a worse release. A third of the content has corrupted into something nobody can use.', chips: E.apply(S, { content: -0.3, sanity: -4, egg: 'vaalbrick' }) };
    } else if (r < 0.5) {
      out = { title: 'No effect', text: 'Nothing changed, except that the release is now corrupted and you can never try this again. Classic.', chips: [] };
    } else if (r < 0.78) {
      out = { title: 'It hit', text: 'An implicit you did not ask for and very much want. The whole release is better for it.', chips: E.apply(S, { q: 0.1, hype: 6 }) };
    } else {
      out = { title: 'Changed into something else', text: 'The release is now a different release of the same level. Hype and polish have swapped places.', chips: E.apply(S, { hype: 12, polish: -0.12 }) };
    }
    return out;
  };

  E.egg = function (S, id) {
    if (!D.eggs[id] || S.eggs[id]) return false;
    S.eggs[id] = S.week;
    emit('egg', id);
    return true;
  };
  E.eggCount = function (S) { return Object.keys(S.eggs).length; };

  /* ---------- events ---------- */

  function fire(S, ev) {
    if (!ev.repeat) S.fired[ev.id] = S.week;
    S.pending = { type: 'event', id: ev.id };
  }

  function checkScripted(S) {
    for (var i = 0; i < D.events.length; i++) {
      var ev = D.events[i];
      if (ev._w == null || ev._w > S.week) break;
      if (S.fired[ev.id]) continue;
      if (ev.cond && !ev.cond(S)) {
        if (S.week - ev._w > (ev.patience || 10)) S.fired[ev.id] = -1;
        continue;
      }
      fire(S, ev);
      return true;
    }
    return false;
  }

  function checkRandom(S) {
    var T = D.tune, y = U.yearOf(S.week);
    if (S.week - S.lastRandom < T.randomGap || E.rand() > T.randomRate) return false;
    var pool = D.randoms.filter(function (ev) {
      if (S.fired[ev.id]) return false;
      if (ev.y && (y < ev.y[0] || y >= ev.y[1])) return false;
      return !ev.cond || ev.cond(S);
    });
    if (!pool.length) return false;
    S.lastRandom = S.week;
    fire(S, U.pick(pool, E.rand));
    return true;
  }

  function checkMoney(S) {
    if (S.money >= 0) { S.redWeeks = 0; return false; }
    S.redWeeks++;
    if (S.redWeeks === 1 || S.redWeeks % 10 === 0) { fire(S, E._eventById.sys_broke); return true; }
    return false;
  }

  function checkReady(S) {
    var c = E.cycle(S);
    if (S.cyc.asked || !c.realPeak || c.kind === 'proto') return false;
    var left = E.shipWeek(S) - S.week;
    if (left > 2 || left < 1) return false;
    if (E.projection(S).content.proj >= 0.62) return false;
    S.cyc.asked = true;
    fire(S, E._eventById.sys_notready);
    return true;
  }

  E.pendingEvent = function (S) {
    return S.pending && S.pending.type === 'event' ? E._eventById[S.pending.id] : null;
  };
  E.choices = function (S, ev) {
    return (ev.choices || [{ label: 'Carry on' }]).filter(function (ch) { return !ch.cond || ch.cond(S); });
  };
  E.choose = function (S, idx) {
    var ev = E.pendingEvent(S);
    if (!ev) return null;
    var ch = E.choices(S, ev)[idx] || {};
    var chips = E.apply(S, ch.fx);
    var text = typeof ch.result === 'function' ? ch.result(S) : (ch.result || '');
    S.tot.choices++;
    S.log.push({ w: S.week, id: ev.id, pick: idx });
    S.pending = null;
    return { text: text, reality: ch.reality || ev.reality || '', chips: chips, label: ch.label };
  };

  /* ---------- the subreddit ---------- */

  E.feedCtx = function (S) {
    var c = E.cycle(S), last = null;
    for (var hi = S.history.length - 1; hi >= 0 && !last; hi--) if (S.history[hi].online) last = S.history[hi];
    var sinceLaunch = S.launchWeek >= 0 ? S.week - S.launchWeek : 999;
    var toShip = E.shipWeek(S) - S.week, ph;
    if (!S.flags.announced) ph = 'garage';
    else if (S.launchWeek < 0) ph = 'wait';
    else if (toShip <= 3 && c.realPeak) ph = 'tease';
    else if (sinceLaunch <= 2) ph = 'fresh';
    else if (sinceLaunch <= 7) ph = 'mid';
    else ph = 'dead';
    return { y: U.yearOf(S.week), ph: ph, lg: last ? last.id : null, next: c.id, nextName: c.name, lastName: last ? last.name : '' };
  };
  function postOk(S, p, ctx) {
    if (p.y && (ctx.y < p.y[0] || ctx.y >= p.y[1])) return false;
    if (p.mood && (S.mood < p.mood[0] || S.mood > p.mood[1])) return false;
    if (p.ph && p.ph.indexOf(ctx.ph) < 0) return false;
    if (p.lg && p.lg !== ctx.lg) return false;
    if (p.next && p.next !== ctx.next) return false;
    if (p.flag && !S.flags[p.flag]) return false;
    if (p.cond && !p.cond(S)) return false;
    return true;
  }
  function upvotes(S, hot) {
    var base = U.curve(D.tune.upvotes, U.yearOf(S.week));
    return Math.max(1, Math.round(base * (0.15 + E.rand() * E.rand() * 1.6) * (hot ? 2.5 : 1)));
  }
  E.post = function (S, p, extra) {
    if (typeof p === 'string') p = { t: p };
    var ctx = E.feedCtx(S);
    var vars = { league: ctx.lastName || 'the beta', next: ctx.nextName, year: Math.floor(ctx.y) };
    if (extra) Object.keys(extra).forEach(function (k) { vars[k] = extra[k]; });
    var item = {
      t: U.tpl(p.t, vars), f: p.f || 'Discussion', c: p.c ? U.tpl(p.c, vars) : '',
      up: p.up || upvotes(S, p.hot), w: S.week, g: !!p.g, hot: !!p.hot
    };
    S.feed.unshift(item);
    if (S.feed.length > 40) S.feed.length = 40;
    emit('post', item);
  };
  function maybePost(S) {
    if (E.rand() > D.tune.postRate) return;
    var ctx = E.feedCtx(S), pool = [], i, p;
    for (i = 0; i < D.feed.length; i++) {
      p = D.feed[i];
      if (S.seen[p._i] != null && (p.lg || p.next || S.week - S.seen[p._i] < 160)) continue;
      if (!postOk(S, p, ctx)) continue;
      pool.push(p);
      if (p.lg || p.next) { pool.push(p); pool.push(p); pool.push(p); } // topical beats generic
    }
    if (!pool.length) return;
    p = U.pick(pool, E.rand);
    S.seen[p._i] = S.week;
    E.post(S, p);
  }

  /* ---------- the weekly tick ---------- */

  E.tick = function (S) {
    if (S.pending || S.over) return;
    var steps = E.stepOf(E.cycle(S));
    for (var i = 0; i < steps && !S.pending; i++) week(S);
    emit('tick');
  };

  function week(S) {
    if (S.week >= E.shipWeek(S)) { launch(S); return; }
    S.week++;

    var r = E.rates(S), cy = S.cyc;
    cy.pts.content += r.content; cy.pts.polish += r.polish; cy.pts.mtx += r.mtx; cy.pts.infra += r.infra;
    var f = E.activeFuture(S);
    if (f) {
      if (S.fut.id !== f.id) { S.fut.id = f.id; S.fut.pts = 0; S.fut.scale = 1; if (S.alloc.future === 0) givePip(S, 'future'); emit('future', f); }
      S.fut.pts += r.future;
    } else if (S.alloc.future > 0) { S.alloc.content += S.alloc.future; S.alloc.future = 0; }

    var fin = E.finance(S);
    S.money += fin.net;
    S.tot.revenue += fin.revenue;

    if (S.launchWeek >= 0) {
      S.players = S.floor + (S.peak - S.floor) * Math.exp(-S.decay * (S.week - S.launchWeek));
    }
    S.chart.push(Math.round(S.players));

    // Tech debt: infra work pays it down, at par slightly slower than releases add it.
    var parInfra = parRates(S.week).infra;
    if (parInfra > 0) S.debt = U.clamp(S.debt - 0.32 * (r.infra / parInfra), 0, 100);

    // Sanity: crunch burns it, time off restores it.
    if (S.crunch) { S.sanity = U.clamp(S.sanity - 1.7, 0, 100); S.tot.crunchWeeks++; }
    else S.sanity += (78 - S.sanity) * 0.035;
    var month = U.monthOf(S.week);
    if (month === 11 && U.monthOf(S.week + 1) === 0) S.sanity = U.clamp(S.sanity + 5, 0, 100); // Christmas break

    S.vision += (60 - S.vision) * 0.004;
    if (S.flags.announced) {
      var cr = E.commRatio(S);
      var nag = 0; // requests ignored for more than half a year drag the subreddit down
      E.openRequests(S).forEach(function (rq) { if (S.week - rq._from > 26) nag += 0.9; });
      var target = 46 + 9 * cr - (S.vision - 60) / 6 + heroSum(S, 'mood') - Math.min(7, nag);
      S.mood += (target - S.mood) * 0.035;
      if (S.launchWeek >= 0 && S.week - S.launchWeek > 9) S.mood -= 0.2; // "league is dead"
      S.mood = U.clamp(S.mood, 0, 100);
      var toShip = E.shipWeek(S) - S.week;
      if (toShip <= 5 && E.cycle(S).realPeak) {
        S.hype = U.clamp(S.hype + 4.5 + 4 * cr + 4 * (S.rep - 0.8) + (S.mood - 50) / 20 + heroSum(S, 'hype'), 0, 100);
      } else {
        S.hype += (22 - S.hype) * 0.04;
      }
    }

    if (S.tot.crunchWeeks >= 52) E.egg(S, 'crunch');
    if (S.postQueue.length && E.rand() < 0.6) E.post(S, S.postQueue.shift());

    if (checkScripted(S)) return;
    if (checkMoney(S)) return;
    if (checkReady(S)) return;
    if (S.flags.announced && checkRandom(S)) return;
    if (S.flags.announced && !S.postQueue.length) maybePost(S);
  }

  /* ---------- launch day ---------- */

  function tierOf(q) {
    return q >= 1.2 ? 'legend' : q >= 1.02 ? 'great' : q >= 0.86 ? 'good' : q >= 0.7 ? 'mixed' : q >= 0.5 ? 'bad' : 'disaster';
  }
  E.TIER_NAME = { legend: 'Best league ever', great: 'Banger', good: 'Solid', mixed: 'Mixed', bad: 'Flop', disaster: 'Dumpster fire' };

  function launch(S) {
    var c = E.cycle(S), cy = S.cyc, T = D.tune, y = U.yearOf(S.week), q = {};
    ['content', 'polish', 'mtx', 'infra'].forEach(function (s) {
      q[s] = cy.target[s] > 0 ? cy.pts[s] / cy.target[s] : 1;
    });

    // A long-term project lands with this release.
    var fut = null, fq = null;
    D.futures.forEach(function (f) { if (f.cycle === c.id && !S.fut.done[f.id]) fut = f; });
    if (fut) {
      fq = S.fut.id === fut.id ? S.fut.pts / E.futTarget(S, fut) : 0;
      S.fut.done[fut.id] = fq;
      S.fut.pts = 0; S.fut.id = null; S.fut.scale = 1;
    }
    var contentQ = fq == null ? q.content : 0.4 * q.content + 0.6 * fq;
    contentQ = U.clamp(contentQ + cy.mods.q, 0, 1.5);
    var polishQ = U.clamp(q.polish, 0, 1.4);
    var quality = 0.72 * contentQ + 0.28 * polishQ;
    var online = !!c.realPeak;

    var res = {
      id: c.id, name: c.name, ver: c.ver || '', kind: c.kind, week: S.week,
      contentQ: contentQ, polishQ: polishQ, mtxQ: q.mtx, infraQ: q.infra, futQ: fq, futName: fut ? fut.name : null,
      quality: quality, tier: tierOf(quality), hype: S.hype, online: online,
      queue: false, crash: false, bugs: 0, peak: 0, realPeak: c.realPeak || 0, est: !!c.est, burst: 0, moodDelta: 0,
      bugList: [], posts: []
    };

    if (cy.marketed) S.hype = U.clamp(S.hype + 12, 0, 100);
    res.hype = S.hype;
    if (online) {
      var stability = [0.7, 1, 1.35][S.serverTier] * (0.7 + 0.3 * Math.min(q.infra, 1.4)) * (1 - S.debt / 250);
      var surge = (0.6 + 0.6 * S.hype / 100) * (0.92 + 0.2 * E.rand());
      var load = surge / stability;
      res.load = load;
      res.queue = load > 1.05;
      res.crash = load > 1.35;
    }
    res.bugs = Math.floor(U.clamp((1.15 - polishQ) * 2.2 + S.debt / 60 + E.rand() * 0.8 - 0.4, 0, 4));

    var moodDelta = (quality - 0.9) * 40 - res.bugs * 2.5 + cy.mods.mood;
    if (res.crash) moodDelta -= 9; else if (res.queue) moodDelta -= 2;

    if (online) {
      var draw = U.clamp(0.6 + 0.5 * S.hype / 100, 0.55, 1.1);
      var ql = U.clamp(0.55 + 0.45 * contentQ, 0.5, 1.15);
      var vis = 1 + (60 - S.vision) / 500;
      res.peak = Math.round(c.realPeak * S.rep * draw * ql * vis * cy.mods.peak * (res.crash ? 0.9 : 1));
      var ret = U.clamp(quality, 0.3, 1.4) * cy.mods.ret * (1 + (S.vision - 60) / 300);
      S.peak = res.peak;
      S.players = res.peak;
      S.decay = 0.19 / Math.pow(ret, 1.2);
      S.floor = res.peak * U.clamp(0.07 + 0.06 * ret, 0.05, 0.25);
      S.launchWeek = S.week;
      S.chart.push(res.peak);
      if (S.flags.u_mtx) {
        S.mtxQ = U.clamp(q.mtx, 0.3, 1.6);
        if (q.mtx > 1.25 && contentQ < 0.85) { moodDelta -= 4; res.mtxSalt = true; }
        res.burst = Math.round(res.peak * U.curve(T.arpu, y) * T.burst * mtxFactor(S)
          * (0.6 + 0.6 * S.hype / 100) * cy.mods.rev * S.revMult);
        var cut = S.flags.ownerShare ? res.burst * S.flags.ownerShare : 0;
        S.money += res.burst - cut;
        S.tot.revenue += res.burst;
      }
      res.beat = !c.est && res.peak >= c.realPeak;
      if (res.beat) { S.tot.beat++; E.egg(S, 'beat'); }
      if (!c.est) S.tot.launches++;
    }

    res.moodDelta = Math.round(U.clamp(moodDelta, -28, 22));
    if (S.flags.announced) S.mood = U.clamp(S.mood + res.moodDelta, 0, 100);
    S.rep = U.clamp(S.rep + 0.25 * ((0.7 + 0.35 * quality) - S.rep), 0.4, 2);
    S.sanity = U.clamp(S.sanity - (res.crash ? 6 : 0) - res.bugs * 1.5 + (quality > 1.05 ? 4 : 0), 0, 100);
    S.debt = U.clamp(S.debt + 4.5 + 6 * Math.max(0, 1.1 - polishQ), 0, 100);
    S.hype = 12 + S.mood * 0.15;
    if (c.onLaunch) res.chips = E.apply(S, typeof c.onLaunch === 'function' ? c.onLaunch(S, res) : c.onLaunch);

    // Launch-day flavour and the subreddit's verdict.
    var pool = D.text.bugs.slice();
    for (var b = 0; b < res.bugs && pool.length; b++) res.bugList.push(pool.splice(Math.floor(E.rand() * pool.length), 1)[0]);
    res.serverLine = !online ? '' : U.tpl(U.pick(res.crash ? D.text.crash : res.queue ? D.text.queue : D.text.smooth, E.rand),
      { n: U.num(Math.round(res.peak * (0.25 + E.rand() * 0.5))) });
    if (S.flags.announced) {
      var good = quality >= 0.86, mine = (c.posts || []).filter(function (p) {
        if (p.flag && !S.flags[p.flag]) return false;
        if (p.when === 'good') return good;
        if (p.when === 'bad') return !good;
        if (p.when === 'crash') return res.crash;
        if (p.when === 'queue') return res.queue || res.crash;
        return true;
      });
      var now = [], LP = D.launchPosts;
      if (online) now.push(U.pick(LP[res.tier], E.rand));
      if (res.crash) now.push(U.pick(LP.crash, E.rand)); else if (res.queue && E.rand() < 0.6) now.push(LP.queue[0]);
      if (res.bugs >= 2) now.push(LP.bugs[0]);
      if (res.mtxSalt) now.push(LP.mtx[0]);
      if (res.beat && E.rand() < 0.5) now.push(LP.beat[0]);
      if (mine.length) now.push(mine.shift());
      now.forEach(function (p) { E.post(S, p, { league: c.name }); res.posts.push(S.feed[0]); });
      S.postQueue = mine;
    }

    S.pending = { type: 'launch', result: res };
    emit('launch', res);
  }

  E.closeLaunch = function (S) {
    if (!S.pending || S.pending.type !== 'launch') return;
    S.history.push(S.pending.result);
    S.pending = null;
    S.ci++;
    if (S.ci >= D.cycles.length) {
      S.ci = D.cycles.length - 1;
      S.over = true;
      S.pending = { type: 'ending' };
      return;
    }
    startCycle(S);
  };

  /* ---------- the end ---------- */

  E.ending = function (S) {
    var online = S.history.filter(function (h) { return h.online && !h.est; });
    var avgQ = 0, sumPeak = 0, sumReal = 0, best = null;
    online.forEach(function (h) {
      avgQ += h.quality; sumPeak += h.peak; sumReal += h.realPeak;
      if (!best || h.peak / h.realPeak > best.peak / best.realPeak) best = h;
    });
    avgQ = online.length ? avgQ / online.length : 0;
    return {
      avgQ: avgQ, vsReality: sumReal ? sumPeak / sumReal : 0, best: best,
      beat: S.tot.beat, launches: S.tot.launches, revenue: S.tot.revenue, money: S.money,
      mood: S.mood, vision: S.vision, sanity: S.sanity, debt: S.debt,
      eggs: E.eggCount(S), eggTotal: Object.keys(D.eggs).length, crunchWeeks: S.tot.crunchWeeks
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
