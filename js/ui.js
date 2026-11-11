/* The screen. One stage, one feed, one HUD. Decisions and launches appear in place
   as a card on the stage, never as a popup over the game. */
(function () {
  'use strict';
  var GGG = window.GGG, U = GGG.util, D = GGG.data, E = GGG.engine, A = GGG.art, Snd = GGG.audio;
  var UI = GGG.ui = {};
  var S = null, speed = 1, paused = false, busy = false, pend = null, timer = null, cardTimer = null, modal = null;
  var treeLit = -1, logoSrc = null, titleSrc = null, bgFor = null, logoClicks = 0, reqMsg = {}, lastFlip = '';
  var SAVE = 'ggg-sim-save-v1', DEPTH = 'ggg-sim-depth', TICK_MS = 1000, DECIDE_MS = 45000;
  var KIND = { proto: 'Milestone', beta: 'Beta', release: 'Release', league: 'Challenge league', expansion: 'Expansion', poe2: 'Path of Exile 2', con: 'Convention', sim: 'Side project' };
  var FLASK = { content: 'Release', polish: 'QA', mtx: 'Shop', infra: 'Servers', future: 'Long game' };

  function $(id) { return document.getElementById(id); }
  function h(s) { return U.esc(s == null ? '' : s); }
  function label(arr, v) { return arr[Math.min(arr.length - 1, Math.max(0, Math.floor(v / 100 * arr.length)))]; }
  function pc(v) { return Math.round(v * 100) + '%'; }
  function store(key, val) { try { if (val == null) localStorage.removeItem(key); else localStorage.setItem(key, val); } catch (e) { /* optional */ } }
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function atTitle() { return document.body.className === 'at-title'; }
  UI.depth = function () { return Math.max(1, parseInt(load(DEPTH), 10) || 1); };

  /* Your own pictures: art/<name>.jpg, .png or .webp, or anything named in art/manifest.js. */
  var EXT = ['.jpg', '.png', '.webp'], found = {};
  function skin(key) { return GGG.artOverrides && GGG.artOverrides[key]; }
  function probe(name, cb) {
    var named = skin('images');
    if (named && named[name]) { cb(named[name]); return; }
    if (name in found) { if (found[name]) cb(found[name]); return; }
    var i = 0;
    (function next() {
      if (i >= EXT.length) { found[name] = null; return; }
      var src = 'art/' + name + EXT[i++], im = new Image();
      im.onload = function () { found[name] = src; cb(src); };
      im.onerror = next;
      im.src = src;
    })();
  }
  function applySkin() {
    function bg(src) { document.body.style.background = 'linear-gradient(rgba(7,5,4,.6), rgba(7,5,4,.86)), url("' + src + '") center / cover fixed #070504'; }
    if (skin('background')) bg(skin('background')); else probe('background', bg);
    logoSrc = skin('logo') || null; titleSrc = skin('title') || null;
    if (!logoSrc) probe('logo', function (src) { logoSrc = src; if (atTitle()) UI.title(); else if (S) render(); });
    if (!titleSrc) probe('title', function (src) { titleSrc = src; if (atTitle()) UI.title(); });
  }

  /* ---------- top line ---------- */

  var ICON = {
    coin: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="#c9aa71" stroke="#5a4320"/><circle cx="8" cy="8" r="3.4" fill="none" stroke="#5a4320"/></svg>',
    people: '<svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3" fill="#d8ccb2"/><path d="M2 15c0-4 3-6 6-6s6 2 6 6z" fill="#d8ccb2"/></svg>',
    up: '<svg viewBox="0 0 16 16"><path d="M8 1l7 8h-4v6H5V9H1z" fill="currentColor"/></svg>'
  };
  function st(icon, value, extra, tip) {
    return '<span class="st" data-tip="' + h(tip) + '">' + (icon || '') + '<b>' + value + '</b>' + (extra || '') + '</span>';
  }
  function renderTop() {
    var f = E.finance(S), ann = !!S.flags.announced;
    var html = '<button class="btn" data-act="brand" data-tip="Menu">&#9776;</button>' + (logoSrc ? '<img class="logo" src="' + h(logoSrc) + '" alt="">' : '');
    html += st('', U.fmtDate(S.week), '', 'Space pauses');
    html += st(ICON.coin, U.money(S.money), '<small class="' + (f.net >= 0 ? 'up' : 'down') + '">' + (f.net >= 0 ? '+' : '') + U.money(f.net) + '</small>', 'Cash, and change per week');
    html += st(ICON.people, S.launchWeek >= 0 ? U.num(S.players) : '0', '', 'Players online');
    if (ann) html += '<span class="st mood" style="color:hsl(' + Math.round(S.mood * 1.2) + ',70%,55%)" data-tip="The subreddit: ' + h(label(D.text.moods, S.mood)) + '">' +
      '<span' + (S.mood < 45 ? ' class="down"' : '') + '>' + ICON.up + '</span></span>';
    html += '<span class="spacer"></span><span class="speed"><button class="btn' + (paused ? ' on' : '') + '" data-act="pause">&#10074;&#10074;</button>';
    [1, 2, 4].forEach(function (sp, i) { html += '<button class="btn' + (!paused && speed === sp ? ' on' : '') + '" data-act="speed" data-n="' + sp + '">' + ['&#9654;', '&#9654;&#9654;', '&#9654;&#9654;&#9654;'][i] + '</button>'; });
    html += '<button class="btn' + (Snd.muted ? '' : ' on') + '" data-act="mute" data-tip="Sound">&#9834;</button></span>';
    $('top').innerHTML = html;
  }

  /* ---------- the stage ---------- */

  function lead(text, n) { var parts = String(text || '').split(/(?<=[.?!])\s+/); return parts.slice(0, n).join(' '); }
  function renderRel() {
    var c = E.cycle(S), ship = E.shipWeek(S);
    if (S.over) { $('rel').innerHTML = '<h1>The End</h1>'; return; }
    $('rel').setAttribute('data-tip', c.blurb);
    $('rel').innerHTML = '<h1><small>' + h(c.ver) + '</small>' + h(c.name) + '</h1><div class="when">' + U.fmtDate(ship, true) + '</div>';
    if (bgFor !== c.id) {
      bgFor = c.id;
      var el = $('stage-bg'), want = c.id;
      el.className = '';
      probe(want, function (src) { if (bgFor === want) { el.style.backgroundImage = 'url("' + src + '")'; el.className = 'on'; } });
    }
  }

  /* ---------- the HUD ---------- */

  function globe(cls, v, tip) {
    return '<div class="globe ' + cls + '" data-tip="' + h(tip) + '"><div class="orb"><i style="height:' + Math.round(v) + '%"></i><span>' + Math.round(v) + '</span></div></div>';
  }
  function skill(act, cls, name, sub, tip, off) {
    return '<button class="skill ' + cls + '" data-act="' + act + '" data-tip="' + h(tip) + '"' + (off ? ' disabled' : '') + '><b>' + name + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</button>';
  }
  function renderHud() {
    var pr = E.projection(S), ann = !!S.flags.announced, heads = E.headcount(S), real = Math.round(E.parHeadcount(S.week));
    var html = globe('life', S.sanity, 'Team sanity. Crunch drains it.');

    var can = E.canHire(S), full = heads >= E.capacity(S), next = E.nextOffice(S), n = Math.min(5, Math.max(1, can));
    var blocked = S.hiresLeft <= 0 || S.money < E.hireCost(S, 1) || (full && (!next || S.money < next.cost));
    html += '<div class="skills">';
    html += skill('hire', 'hire' + (!blocked && heads < real * 0.9 ? ' need' : ''), blocked ? 'Hire' : 'Hire +' + n, heads + ' / ' + real,
      blocked ? (S.hiresLeft <= 0 ? 'No candidates left until the next release' : full ? 'No desks, no money for a bigger office' : 'Not enough cash')
        : 'Your team / the real studio at this date. ' + U.money(E.hireCost(S, 1)) + ' per hire.', blocked);
    html += skill('crunch', S.crunch ? 'on' : '', 'Crunch', '', '+30% work, drains sanity');
    if (E.canMarket(S) || S.cyc.marketed) html += skill('market', S.cyc.marketed ? 'on' : '', 'Hype', '', '+12 hype at launch for ' + U.money(E.marketingCost(S)), S.cyc.marketed || S.money < E.marketingCost(S));
    if (S.flags.vaal) html += skill('vaal', '', 'Vaal', '', 'Corrupt this release. Better, bricked, or nothing.', !!S.cyc.vaaled);
    var ds = S.req.desync, dq = D.requests[0];
    if (S.week >= dq._from && !(ds && ds.built != null)) html += skill('desync', '', 'Desync', ds && ds.clicks ? String(ds.clicks) : '', 'Fix desync. Keep pressing.');
    html += '</div><div class="belt">';
    E.STREAMS.forEach(function (s) {
      var open = E.streamOpen(S, s), p = pr[s], now = open && p ? p.now : 0, proj = open && p ? p.proj : 0;
      html += '<div class="flask f-' + s + (open ? '' : ' locked') + (open && proj < 0.7 ? ' low' : '') + '" data-tip="' + h(D.streams[s].what + (open ? ' On course for ' + pc(proj) + '.' : '')) + '">' +
        '<div class="vial"><i class="proj" style="height:' + Math.min(100, proj / 1.2 * 100) + '%"></i><i class="now" style="height:' + Math.min(100, now / 1.2 * 100) + '%"></i><em></em></div>' +
        '<small>' + FLASK[s] + '</small>' +
        '<div class="ctl"><button class="btn" data-act="pip" data-s="' + s + '" data-n="-1"' + (!open || S.alloc[s] <= 0 ? ' disabled' : '') + '>&minus;</button><span>' + S.alloc[s] + '</span>' +
        '<button class="btn" data-act="pip" data-s="' + s + '" data-n="1"' + (!open ? ' disabled' : '') + '>+</button></div></div>';
    });
    html += '</div>' + globe('mana', ann ? S.hype : 0, 'Hype for the next launch');
    html += '<div class="xp" data-tip="Time until this release ships"><i style="width:' + Math.round(pr.elapsed * 100) + '%"></i></div>';
    $('hud').innerHTML = html;
  }

  /* ---------- the subreddit, with the players' requests pinned on top ---------- */

  function postHTML(p) {
    return '<div class="post' + (p.hot ? ' hot' : '') + '"><div class="up">' + U.short(p.up) + '</div><div><div class="t">' + h(p.t) + '</div>' +
      (p.c && p.hot ? '<div class="c' + (p.g ? ' gg' : '') + '">' + h(p.c) + '</div>' : '') + '</div></div>';
  }
  function renderReqs() {
    var open = E.openRequests(S).filter(function (r) { return r.id !== 'desync'; })
      .sort(function (a, b) { return E.requestVotes(S, b) - E.requestVotes(S, a); }).slice(0, 2), html = '';
    open.forEach(function (r) {
      var click = r.kind === 'click', ok = click || E.bankedHours(S) >= r.hours;
      html += '<div class="post req hot" data-tip="' + h(r.what + (click ? '' : ' Costs ' + U.num(r.hours) + ' hours of the current release.')) + '"><div class="up">' + U.short(E.requestVotes(S, r)) + '</div>' +
        '<div><div class="t">' + h(r.name) + '</div>' + (reqMsg[r.id] ? '<div class="c gg">' + h(reqMsg[r.id]) + '</div>' : '') + '</div>' +
        '<button class="btn" data-act="' + (click ? 'reqclick' : 'reqbuild') + '" data-id="' + r.id + '"' + (ok ? '' : ' disabled') + '>' + (click ? '?' : U.num(r.hours) + ' h') + '</button></div>';
    });
    $('reqs').innerHTML = html;
  }
  function renderFeed() {
    $('feed').innerHTML = S.flags.announced ? S.feed.map(postHTML).join('') : '';
  }
  function addPost(p) {
    var el = $('feed');
    el.insertAdjacentHTML('afterbegin', postHTML(p));
    while (el.children.length > 40) el.removeChild(el.lastChild);
  }
  function sysLine(text) {
    var el = $('feed');
    if (el.firstChild && el.firstChild.className === 'empty') el.innerHTML = '';
    el.insertAdjacentHTML('afterbegin', '<div class="sys">' + h(text) + '</div>');
  }
  function chat(text) {
    var key = text.trim().toLowerCase(), cmd = D.chat[key];
    if (!key) return;
    E.egg(S, 'chat');
    if (cmd) { sysLine(cmd.say(S)); if (cmd.egg) E.egg(S, cmd.egg); }
    else if (key.charAt(0) === '/') sysLine('Unknown command. Try /help');
    else sysLine(U.pick(['Nobody replies. Someone links their items at you.', 'A stranger answers: "check ninja".', '"rue is a cat"', 'The chat scrolls past. It is 90% trade spam.']));
  }
  function drop(html, plain) {
    var box = $('drops'), el = document.createElement('div');
    el.className = 'drop' + (plain ? ' plain' : '');
    el.innerHTML = html;
    while (box.children.length >= 4) box.removeChild(box.lastChild);
    box.insertBefore(el, box.firstChild);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 6000);
  }

  function render() {
    if (!S) return;
    renderTop(); renderRel(); renderHud(); renderReqs();
    A.drawChart($('chart'), S);
    if (treeLit !== S.history.length) { treeLit = S.history.length; A.drawTree($('tree'), treeLit); }
  }
  UI.render = render;

  /* ---------- cards ---------- */

  function head(title) { return title ? '<div class="c-head"><b>' + h(title) + '</b></div>' : ''; }
  function mods(chips) {
    if (!chips || !chips.length) return '';
    return '<div class="mods">' + chips.map(function (c) { return '<span class="' + (c.good === true ? 'good' : c.good === false ? 'bad' : '') + '">' + h(c.text) + '</span>'; }).join('') + '</div>';
  }
  var fadeTimer = null;
  /* why: the "what really happened" note, kept behind a small ? so it is there for whoever wants it. */
  function setCard(html, cls, pic, why, clickable) {
    clearTimeout(fadeTimer);
    $('stage').className = 'carded ' + (cls || '');
    $('card').innerHTML = '<div class="card ' + (cls || '') + '"' + (clickable ? ' data-act="cont"' : '') + '>' +
      (why ? '<span class="why" data-tip="' + h(why) + '">?</span>' : '') + html + '</div>';
    if (pic) {
      probe(pic, function (src) {
        var c = $('card').firstChild;
        if (c && !c.querySelector('.c-pic')) c.insertAdjacentHTML('afterbegin', '<img class="c-pic" src="' + h(src) + '" alt="">');
      });
    }
  }
  function timerBar(ms) { return '<div class="c-timer"><i style="animation-duration:' + ms + 'ms"></i></div>'; }
  function hold(ms) { busy = true; clearTimeout(cardTimer); cardTimer = setTimeout(release, ms); }
  function release() {
    clearTimeout(cardTimer);
    busy = false;
    var c = $('card').firstChild;
    if (c) {
      c.className += ' done';
      c.removeAttribute('data-act');
      var t = c.querySelector('.c-timer');
      if (t) t.parentNode.removeChild(t);
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(function () { if ($('card').firstChild === c) { $('card').innerHTML = ''; $('stage').className = ''; } }, 7000);
    }
  }
  function readTime(text) { return U.clamp(2200 + String(text).length * 40, 3500, 12000); }

  function flipLine() {
    var y = U.yearOf(S.week), pool = D.text.flips.filter(function (f) { return typeof f === 'string' || (y >= f.y[0] && y < f.y[1]); });
    var named = pool.filter(function (f) { return typeof f !== 'string'; }), pick;
    do { pick = U.pick(named.length && Math.random() < 0.6 ? named : pool); pick = typeof pick === 'string' ? pick : pick.t; } while (pick === lastFlip && pool.length > 1);
    lastFlip = pick;
    return pick;
  }

  function showDecision(o) {
    pend = o;
    o.order = o.choices.map(function (c, i) { return i; }).sort(function () { return Math.random() - 0.5; });
    busy = true;
    Snd.play('event');
    setCard(head(o.title) + '<div class="c-body"><p>' + h(lead(o.text, 2)) + '</p><div class="c-choices">' +
      o.order.map(function (ri, di) { return '<button data-act="choice" data-n="' + di + '">' + h(o.choices[ri].label) + '</button>'; }).join('') +
      '</div></div>' + timerBar(DECIDE_MS), o.canon == null ? 'free' : '', o.pic);
    clearTimeout(cardTimer);
    cardTimer = setTimeout(function () { decide(null); }, DECIDE_MS);
  }
  function decide(di) {
    var o = pend;
    if (!o) return;
    pend = null;
    clearTimeout(cardTimer);
    var late = di == null, real = late ? (o.canon != null ? o.canon : 0) : o.order[di], flip = null, wrong = null;
    if (o.canon != null && real !== o.canon) {
      wrong = o.choices[real];
      flip = flipLine();
      if (wrong.fx && wrong.fx.egg) E.egg(S, wrong.fx.egg);
      real = o.canon;
    }
    var out = o.kind === 'intro' ? E.resolveIntro(S, real) : E.choose(S, real);
    Snd.play(flip ? 'no' : 'click');
    showOutcome({ title: o.title, cls: o.canon == null ? 'free' : '', pic: o.pic, out: out, flip: flip, wrong: wrong, late: late ? U.pick(D.text.late) : null });
    UI.save();
    render();
  }
  function showOutcome(o) {
    var out = o.out, body = '', main = o.intro ? lead(o.intro, 1) + ' ' + lead(out.text, 1) : lead(out.text, 2);
    if (o.late) body += '<p class="flip"><b>' + h(o.late) + '</b></p>';
    if (o.flip) body += '<p class="flip"><s>' + h(o.wrong.label) + '</s> <b>' + h(o.flip) + '</b></p>';
    if (main.trim()) body += '<p>' + h(main) + '</p>';
    body += mods(out.chips);
    var ms = readTime((o.flip || '') + (o.late || '') + main);
    setCard(head(o.title) + '<div class="c-body">' + body + '</div>' + timerBar(ms), o.cls, o.pic, out.reality, true);
    hold(ms);
  }
  function showInfo(kicker, title, res, pic) {
    showOutcome({ title: title, pic: pic, out: { text: res.text, chips: res.chips, reality: res.reality } });
    render();
  }

  function showLaunch(r, c) {
    var body = '', chips = [];
    if (r.online) {
      var max = Math.max(r.peak, r.realPeak) * 1.08;
      body += '<div class="peak"><b id="l-peak">0</b>' + (r.est ? '' : '<small>real ' + U.num(r.realPeak) + '</small>') + '</div>' +
        (r.est ? '' : '<div class="vs"><i id="l-bar" style="width:0%"></i><em style="left:' + (r.realPeak / max * 100) + '%"></em></div>');
    }
    var verdict = r.online ? E.TIER_NAME[r.tier] : r.kind === 'con' ? (r.quality >= 0.9 ? 'Standing ovation' : 'Polite applause') : r.kind === 'sim' ? 'It runs' : (r.quality >= 0.9 ? 'It works' : 'It mostly works');
    body += '<div class="verdict t-' + r.tier + '">' + verdict + '</div>';
    if (r.crash) chips.push({ text: 'Servers crashed', good: false }); else if (r.queue) chips.push({ text: 'Queue', good: null });
    if (r.bugs) chips.push({ text: r.bugs + (r.bugs === 1 ? ' bug' : ' bugs'), good: false });
    if (r.online && S.flags.announced) chips.push({ text: 'Reddit ' + (r.moodDelta >= 0 ? '+' : '') + r.moodDelta, good: r.moodDelta >= 0 });
    if (r.burst) chips.push({ text: '+' + U.money(r.burst), good: true });
    body += mods(chips.concat(r.chips || []));
    var ms = 6500;
    Snd.play('launch');
    setCard(head((r.ver ? r.ver + ' ' : '') + r.name) + '<div class="c-body">' + body + '</div>' + timerBar(ms), 'launch' + (r.crash ? ' crash' : ''), r.id, c.reality, true);
    hold(ms);
    if (r.online) {
      var t0 = performance.now();
      (function count(now) {
        var el = $('l-peak'), k = Math.min(1, (now - t0) / 1200);
        if (!el) return;
        el.textContent = U.num(Math.round(r.peak * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(count);
      })(t0);
      setTimeout(function () { if ($('l-bar')) $('l-bar').style.width = (r.peak / (Math.max(r.peak, r.realPeak) * 1.08) * 100) + '%'; if ($('l-peak')) $('l-peak').textContent = U.num(r.peak); }, 1300);
      setTimeout(function () { Snd.play(r.quality >= 0.86 ? 'good' : 'bad'); }, 1300);
    }
  }

  /* Whatever the engine is waiting on, put it on the stage. */
  function present() {
    var p = S.pending, c, ev, choices;
    if (!p || busy) return;
    if (p.type === 'launch') {
      c = D.cycles.filter(function (x) { return x.id === p.result.id; })[0];
      var r = p.result;
      E.closeLaunch(S);
      UI.save(); render();
      showLaunch(r, c);
    } else if (p.type === 'intro') {
      c = E.cycle(S);
      if (c.dilemma) {
        showDecision({ kind: 'intro', title: '', text: c.dilemma.text, choices: c.dilemma.choices, canon: c.dilemma.free ? null : (c.dilemma.canon || 0) });
      } else { E.resolveIntro(S, null); UI.save(); }
      render();
    } else if (p.type === 'event') {
      ev = E.pendingEvent(S); choices = E.choices(S, ev);
      var kicker = (ev.who || 'Event') + ', ' + U.fmtDate(S.week), text = typeof ev.text === 'function' ? ev.text(S) : ev.text;
      if (choices.length < 2) {
        var out = E.choose(S, 0);
        Snd.play('event');
        showOutcome({ kicker: kicker, title: ev.title, pic: ev.id, intro: text, out: out });
        UI.save(); render();
      } else {
        showDecision({ kind: 'event', kicker: kicker, title: ev.title, text: text, choices: choices, pic: ev.id, canon: ev.date && !ev.free ? (ev.canon || 0) : null });
      }
    } else if (p.type === 'ending') showEnding();
  }

  /* ---------- menu and ending (the only overlays, and only when asked for or at the very end) ---------- */

  function openModal(o) {
    modal = o;
    $('modal-root').innerHTML = '<div class="card modal">' + head(o.title) + '<div class="c-body">' + o.body + '</div><div class="c-foot">' +
      o.buttons.map(function (b) { return '<button class="btn ' + (b.cls || '') + '" data-m="' + b.act + '">' + h(b.label) + '</button>'; }).join('') + '</div></div>';
    $('modal-root').className = 'open';
  }
  function closeModal() { $('modal-root').className = ''; $('modal-root').innerHTML = ''; modal = null; }
  function showMenu() {
    var got = Object.keys(S.eggs), total = Object.keys(D.eggs).length;
    openModal({
      title: 'Still Sane, Founder?',
      body: '<p class="picked">Secrets ' + got.length + ' / ' + total + '</p><div class="eggs">' +
        got.map(function (id) { return '<div><b>' + h(D.eggs[id].name) + '</b>' + h(D.eggs[id].what) + '</div>'; }).join('') + '</div>',
      buttons: [{ label: 'Start over', act: 'new' }, { label: 'Back to work', act: 'go', cls: 'gold' }],
      onAct: function (act) { closeModal(); if (act === 'new') { store(SAVE, null); UI.title(); } }
    });
  }
  function endingTitle(e) {
    if (e.vsReality >= 1.15 && e.mood >= 55) return 'Better than the real thing';
    if (e.mood <= 25) return 'Most downvoted founder in subreddit history';
    if (e.vsReality < 0.7) return 'Small indie company';
    if (e.crunchWeeks > 150) return 'Lived at the office';
    return 'Still sane, mostly';
  }
  function showEnding() {
    var e = E.ending(S), depth = UI.depth();
    Snd.play('good');
    openModal({
      kicker: 'One more thing', title: 'GGG Simulator is finished',
      body: '<p class="picked">' + h(endingTitle(e)) + '</p><div class="grid">' +
        '<div><label>Launches that beat reality</label><b>' + e.beat + ' / ' + e.launches + '</b></div>' +
        '<div><label>Players vs the real studio</label><b>' + pc(e.vsReality) + '</b></div>' +
        '<div><label>Lifetime income</label><b>' + U.money(e.revenue) + '</b></div>' +
        '<div><label>Reddit</label><b>' + label(D.text.moods, e.mood) + '</b></div>' +
        '<div><label>Weeks of crunch</label><b>' + e.crunchWeeks + '</b></div>' +
        '<div><label>Secrets</label><b>' + e.eggs + ' / ' + e.eggTotal + '</b></div></div>',
      buttons: [{ label: 'Stay a while', act: 'stay' }, { label: '▶ Play GGG Simulator', act: 'play', cls: 'gold' }],
      onAct: function (act) {
        closeModal();
        if (act === 'play') { store(DEPTH, String(depth + 1)); UI.newGame(true); }
        else { S.pending = null; UI.save(); render(); }
      }
    });
  }

  /* ---------- input ---------- */

  function act(el) {
    var a = el.getAttribute('data-act'), n = parseInt(el.getAttribute('data-n'), 10), id = el.getAttribute('data-id'), res;
    if (el.disabled) { Snd.play('no'); return; }
    if (a === 'choice') { decide(n); return; }
    if (a === 'cont') { Snd.play('click'); release(); return; }
    if (a === 'pause') paused = !paused;
    else if (a === 'speed') { speed = n; paused = false; }
    else if (a === 'mute') Snd.toggle();
    else if (a === 'brand') {
      if (++logoClicks >= 10) { E.egg(S, 'logo'); logoClicks = 0; }
      else if (logoClicks === 1) setTimeout(function () { if (logoClicks === 1 && !modal) showMenu(); if (logoClicks < 10) logoClicks = 0; }, 700);
      return;
    }
    else if (a === 'hire') {
      var before = S.office, got = E.hireMix(S, Math.min(5, Math.max(1, E.canHire(S))));
      if (got) { Snd.play('click'); if (S.office !== before) drop('Moved to ' + h(D.offices[S.office].name), true); } else Snd.play('no');
    }
    else if (a === 'pip') { E.setPip(S, el.getAttribute('data-s'), n); Snd.play('click'); }
    else if (a === 'crunch') { S.crunch = !S.crunch; Snd.play(S.crunch ? 'bad' : 'click'); }
    else if (a === 'market') { if (E.marketing(S)) { Snd.play('cash'); drop('Trailer booked', true); } }
    else if (a === 'vaal') { res = E.vaal(S); if (res && !busy) showInfo('Vaal or no balls', res.title, res); else if (res) drop(h(res.title + '. ' + res.text), true); }
    else if (a === 'desync') {
      res = E.clickRequest(S, 'desync');
      if (res && res.done) { Snd.play('good'); if (!busy) showInfo('After about eight years', res.name, res, 'desync'); else drop(h(res.text), true); }
      else if (res) { Snd.play('click'); drop(h(res.text), true); }
    }
    else if (a === 'reqbuild') {
      res = E.buildRequest(S, id);
      if (res && res.ok) { Snd.play('good'); if (!busy) showInfo('Shipped', res.name, res, id); else drop(h(res.name + ' shipped. ' + res.text), true); }
    }
    else if (a === 'reqclick') { res = E.clickRequest(S, id); if (res) { reqMsg[id] = res.text; Snd.play('no'); } }
    render();
  }

  function bind() {
    document.addEventListener('pointerdown', function (ev) {
      var el = ev.target.closest ? ev.target.closest('[data-act]') : null;
      if (el && S && !modal && !atTitle()) { ev.preventDefault(); act(el); }
    });
    document.addEventListener('click', function (ev) {
      var m = ev.target.closest ? ev.target.closest('[data-m]') : null;
      if (m && modal) { Snd.play('click'); modal.onAct(m.getAttribute('data-m')); return; }
      var el = ev.target.closest ? ev.target.closest('[data-act]') : null;
      if (el && S && !modal && ev.detail === 0) act(el); // keyboard
    });
    document.addEventListener('keydown', function (ev) {
      if (!S || modal || atTitle() || ev.target.tagName === 'INPUT') return;
      if (ev.code === 'Space') { ev.preventDefault(); paused = !paused; render(); }
      else if (ev.key === '1' || ev.key === '2' || ev.key === '3') { speed = [1, 2, 4][+ev.key - 1]; paused = false; render(); }
    });
    var tip = $('tip');
    document.addEventListener('mouseover', function (ev) {
      var el = ev.target.closest ? ev.target.closest('[data-tip]') : null;
      if (!el || !el.getAttribute('data-tip')) { tip.style.display = 'none'; return; }
      tip.textContent = el.getAttribute('data-tip');
      tip.style.display = 'block';
    });
    document.addEventListener('mousemove', function (ev) {
      if (tip.style.display !== 'block') return;
      var x = ev.clientX + 14, y = ev.clientY + 16;
      if (x + tip.offsetWidth > window.innerWidth - 6) x = ev.clientX - tip.offsetWidth - 10;
      if (y + tip.offsetHeight > window.innerHeight - 6) y = ev.clientY - tip.offsetHeight - 10;
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    });
    $('chat').addEventListener('submit', function (ev) { ev.preventDefault(); if (S) chat($('chat-in').value); $('chat-in').value = ''; });
    window.addEventListener('resize', function () { A.drawTree($('tree'), S && !atTitle() ? S.history.length : 0); if (S) A.drawChart($('chart'), S); });
    E.on(function (type, data) {
      if (type === 'post') addPost(data);
      else if (type === 'egg') { drop(h(D.eggs[data].name)); Snd.play('egg'); }
      else if (type === 'future') drop('Long game: ' + h(data.name), true);
    });
  }

  /* ---------- loop, saving, title ---------- */

  function loop() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (S && !paused && !modal && !busy && !atTitle()) {
        if (S.pending) present();
        else if (!S.over) { E.tick(S); render(); if (S.pending) present(); }
      }
      loop();
    }, TICK_MS / speed);
  }
  function start() {
    paused = false; speed = 1; busy = false; pend = null; reqMsg = {}; bgFor = null; treeLit = -1;
    clearTimeout(cardTimer);
    clearTimeout(fadeTimer);
    $('card').innerHTML = ''; $('drops').innerHTML = ''; $('stage').className = '';
    $('title').className = 'hidden';
    document.body.className = '';
    renderFeed(); render();
  }
  UI.save = function () { if (S) store(SAVE, JSON.stringify(S)); };
  UI.newGame = function (deeper) {
    S = E.newGame();
    start(); UI.save();
    if (deeper || UI.depth() > 1) setTimeout(function () { E.egg(S, 'recursion'); }, 1500);
  };
  UI.resume = function () {
    try { S = JSON.parse(load(SAVE)); } catch (e) { S = null; }
    if (!S || S.v !== 1) { UI.newGame(); return; }
    start();
  };
  UI.title = function () {
    var saved = null, depth = UI.depth();
    try { saved = JSON.parse(load(SAVE)); } catch (e) { saved = null; }
    var hasSave = saved && saved.v === 1 && !saved.over;
    document.body.className = 'at-title';
    A.drawTree($('tree'), 0); treeLit = -1;
    $('title').className = '';
    $('title').innerHTML = '<div class="title-box">' + (logoSrc ? '<img src="' + h(logoSrc) + '" alt="">' : '') + (titleSrc ? '<img src="' + h(titleSrc) + '" alt="">' : '') +
      '<h1>Still Sane, Founder?</h1>' +
      '<div class="row">' + (hasSave ? '<button class="btn gold" id="t-continue">Continue, ' + U.fmtDate(saved.week) + '</button>' : '') +
      '<button class="btn' + (hasSave ? '' : ' gold') + '" id="t-new">New game</button></div>' +
      '<p class="legal">Unofficial fan parody. Not affiliated with Grinding Gear Games.' + (depth > 1 ? ' Simulation depth ' + depth + '.' : '') + '</p></div>';
    $('t-new').onclick = function () { Snd.play('click'); UI.newGame(); };
    if (hasSave) $('t-continue').onclick = function () { Snd.play('click'); UI.resume(); };
  };
  UI.boot = function () {
    E.init();
    bind();
    applySkin();
    UI.title();
    loop();
  };
  UI.state = function () { return S; };
  /* For testing from the console: answer whatever is on screen, then advance one tick. */
  UI.auto = function () {
    if (!S || modal) return false;
    if (pend) decide(0);
    if (busy) release();
    if (S.pending) { present(); return true; }
    if (S.over) return false;
    E.tick(S); render();
    if (S.pending) present();
    return true;
  };
})();
