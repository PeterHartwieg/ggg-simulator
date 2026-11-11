/* Generated graphics: the skill-web backdrop and the player-count chart.
   Nothing here is an image file, and nothing is copied from any game. */
(function () {
  'use strict';
  var GGG = window.GGG, A = GGG.art = {};

  /* A skill web from a fixed seed. One cluster lights up per release shipped. */
  A.drawTree = function (cv, lit) {
    if (!cv) return;
    var dpr = window.devicePixelRatio || 1, W = window.innerWidth, H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    var ctx = cv.getContext('2d'), seed = 20061106;
    function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var cx = W * 0.4, cy = H * 0.46, R = Math.max(W, H * 1.25) * 0.62;
    var rings = [[0.13, 6], [0.29, 11], [0.48, 16], [0.7, 22], [0.96, 28]], clusters = [], roads = [], start = 0;
    rings.forEach(function (rg, ri) {
      for (var i = 0; i < rg[1]; i++) {
        var a = (i + (ri % 2) * 0.5) / rg[1] * Math.PI * 2 + rnd() * 0.14, rr = R * rg[0] * (0.93 + rnd() * 0.14);
        clusters.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr * 0.8, r: 14 + rnd() * 17, k: 5 + Math.floor(rnd() * 5), rot: rnd() * 6 });
      }
      for (i = 0; i < rg[1]; i++) {
        roads.push([start + i, start + (i + 1) % rg[1]]);
        if (ri > 0) {
          var pn = rings[ri - 1][1];
          roads.push([start + i, start - pn + Math.round(i / rg[1] * pn) % pn]);
        }
      }
      start += rg[1];
    });
    function dot(x, y, r, on) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832);
      ctx.fillStyle = on ? '#5a3f12' : '#0b0806'; ctx.fill();
      ctx.strokeStyle = on ? '#f0d394' : 'rgba(170,142,94,.5)'; ctx.lineWidth = on ? 1.5 : 1; ctx.stroke();
    }
    ctx.lineWidth = 1;
    roads.forEach(function (rd) {
      var a = clusters[rd[0]], b = clusters[rd[1]], on = rd[0] < lit && rd[1] < lit;
      ctx.strokeStyle = on ? 'rgba(240,211,148,.7)' : 'rgba(150,125,82,.26)';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      dot(a.x + (b.x - a.x) / 3, a.y + (b.y - a.y) / 3, 1.8, on);
      dot(a.x + (b.x - a.x) * 2 / 3, a.y + (b.y - a.y) * 2 / 3, 1.8, on);
    });
    clusters.forEach(function (c, i) {
      var on = i < lit;
      ctx.shadowColor = '#f0d394'; ctx.shadowBlur = on ? 14 : 0;
      ctx.strokeStyle = on ? 'rgba(240,211,148,.8)' : 'rgba(150,125,82,.3)';
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 6.2832); ctx.stroke();
      for (var j = 0; j < c.k; j++) {
        var a = c.rot + j / c.k * 6.2832;
        dot(c.x + Math.cos(a) * c.r, c.y + Math.sin(a) * c.r, 2.4, on);
      }
      dot(c.x, c.y, 5.5, on);
      ctx.shadowBlur = 0;
    });
  };

  /* The sawtooth: your concurrent players over time, with the real launch peaks as teal marks. */
  A.drawChart = function (cv, S) {
    if (!cv || !cv.clientWidth) return;
    var ctx = cv.getContext('2d'), dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var data = S.chart, n = data.length, max = 1, i;
    if (n < 2) return;
    for (i = 0; i < n; i++) if (data[i] > max) max = data[i];
    S.history.forEach(function (h) { if (h.online && !h.est && h.realPeak > max) max = h.realPeak; });
    if (max < 2) return;
    var first = S.week - n, span = Math.max(1, n - 1), top = 14, h = H - top - 16;
    function X(week) { return (week - first) / span * W; }
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      var x = i / span * W, y = top + h - h * data[i] / max;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = 'rgba(232,201,135,.9)'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.lineTo(W, top + h); ctx.lineTo(0, top + h); ctx.closePath();
    var g = ctx.createLinearGradient(0, top, 0, top + h);
    g.addColorStop(0, 'rgba(201,170,113,.28)'); g.addColorStop(1, 'rgba(201,170,113,0)');
    ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = '#3fd0c4';
    S.history.forEach(function (hh) { if (hh.online && !hh.est) ctx.fillRect(X(hh.week) - 3, top + h - h * hh.realPeak / max - 1, 7, 2); });
    ctx.font = '10px Verdana, sans-serif'; ctx.fillStyle = 'rgba(143,133,113,.9)';
    var y0 = GGG.util.dateOf(first).getUTCFullYear(), y1 = GGG.util.dateOf(S.week).getUTCFullYear(), every = Math.max(1, Math.ceil((y1 - y0) / 10));
    for (var yr = y0 + 1; yr <= y1; yr += every) {
      var wx = X(GGG.util.weekOf(yr + '-01-01'));
      if (wx > 14 && wx < W - 30) ctx.fillText(String(yr), wx - 12, H - 3);
    }
    ctx.fillText(GGG.util.short(max), 4, 10);
  };
})();
