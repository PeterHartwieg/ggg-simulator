/* Drawn at runtime: the player-count chart and the embers. Game artwork is mapped in art/manifest.js. */
(function () {
  'use strict';
  var GGG = window.GGG, A = GGG.art = {};

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
    ctx.shadowColor = 'rgba(255,196,110,.75)'; ctx.shadowBlur = 9;
    ctx.strokeStyle = 'rgba(243,220,167,.95)'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineTo(W, top + h); ctx.lineTo(0, top + h); ctx.closePath();
    var g = ctx.createLinearGradient(0, top, 0, top + h);
    g.addColorStop(0, 'rgba(201,170,113,.28)'); g.addColorStop(1, 'rgba(201,170,113,0)');
    ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = '#3fd0c4'; ctx.shadowColor = 'rgba(63,208,196,.8)'; ctx.shadowBlur = 6;
    S.history.forEach(function (hh) {
      if (!hh.online || hh.est) return;
      var mx = X(hh.week), my = top + h - h * hh.realPeak / max;
      ctx.beginPath(); ctx.moveTo(mx, my - 3.5); ctx.lineTo(mx + 3.5, my); ctx.lineTo(mx, my + 3.5); ctx.lineTo(mx - 3.5, my); ctx.fill();
    });
    ctx.shadowBlur = 0;
    ctx.font = '10px Verdana, sans-serif'; ctx.fillStyle = 'rgba(143,133,113,.9)';
    var y0 = GGG.util.dateOf(first).getUTCFullYear(), y1 = GGG.util.dateOf(S.week).getUTCFullYear(), every = Math.max(1, Math.ceil((y1 - y0) / 10));
    for (var yr = y0 + 1; yr <= y1; yr += every) {
      var wx = X(GGG.util.weekOf(yr + '-01-01'));
      if (wx > 14 && wx < W - 30) ctx.fillText(String(yr), wx - 12, H - 3);
    }
    ctx.fillText(GGG.util.short(max), 4, 10);
  };

  /* Embers drifting up through a canvas. Runs only while the canvas is on screen. */
  A.embers = function (cv, count) {
    if (!cv || cv._embers || !window.requestAnimationFrame) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cv._embers = true;
    var ctx = cv.getContext('2d'), P = [], last = 0, W = 0, H = 0, n = count || 44, i;
    function spawn(p, anywhere) {
      p.x = Math.random() * W; p.y = anywhere ? Math.random() * H : H + 8;
      p.r = 0.5 + Math.random() * 1.7; p.vy = 9 + Math.random() * 30; p.vx = -7 + Math.random() * 14;
      p.age = 0; p.max = 5 + Math.random() * 9; p.ph = Math.random() * 6.28; p.hot = Math.random() < 0.25;
    }
    function frame(t) {
      if (!cv.isConnected) { cv._embers = false; return; }
      window.requestAnimationFrame(frame);
      var w = cv.clientWidth, hh = cv.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1), dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!w || !hh || document.hidden || window.getComputedStyle(cv).visibility === 'hidden') return;
      if (w !== W || hh !== H) {
        W = w; H = hh; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        if (!P.length) for (i = 0; i < n; i++) { P.push({}); spawn(P[i], true); }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < P.length; i++) {
        var p = P[i];
        p.age += dt; p.y -= p.vy * dt; p.x += (p.vx + Math.sin(p.ph + p.age * 1.3) * 10) * dt;
        if (p.age > p.max || p.y < -10) { spawn(p, false); continue; }
        var a = Math.sin(Math.PI * p.age / p.max) * (p.hot ? 0.9 : 0.55);
        ctx.fillStyle = 'rgba(255,' + (p.hot ? 190 : 150) + ',70,' + (a * 0.22).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.4, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(255,' + (p.hot ? 226 : 186) + ',130,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    window.requestAnimationFrame(frame);
  };
})();
