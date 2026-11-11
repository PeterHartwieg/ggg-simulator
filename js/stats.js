/* Anonymous play statistics, for balancing. One record per game: how far it got and how each launch went.
   No cookies and nothing that names a person. The game's random id lives in its own save and dies with it.
   Browsers that ask not to be tracked send nothing. Every failure is silent: the game never waits on this. */
(function () {
  'use strict';
  var GGG = window.GGG, E = GGG.engine, St = GGG.stats = {};
  var off = !/^https?:$/.test(location.protocol) || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  var SEND_EVERY = 3, IDLE_CAP = 300;
  var markAt = Date.now(), sent = {};

  function post(path, body) {
    if (off) return;
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(path, body || '')) return;
      fetch(path, { method: 'POST', body: body || '', keepalive: true }).catch(function () { /* optional */ });
    } catch (e) { /* optional */ }
  }
  function newId() {
    var a = new Uint8Array(8), s = '';
    (window.crypto || window.msCrypto).getRandomValues(a);
    for (var i = 0; i < a.length; i++) s += (a[i] < 16 ? '0' : '') + a[i].toString(16);
    return s;
  }
  function ui(S) { return S.ui || (S.ui = {}); }
  /* Time played, counted between marks. A long gap is a tab left open, so it is capped. */
  function mark(S) {
    var now = Date.now();
    if (S) ui(S).secs = (ui(S).secs || 0) + Math.min(IDLE_CAP, Math.max(0, (now - markAt) / 1000));
    markAt = now;
  }
  function send(S, ended) {
    if (off || !S) return;
    var u = ui(S), key;
    if (!u.run) u.run = newId();
    mark(S);
    key = S.week + (ended ? 'e' : '');
    if (sent[u.run] === key) return;
    sent[u.run] = key;
    var last = S.history[S.history.length - 1];
    post('/api/run', JSON.stringify({
      id: u.run, week: S.week, launches: S.history.length, last: last ? last.id : '', ended: !!ended, secs: Math.round(u.secs || 0),
      money: Math.round(S.money), staff: E.headcount(S), par: Math.round(E.parHeadcount(S.week)),
      mood: Math.round(S.mood), sanity: Math.round(S.sanity), beat: S.tot.beat, eggs: E.eggCount(S),
      narrow: window.innerWidth <= 1100, depth: GGG.ui.depth(),
      trail: S.history.map(function (h) { return [h.id, h.quality, h.online && !h.est && h.realPeak ? h.peak / h.realPeak : null]; })
    }));
  }

  St.visit = function () { post('/api/visit'); };
  St.begin = function (S) { markAt = Date.now(); ui(S).run = newId(); ui(S).secs = 0; send(S); };
  St.resume = function () { markAt = Date.now(); };
  /* Every few launches, in case the page never gets to say goodbye. */
  St.launch = function (S) { if (S.history.length === 1 || S.history.length % SEND_EVERY === 0) send(S); else mark(S); };
  St.end = function (S) { send(S, true); };

  /* Leaving the tab is the reliable moment to record where a game stopped. */
  document.addEventListener('visibilitychange', function () {
    var S = GGG.ui && GGG.ui.state && GGG.ui.state();
    if (document.visibilityState === 'hidden') { if (S && S.ui && S.ui.run && document.body.className !== 'at-title') send(S, S.over); }
    else markAt = Date.now();
  });
})();
