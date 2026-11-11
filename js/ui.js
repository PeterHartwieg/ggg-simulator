/* The screen. One stage, one feed, one HUD. Decisions and launches appear in place
   as a card on the stage, never as a popup over the game. */
(function () {
  'use strict';
  var GGG = window.GGG, U = GGG.util, D = GGG.data, E = GGG.engine, A = GGG.art, Snd = GGG.audio;
  var UI = GGG.ui = {};
  var S = null, speed = 1, paused = false, busy = false, pend = null, timer = null, modal = null;
  var logoSrc = null, titleSrc = null, bgFor = null, bgHold = null, bgLayer = 0, logoClicks = 0, logoFirst = 0, logoTimer = null, reqMsg = {}, lastFlip = '';
  /* The card on the stage has one clock. It stops while the game is paused or the menu is open. */
  var cardTimer = null, cardFn = null, cardLeft = 0, cardAt = 0, cardSeq = 0, cardWait = false, choiceAt = 0;
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

  /* Bundled GGG artwork is mapped in art/manifest.js. Extra pictures can use slot names. */
  var EXT = ['.jpg', '.png', '.webp'], found = {};
  function skin(key) { return GGG.artOverrides && GGG.artOverrides[key]; }
  function probe(name, cb, fail) {
    var named = skin('images');
    if (named && named[name]) { cb(named[name]); return; }
    if (name in found) { if (found[name]) cb(found[name]); else if (fail) fail(); return; }
    var i = 0;
    (function next() {
      if (i >= EXT.length) { found[name] = null; if (fail) fail(); return; }
      var src = 'art/' + name + EXT[i++], im = new Image();
      im.onload = function () { found[name] = src; cb(src); };
      im.onerror = next;
      im.src = src;
    })();
  }
  function srcOf(name) { var named = skin('images'); return (named && named[name]) || found[name] || null; }
  function listed(key, src) { return (skin(key) || []).indexOf(src) !== -1; }
  function logoOf(id) { var logos = skin('releaseLogos'); return (logos && logos[id]) || null; }
  /* Logos with a see-through background are shown as they are. The others get their dark backdrop blended away. */
  function logoImg(src, cls) {
    if (src === skin('logo')) return mark(cls);
    return '<img class="' + cls + (listed('transparentLogos', src) ? ' clear' : ' solid') + '" src="' + h(src) + '" alt="">';
  }
  /* The game's own mark: the studio logo with a SIMULATOR plate bolted across the bottom of the gears. */
  function mark(cls) {
    var src = logoSrc || skin('logo');
    return src ? '<span class="mark ' + (cls || '') + '"><img src="' + h(src) + '" alt="Grinding Gear Games"><b><i>Simulator</i></b></span>' : '';
  }
  /* Two layers, so one scene fades into the next. Loading screens are cropped above their loading bar. */
  function setScene(id) {
    if (bgFor === id) return;
    bgFor = id;
    probe(id, function (src) {
      var im = new Image();
      im.onload = function () {
        if (bgFor !== id) return;
        var layers = $('stage-bg').children, old = layers[bgLayer], next = layers[bgLayer = 1 - bgLayer];
        next.style.backgroundImage = 'url("' + src + '")';
        next.className = 'on' + (listed('loadingScreens', src) ? ' ls' : '');
        old.classList.remove('on');
      };
      im.src = src;
    });
  }
  function applySkin() {
    function bg(src) { document.body.style.background = 'linear-gradient(rgba(7,5,4,.45), rgba(7,5,4,.8)), url("' + src + '") center / cover fixed #070504'; }
    if (skin('background')) bg(skin('background')); else probe('background', bg);
    logoSrc = skin('logo') || null; titleSrc = skin('title') || null;
    if (!logoSrc) probe('logo', function (src) { logoSrc = src; if (atTitle()) UI.title(); else if (S) render(); });
    function titleBackground(src) { $('title').style.setProperty('--title-art', 'url("' + new URL(src, document.baseURI).href + '")'); }
    if (titleSrc) titleBackground(titleSrc);
    else probe('title', function (src) { titleSrc = src; titleBackground(src); });
  }

  /* ---------- top line ---------- */

  var ICON = {
    coin: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="#c9aa71" stroke="#5a4320"/><circle cx="8" cy="8" r="3.4" fill="none" stroke="#5a4320"/></svg>',
    people: '<svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3" fill="#d8ccb2"/><path d="M2 15c0-4 3-6 6-6s6 2 6 6z" fill="#d8ccb2"/></svg>',
    up: '<svg viewBox="0 0 16 16"><path d="M8 1l7 8h-4v6H5V9H1z" fill="currentColor"/></svg>',
    hire: '<svg viewBox="0 0 24 24"><circle cx="10" cy="8" r="4"/><path d="M2.5 21c0-4.6 3.3-7.5 7.5-7.5s7.5 2.9 7.5 7.5z"/><path d="M19 4v7M15.5 7.5h7" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
    crunch: '<svg viewBox="0 0 24 24"><path d="M12.5 1.5c1 4-3.5 5.5-3.5 9 0 1 .5 2 1.2 2.5C9.7 10.5 12 9.5 12.5 8c2.5 2.5 4.5 5 4.5 8.3 0 3.2-2.3 5.7-5.2 5.7S6.5 19.7 6.5 16.5c0-1.8.7-3.3 1.6-4.4C6.8 8.5 10.5 6.5 12.5 1.5z"/></svg>',
    market: '<svg viewBox="0 0 24 24"><path d="M3 9.5v5h3.5l7 5V4.5l-7 5z"/><path d="M16.5 8.5c1.5 1 1.5 6 0 7M19 5.5c3.5 2.5 3.5 10.5 0 13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    vaal: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3.5l-2.5 5 4 3-3.5 4 2 5" fill="none" stroke="#120303" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    desync: '<svg viewBox="0 0 24 24"><g opacity=".4"><circle cx="8" cy="7" r="3.2"/><path d="M2.5 21c0-4.5 2.4-7 5.5-7s5.5 2.5 5.5 7z"/></g><circle cx="15.5" cy="7" r="3.2"/><path d="M10 21c0-4.5 2.4-7 5.5-7s5.5 2.5 5.5 7z"/></svg>',
    /* The desk in a box, with the office plant sticking out. */
    layoff: '<svg viewBox="0 0 24 24"><path d="M12 12.5V6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 8.2c-3 0-4.6-1.9-4.6-4.2 3 0 4.6 1.9 4.6 4.2zM12 10c2.8 0 4.3-1.8 4.3-3.9-2.8 0-4.3 1.8-4.3 3.9z"/>' +
      '<path d="M4 12.5h16l-1.6 9H5.6z"/><path d="M4 12.5L1.6 9.3h6.2l1.2 3.2zM20 12.5l2.4-3.2h-6.2L15 12.5z" opacity=".7"/></svg>'
  };
  /* The sanity globe's face. It smiles when the team is fine and frowns when it is not. */
  function face(v) {
    var k = Math.round((v - 50) / 50 * 35) / 10;
    return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="1.4"/><circle cx="15" cy="10" r="1.4"/>' +
      '<path d="M8 15.5q4 ' + k + ' 8 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  }
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
    html += '<span class="spacer"></span><span class="speed" data-tip="Space pauses. Minus and plus change speed."><button class="btn' + (paused ? ' on' : '') + '" data-act="pause">&#10074;&#10074;</button>';
    [1, 2, 4].forEach(function (sp, i) { html += '<button class="btn' + (!paused && speed === sp ? ' on' : '') + '" data-act="speed" data-n="' + sp + '">' + ['&#9654;', '&#9654;&#9654;', '&#9654;&#9654;&#9654;'][i] + '</button>'; });
    html += '<button class="btn' + (Snd.muted ? '' : ' on') + '" data-act="mute" data-tip="Sound">&#9834;</button></span>';
    $('top').innerHTML = html;
  }

  /* ---------- the stage ---------- */

  function lead(text, n) { var parts = String(text || '').split(/(?<=[.?!])\s+/); return parts.slice(0, n).join(' '); }
  function renderRel() {
    var c = E.cycle(S), ship = E.shipWeek(S);
    if (S.over) { $('rel').className = ''; $('rel').setAttribute('data-key', 'over'); $('rel').innerHTML = '<h1>The End</h1>'; return; }
    $('rel').setAttribute('data-tip', c.blurb);
    var logo = logoOf(c.id), key = c.id + '|' + ship;
    setScene(bgHold || c.id);
    if ($('rel').getAttribute('data-key') === key) return;
    $('rel').setAttribute('data-key', key);
    $('rel').className = logo ? 'with-logo' : '';
    $('rel').innerHTML = (logo ? logoImg(logo, 'release-logo') : '') +
      '<h1><small>' + h(c.ver) + '</small>' + h(c.name) + '</h1><div class="when">' + U.fmtDay(c.date, S.cyc.delay) + '</div>';
  }

  /* ---------- the HUD ---------- */

  function globe(cls, v, tip, icon) {
    return '<div class="globe ' + cls + '" data-tip="' + h(tip) + '"><div class="orb"><i style="height:' + Math.round(v) + '%"></i><span>' + Math.round(v) + '</span>' +
      '<em class="gi">' + icon + '</em></div></div>';
  }
  /* The HUD is rebuilt every tick. A one-shot effect remembers when it started, and each
     rebuild resumes its animation at that point with a negative delay. */
  var fxAt = {}, quietSeen = false, drainFx = null, preview = null;
  function fxStyle(key, name, ms) {
    var t = fxAt[key];
    if (t == null) return '';
    var gone = Date.now() - t;
    if (gone >= ms) { delete fxAt[key]; return ''; }
    return 'animation:' + name + ' ' + ms + 'ms ease-out ' + (-gone) + 'ms both;';
  }
  /* Something on the HUD glows the first time it becomes available in this game, and never again. */
  function firstSeen(key) {
    var seen = (S.ui || (S.ui = {})).seen || (S.ui.seen = {});
    if (seen[key]) return;
    seen[key] = 1;
    if (!quietSeen) fxAt['glow:' + key] = Date.now();
  }
  var KEYS = { hire: 'Q', crunch: 'W', market: 'E', vaal: 'R', desync: 'T', layoff: 'A' };
  function skill(act, cls, name, sub, tip, off) {
    firstSeen(act);
    var fx = fxStyle('glow:' + act, 'firstglow', 1800);
    return '<button class="skill s-' + act + ' ' + cls + '" data-act="' + act + '" data-tip="' + h(tip) + '"' + (off ? ' disabled' : '') + (fx ? ' style="' + fx + '"' : '') + '><kbd>' + KEYS[act] + '</kbd>' +
      ICON[act] + '<b>' + name + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</button>';
  }
  function vialH(frac) { return U.clamp(frac / 1.2 * 100, 0, 100); }
  /* The request whose build button is under the pointer or has focus, if the player can afford it. */
  function previewCost() {
    if (!preview) return 0;
    var r = D.requests.filter(function (x) { return x.id === preview; })[0], t = S.cyc.target.content;
    if (!r || r.kind === 'click' || !t || E.bankedHours(S) < r.hours || E.openRequests(S).indexOf(r) < 0) return 0;
    return r.hours / E.HOURS / t;
  }
  function renderHud() {
    var pr = E.projection(S), ann = !!S.flags.announced, heads = E.headcount(S), real = Math.round(E.parHeadcount(S.week));
    var html = globe('life', S.sanity, 'Team sanity. Crunch drains it.', face(S.sanity));

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
    if (E.layoffShown(S)) html += skill('layoff', '', 'Layoff', '', 'Let a tenth of the studio go', !E.canLayoff(S));
    html += '</div><div class="belt">';
    E.STREAMS.forEach(function (s, si) {
      var open = E.streamOpen(S, s), p = pr[s], now = open && p ? p.now : 0, proj = open && p ? p.proj : 0, extra = '';
      if (open) firstSeen('f-' + s);
      if (s === 'content' && open) {
        var cost = previewCost();
        if (cost) extra += '<i class="cost" style="bottom:' + vialH(now - cost) + '%;height:' + (vialH(now) - vialH(now - cost)) + '%"></i>';
        var dr = drainFx && fxStyle('drain', 'spill', 900);
        if (dr) extra += '<i class="drained" style="bottom:' + drainFx.to + '%;height:' + Math.max(0, drainFx.from - drainFx.to) + '%;' + dr + '"></i>';
      }
      var glow = fxStyle('glow:f-' + s, 'firstglow', 1800), give = fxStyle('pip:' + s, 'gave', 650);
      html += '<div class="flask f-' + s + (open ? '' : ' locked') + (open && proj < 0.7 ? ' low' : '') + '" data-tip="' + h(D.streams[s].what + (open ? ' On course for ' + pc(proj) + '.' : '')) + '"' + (glow ? ' style="' + glow + '"' : '') + '>' +
        '<kbd>' + (si + 1) + '</kbd><div class="vial"' + (give ? ' style="' + give + '"' : '') + '><i class="proj" style="height:' + vialH(proj) + '%"></i><i class="now" style="height:' + vialH(now) + '%"></i>' + extra + '<em></em></div>' +
        '<small>' + FLASK[s] + '</small>' +
        '<div class="ctl"><button class="btn" data-act="pip" data-s="' + s + '" data-n="-1"' + (!open || S.alloc[s] <= 0 ? ' disabled' : '') + '>&minus;</button><span>' + S.alloc[s] + '</span>' +
        '<button class="btn" data-act="pip" data-s="' + s + '" data-n="1"' + (!open ? ' disabled' : '') + '>+</button></div></div>';
    });
    html += '</div>' + globe('mana', ann ? S.hype : 0, 'Hype for the next launch', ICON.market);
    html += '<div class="xp" data-tip="Time until this release ships"><i style="width:' + (pr.elapsed * 100).toFixed(1) + '%"></i></div>';
    $('hud').innerHTML = html;
  }

  /* ---------- the subreddit, with the players' requests pinned on top ---------- */

  function postHTML(p) {
    return '<div class="post' + (p.hot ? ' hot' : '') + '"><div class="up">' + U.short(p.up) + '</div><div><div class="t">' + h(p.t) + '</div>' +
      (p.c && p.hot ? '<div class="c' + (p.g ? ' gg' : '') + '">' + h(p.c) + '</div>' : '') + '</div></div>';
  }
  var reqSig = '';
  function renderReqs() {
    var open = E.openRequests(S).filter(function (r) { return r.id !== 'desync'; })
      .sort(function (a, b) { return E.requestVotes(S, b) - E.requestVotes(S, a); }).slice(0, 2), html = '', box = $('reqs');
    /* Only the vote counts change from tick to tick. Updating them in place keeps hover and focus on the buttons. */
    var sig = open.map(function (r) { return r.id + (r.kind === 'click' || E.bankedHours(S) >= r.hours ? '+' : '-') + (reqMsg[r.id] || ''); }).join('|');
    if (sig === reqSig && box.children.length === open.length) {
      open.forEach(function (r, i) { box.children[i].firstChild.textContent = U.short(E.requestVotes(S, r)); });
      return;
    }
    reqSig = sig;
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
    syncCard();
    renderTop(); renderRel(); renderHud(); renderReqs();
    /* The narrow layout pins the top line and the HUD, and keeps drops and cards clear of both. */
    var root = document.documentElement.style;
    root.setProperty('--top-h', $('top').offsetHeight + 'px');
    root.setProperty('--hud-h', $('hud').offsetHeight + 'px');
    /* Nobody has heard of the game yet, so there is no subreddit to show. */
    $('main').classList.toggle('solo', !S.flags.announced && !$('reqs').firstChild && !$('feed').firstChild);
    A.drawChart($('chart'), S);
  }
  UI.render = render;

  /* ---------- cards ---------- */

  function head(title, sub) { return title ? '<div class="c-head' + (sub ? ' two' : '') + '"><b>' + h(title) + '</b>' + (sub ? '<small>' + h(sub) + '</small>' : '') + '</div>' : ''; }
  /* The league's own art and logo across the top of its launch card. */
  function banner(id) {
    var scene = srcOf(id), logo = logoOf(id);
    if (!scene && !logo) return '';
    return '<div class="c-banner' + (scene && listed('loadingScreens', scene) ? ' ls' : '') + '"' + (scene ? ' style="background-image:url(' + h(encodeURI(scene)) + ')"' : '') + '>' +
      (logo ? logoImg(logo, 'banner-logo') : '') + '</div>';
  }
  function mods(chips) {
    if (!chips || !chips.length) return '';
    return '<div class="mods">' + chips.map(function (c) { return '<span class="' + (c.good === true ? 'good' : c.good === false ? 'bad' : '') + '">' + h(c.text) + '</span>'; }).join('') + '</div>';
  }
  var fadeTimer = null;
  /* why: the "what really happened" note, kept behind a small ? so it is there for whoever wants it. */
  /* The card is built in one go, picture included, so nothing on it moves after it appears.
     A picture not looked up yet is looked up first. then() runs once the card is on screen. */
  function setCard(html, cls, pic, why, clickable, then) {
    var seq = ++cardSeq;
    function show(src) {
      if (seq !== cardSeq) return;
      cardWait = false;
      clearTimeout(fadeTimer);
      var contain = src && (skin('containImages') || []).indexOf(pic) !== -1;
      $('stage').className = 'carded ' + (cls || '');
      $('card').innerHTML = '<div class="card ' + (cls || '') + '"' + (clickable ? ' data-act="cont"' : '') + '>' +
        (why ? '<span class="why" data-tip="' + h(why) + '">?</span>' : '') +
        (src ? '<img class="c-pic' + (contain ? ' contain' : '') + '" src="' + h(src) + '" alt="">' : '') + html + '</div>';
      if (then) then();
    }
    if (!pic || srcOf(pic) || found[pic] === null) { show(pic && srcOf(pic)); return; }
    cardWait = true;
    probe(pic, show, function () { show(null); });
  }
  function frozen() { return paused || !!modal; }
  function syncCard() {
    var stop = frozen();
    $('card').classList.toggle('frozen', stop);
    if (!cardFn) return;
    if (stop && cardTimer) { clearTimeout(cardTimer); cardTimer = null; cardLeft -= Date.now() - cardAt; }
    else if (!stop && !cardTimer) { cardAt = Date.now(); cardTimer = setTimeout(fireCard, Math.max(0, cardLeft)); }
  }
  function armCard(fn, ms) { clearCard(); cardFn = fn; cardLeft = ms; syncCard(); }
  function clearCard() { clearTimeout(cardTimer); cardTimer = null; cardFn = null; }
  function fireCard() { var fn = cardFn; clearCard(); if (fn) fn(); }
  /* Leaving the game: nothing on the old card may fire later and write the old game back. */
  function leaveGame() {
    clearCard(); clearTimeout(fadeTimer); clearTimeout(logoTimer);
    cardSeq++; cardWait = false; pend = null; busy = false; logoClicks = 0;
    held = []; fxAt = {}; drainFx = null; preview = null; reqSig = '';
  }
  function timerBar(ms) { return '<div class="c-timer"><i style="animation-duration:' + ms + 'ms"></i></div>'; }
  function hold(ms) { busy = true; armCard(release, ms); }
  function release() {
    clearCard();
    busy = false;
    if (bgHold) { bgHold = null; if (S) renderRel(); }
    var c = $('card').firstChild;
    if (c) {
      c.className += ' done';
      c.removeAttribute('data-act');
      var t = c.querySelector('.c-timer');
      if (t) t.parentNode.removeChild(t);
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(function () { if ($('card').firstChild === c) { $('card').innerHTML = ''; $('stage').className = ''; } }, 7000);
    }
    if (held.length && S) held.shift()();
  }
  function readTime(text) { return U.clamp(2200 + String(text).length * 40, 3500, 12000); }

  /* Every overrule line that fits the year comes up once before any of them repeats, per game. */
  function flipLine() {
    var y = U.yearOf(S.week), ui = S.ui || (S.ui = {}), used = ui.flips || (ui.flips = []);
    function text(f) { return typeof f === 'string' ? f : f.t; }
    var pool = D.text.flips.filter(function (f) { return typeof f === 'string' || (y >= f.y[0] && y < f.y[1]); });
    var left = pool.filter(function (f) { return used.indexOf(text(f)) < 0; });
    if (!left.length) {
      ui.flips = used = used.filter(function (t) { return !pool.some(function (f) { return text(f) === t; }); });
      left = pool.filter(function (f) { return text(f) !== lastFlip; });
      if (!left.length) left = pool;
    }
    var named = left.filter(function (f) { return typeof f !== 'string'; });
    var pick = text(U.pick(named.length && Math.random() < 0.6 ? named : left));
    used.push(pick);
    lastFlip = pick;
    return pick;
  }

  function showDecision(o) {
    pend = o;
    o.order = o.choices.map(function (c, i) { return i; }).sort(function () { return Math.random() - 0.5; });
    busy = true;
    Snd.play('event');
    clearCard();
    setCard(head(o.title) + '<div class="c-body"><p>' + h(o.text) + '</p><div class="c-choices">' +
      o.order.map(function (ri, di) { return '<button data-act="choice" data-n="' + di + '">' + h(o.choices[ri].label) + '</button>'; }).join('') +
      '</div></div>' + timerBar(DECIDE_MS), o.canon == null ? 'free' : '', o.pic, null, false, function () {
      choiceAt = Date.now();
      armCard(function () { decide(null); }, DECIDE_MS);
      if (window.matchMedia && matchMedia('(max-width: 1100px)').matches) $('card').scrollIntoView({ block: 'nearest' });
    });
  }
  function decide(di) {
    var o = pend;
    if (!o) return;
    pend = null;
    clearCard();
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
    busy = true; clearCard();
    setCard(head(o.title) + '<div class="c-body">' + body + '</div>' + timerBar(ms), o.cls, o.pic, out.reality, true, function () { hold(ms); });
  }
  function showInfo(kicker, title, res, pic) {
    showOutcome({ title: title, pic: pic, out: { text: res.text, chips: res.chips, reality: res.reality } });
    render();
  }
  /* A result the player caused. If a card is open, it waits and gets its own card when that one closes. */
  var held = [];
  function result(kicker, title, res, pic) {
    if (!busy) showInfo(kicker, title, res, pic);
    else held.push(function () { showInfo(kicker, title, res, pic); });
  }

  /* The critics' score in half stars. The tier thresholds sit on whole stars:
     disaster 1, bad 2, mixed 3, good 4, great and legend 5. */
  function stars(q) {
    if (!(q >= 0.5)) return 1;
    return Math.min(5, Math.floor(U.curve([[0.5, 2], [0.7, 3], [0.86, 4], [1.02, 5]], q) * 2 + 1e-9) / 2);
  }
  function showLaunch(r, c) {
    var body = '', chips = [];
    if (r.online) {
      var max = Math.max(r.peak, r.realPeak) * 1.08;
      body += '<div class="peak"><b id="l-peak">' + U.num(Math.round(r.peak / 2)) + '</b>' + (r.est ? '' : '<small>real ' + U.num(r.realPeak) + '</small>') + '</div>' +
        (r.est ? '' : '<div class="vs"><i id="l-bar" style="width:0%"></i><em style="left:' + (r.realPeak / max * 100) + '%"></em></div>');
    }
    var verdict = r.online ? E.TIER_NAME[r.tier] : r.kind === 'con' ? (r.quality >= 0.9 ? 'Standing ovation' : 'Polite applause') : r.kind === 'sim' ? 'It runs' : (r.quality >= 0.9 ? 'It works' : 'It mostly works');
    var score = stars(r.quality);
    body += '<div class="stars' + (r.tier === 'legend' ? ' legend' : '') + '" role="img" aria-label="' + score + ' / 5"><i style="width:' + (score / 5 * 100) + '%"></i></div>' +
      '<div class="verdict t-' + r.tier + '">' + verdict + '</div>';
    if (r.crash) chips.push({ text: 'Servers crashed', good: false }); else if (r.queue) chips.push({ text: 'Queue position ' + U.num(Math.round(r.peak * 0.37)), good: null });
    if (r.bugs) chips.push({ text: r.bugs + (r.bugs === 1 ? ' bug' : ' bugs'), good: false });
    if (r.online && S.flags.announced) chips.push({ text: 'Reddit ' + (r.moodDelta >= 0 ? '+' : '') + r.moodDelta, good: r.moodDelta >= 0 });
    if (r.burst) chips.push({ text: '+' + U.money(r.burst), good: true });
    body += mods(chips.concat(r.chips || []));
    var ms = 6500;
    Snd.play('launch');
    bgHold = r.id; setScene(r.id);
    setCard(banner(r.id) + head(r.name, (r.ver ? r.ver + ' ' : '') + (KIND[r.kind] || '')) + '<div class="c-body">' + body + '</div>' + timerBar(ms), 'launch' + (r.crash ? ' crash' : ''), null, c.reality, true);
    hold(ms);
    var fl = $('flash');
    fl.className = ''; void fl.offsetWidth; fl.className = r.crash ? 'go red' : 'go';
    if (r.online) {
      var t0 = performance.now();
      (function count(now) {
        var el = $('l-peak'), k = Math.min(1, (now - t0) / 1200);
        if (!el) return;
        el.textContent = U.num(Math.round(r.peak * (0.5 + 0.5 * (1 - Math.pow(1 - k, 3)))));
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
        showDecision({ kind: 'intro', title: c.name, text: c.dilemma.text, choices: c.dilemma.choices, canon: c.dilemma.free ? null : (c.dilemma.canon || 0) });
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
    $('modal-root').innerHTML = '<div class="card modal ' + (o.cls || '') + '">' + (o.top || '') + head(o.title, o.sub) + '<div class="c-body">' + o.body + '</div><div class="c-foot">' +
      o.buttons.map(function (b) { return '<button class="btn ' + (b.cls || '') + '" data-m="' + b.act + '">' + h(b.label) + '</button>'; }).join('') + '</div></div>';
    $('modal-root').className = 'open';
    blurChat();
    syncCard();
  }
  function closeModal() { $('modal-root').className = ''; $('modal-root').innerHTML = ''; modal = null; syncCard(); }
  function showMenu() {
    var got = Object.keys(S.eggs), total = Object.keys(D.eggs).length;
    openModal({
      title: 'Still Sane, Founder?', dismiss: true,
      body: '<p class="picked">Secrets ' + got.length + ' / ' + total + '</p><div class="eggs">' +
        got.map(function (id) { return '<div><b>' + h(D.eggs[id].name) + '</b>' + h(D.eggs[id].what) + '</div>'; }).join('') +
        '</div><p class="legal">Game artwork © Grinding Gear Games. <a href="art/credits.html" target="_blank" rel="noopener">Artwork credits</a></p>',
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
      title: 'GGG Simulator', sub: endingTitle(e), cls: 'launch', top: banner('c_sim'),
      body: '<div class="grid">' +
        '<div><label>Launches that beat reality</label><b>' + e.beat + ' / ' + e.launches + '</b></div>' +
        '<div><label>Players vs the real studio</label><b>' + pc(e.vsReality) + '</b></div>' +
        '<div><label>Lifetime income</label><b>' + U.money(e.revenue) + '</b></div>' +
        '<div><label>Reddit</label><b>' + label(D.text.moods, e.mood) + '</b></div>' +
        '<div><label>Weeks of crunch</label><b>' + e.crunchWeeks + '</b></div>' +
        '<div><label>Secrets</label><b>' + e.eggs + ' / ' + e.eggTotal + '</b></div></div>' +
        (depth > 1 ? '<p class="mirrored">Mirrored</p>' : ''),
      buttons: [{ label: 'Stay a while', act: 'stay' }, { label: '▶ Play GGG Simulator', act: 'play', cls: 'gold' }],
      onAct: function (act) {
        closeModal();
        if (act === 'play') { store(DEPTH, String(depth + 1)); UI.newGame(true); }
        else { S.pending = null; UI.save(); render(); }
      }
    });
  }

  /* ---------- input ---------- */

  function blurChat() { var c = $('chat-in'); if (document.activeElement === c) c.blur(); }
  /* The menu button opens the menu once the clicking stops. Ten quick clicks find a secret instead. */
  var LOGO_GAP = 400, LOGO_WINDOW = 2500;
  function brandClick() {
    var now = Date.now();
    if (!logoClicks || now - logoFirst > LOGO_WINDOW) { logoClicks = 0; logoFirst = now; }
    clearTimeout(logoTimer);
    if (++logoClicks >= 10) { E.egg(S, 'logo'); logoClicks = 0; return; }
    logoTimer = setTimeout(function () { logoClicks = 0; if (S && !modal && !atTitle()) showMenu(); }, LOGO_GAP);
  }
  function act(el) {
    var a = el.getAttribute('data-act'), n = parseInt(el.getAttribute('data-n'), 10), id = el.getAttribute('data-id'), res;
    blurChat();
    if (el.disabled) { Snd.play('no'); return; }
    if (a === 'choice' || a === 'cont') {
      /* A card that is still being put up, or one that just arrived, ignores stray clicks. */
      if (cardWait || (a === 'choice' && Date.now() - choiceAt < 350)) return;
      if (a === 'choice') decide(n); else { Snd.play('click'); release(); }
      return;
    }
    if (a === 'pause') paused = !paused;
    else if (a === 'speed') { speed = n; paused = false; }
    else if (a === 'mute') Snd.toggle();
    else if (a === 'brand') { brandClick(); return; }
    else if (a === 'hire') {
      var before = S.office, got = E.hireMix(S, Math.min(5, Math.max(1, E.canHire(S))));
      if (got) { Snd.play('click'); if (S.office !== before) drop('Moved to ' + h(D.offices[S.office].name), true); } else Snd.play('no');
    }
    else if (a === 'pip') {
      var s = el.getAttribute('data-s'), had = JSON.parse(JSON.stringify(S.alloc));
      E.setPip(S, s, n); Snd.play('click');
      E.STREAMS.forEach(function (o) { if (o !== s && S.alloc[o] < had[o]) fxAt['pip:' + o] = Date.now(); });
    }
    else if (a === 'crunch') { S.crunch = !S.crunch; Snd.play(S.crunch ? 'bad' : 'click'); }
    else if (a === 'market') { if (E.marketing(S)) { Snd.play('cash'); drop('Trailer booked', true); } }
    else if (a === 'layoff') { res = E.layoff(S); Snd.play(res ? 'bad' : 'no'); if (res) drop('&minus;' + res.gone + ' staff', true); }
    else if (a === 'vaal') { res = E.vaal(S); if (res) result('Vaal or no balls', res.title, res); }
    else if (a === 'desync') {
      res = E.clickRequest(S, 'desync');
      if (res && res.done) { Snd.play('good'); result('After about eight years', res.name, res, 'desync'); }
      else if (res) { Snd.play('click'); drop(h(res.text), true); }
    }
    else if (a === 'reqbuild') {
      var before = S.cyc.pts.content, t = S.cyc.target.content || 1;
      res = E.buildRequest(S, id);
      if (res && res.ok) {
        drainFx = { from: vialH(before / t), to: vialH(S.cyc.pts.content / t) }; fxAt.drain = Date.now(); preview = null;
        Snd.play('good'); result('Shipped', res.name, res, id);
      }
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
      if (modal && modal.dismiss && ev.target === $('modal-root')) { closeModal(); render(); return; }
      var el = ev.target.closest ? ev.target.closest('[data-act]') : null;
      if (el && S && !modal && ev.detail === 0) act(el); // keyboard
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        if (modal && modal.dismiss) { ev.preventDefault(); closeModal(); render(); }
        else if (ev.target.id === 'chat-in') ev.target.blur();
        return;
      }
      if (!S || modal || atTitle() || ev.target.tagName === 'INPUT') return;
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var SPEEDS = [1, 2, 4], k = ev.key.toLowerCase(), el = null, d = /^Digit[1-5]$/.test(ev.code) ? +ev.code.charAt(5) : 0;
      if (ev.code === 'Space') { ev.preventDefault(); paused = !paused; render(); }
      else if (k === '-' || k === '_') { speed = SPEEDS[Math.max(0, SPEEDS.indexOf(speed) - 1)]; paused = false; render(); }
      else if (k === '=' || k === '+') { speed = SPEEDS[Math.min(2, SPEEDS.indexOf(speed) + 1)]; paused = false; render(); }
      else if (d) el = document.querySelector('#hud [data-act="pip"][data-s="' + E.STREAMS[d - 1] + '"][data-n="' + (ev.shiftKey ? -1 : 1) + '"]');
      else Object.keys(KEYS).forEach(function (a) { if (KEYS[a].toLowerCase() === k) el = document.querySelector('#hud [data-act="' + a + '"]'); });
      if (el) { ev.preventDefault(); act(el); }
    });
    /* Pointing at a request's build button shows its cost on the Release flask. */
    function aimAt(target) {
      var rb = target && target.closest ? target.closest('[data-act="reqbuild"]') : null, id = rb ? rb.getAttribute('data-id') : null;
      if (id === preview) return;
      preview = id;
      if (S && !atTitle()) renderHud();
    }
    document.addEventListener('focusin', function (ev) { aimAt(ev.target); });
    document.addEventListener('focusout', function (ev) { aimAt(ev.relatedTarget); });
    document.documentElement.addEventListener('mouseleave', function () { aimAt(null); });
    var tip = $('tip');
    document.addEventListener('mouseover', function (ev) {
      aimAt(ev.target);
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
    $('chat').addEventListener('submit', function (ev) { ev.preventDefault(); if (S) chat($('chat-in').value); $('chat-in').value = ''; $('chat-in').blur(); });
    window.addEventListener('resize', function () { if (S) A.drawChart($('chart'), S); });
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
    leaveGame();
    paused = false; speed = 1; reqMsg = {}; bgFor = null; bgHold = null;
    $('rel').removeAttribute('data-key');
    A.embers($('embers'), 40);
    $('card').innerHTML = ''; $('drops').innerHTML = ''; $('stage').className = '';
    $('title').className = 'hidden';
    document.body.className = '';
    /* What is already on the HUD when a game starts or loads counts as seen, without a glow. */
    quietSeen = !S.ui || !S.ui.seen;
    renderFeed(); render();
    quietSeen = false;
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
    leaveGame();
    document.body.className = 'at-title';
    $('title').className = '';
    $('title').innerHTML = '<canvas aria-hidden="true"></canvas><div class="title-box">' + mark('title-mark') +
      '<h1>Still Sane, <span>Founder?</span></h1><div class="rule"></div>' +
      '<div class="row">' + (hasSave ? '<button class="btn gold" id="t-continue">Continue, ' + U.fmtDate(saved.week) + '</button>' : '') +
      '<button class="btn' + (hasSave ? '' : ' gold') + '" id="t-new">New game</button></div>' +
      '<p class="legal">Unofficial fan parody. Not affiliated with Grinding Gear Games.' + (depth > 1 ? ' Simulation depth ' + depth + '.' : '') +
      '<br>Game artwork © Grinding Gear Games. <a href="art/credits.html" target="_blank" rel="noopener">Artwork credits</a></p></div>';
    A.embers($('title').firstChild, 70);
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
