/* Shared helpers. Plain scripts (no modules) so the game runs from file:// too. */
(function (root) {
  'use strict';
  var GGG = root.GGG = root.GGG || {};
  GGG.data = GGG.data || {};
  var U = GGG.util = {};

  var START = Date.UTC(2006, 10, 6); // Monday 6 Nov 2006: week 0, the garage
  var WEEK = 7 * 864e5;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  U.clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
  U.lerp = function (a, b, t) { return a + (b - a) * t; };

  U.weekOf = function (iso) {
    var p = String(iso).split('-');
    return Math.round((Date.UTC(+p[0], (+p[1] || 1) - 1, +p[2] || 1) - START) / WEEK);
  };
  U.dateOf = function (week) { return new Date(START + week * WEEK); };
  U.yearOf = function (week) {
    var d = U.dateOf(week);
    return d.getUTCFullYear() + (d.getUTCMonth() + d.getUTCDate() / 31) / 12;
  };
  U.fmtDate = function (week, withDay) {
    var d = U.dateOf(week);
    return (withDay ? d.getUTCDate() + ' ' : '') + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  };
  /* A calendar date such as '2010-06-01', moved by a number of weeks, as "1 Jun 2010". */
  U.fmtDay = function (iso, weeks) {
    var p = String(iso).split('-'), d = new Date(Date.UTC(+p[0], (+p[1] || 1) - 1, (+p[2] || 1) + 7 * (weeks || 0)));
    return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  };
  U.monthOf = function (week) { return U.dateOf(week).getUTCMonth(); };

  U.money = function (n) {
    var neg = n < 0; n = Math.abs(n);
    var s;
    if (n >= 1e9) s = (n / 1e9).toFixed(2) + 'B';
    else if (n >= 1e7) s = (n / 1e6).toFixed(1) + 'M';
    else if (n >= 1e6) s = (n / 1e6).toFixed(2) + 'M';
    else if (n >= 1e4) s = Math.round(n / 1e3) + 'k';
    else if (n >= 1e3) s = (n / 1e3).toFixed(1) + 'k';
    else s = String(Math.round(n));
    return (neg ? '-$' : '$') + s;
  };
  U.num = function (n) {
    n = Math.round(n);
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  U.short = function (n) {
    n = Math.round(n);
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e4) return Math.round(n / 1e3) + 'k';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return String(n);
  };

  /* Piecewise-linear lookup: pts = [[x, y], ...] sorted by x. */
  U.curve = function (pts, x) {
    if (x <= pts[0][0]) return pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      if (x <= pts[i][0]) {
        var a = pts[i - 1], b = pts[i];
        return U.lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0]));
      }
    }
    return pts[pts.length - 1][1];
  };

  U.pick = function (arr, rnd) { return arr[Math.floor((rnd || Math.random)() * arr.length)]; };

  U.tpl = function (str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  };

  U.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
