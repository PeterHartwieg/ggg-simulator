/* Tiny synthesized sound effects. No audio files. Off until the first click. */
(function () {
  'use strict';
  var GGG = window.GGG, Snd = GGG.audio = {};
  var ctx = null;
  Snd.muted = false;
  try { Snd.muted = localStorage.getItem('ggg-sim-muted') === '1'; } catch (e) { /* private mode */ }

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type, vol) {
    var c = ac();
    if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + start;
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  var SOUNDS = {
    click: function () { tone(520, 0, 0.05, 'square', 0.03); },
    event: function () { tone(392, 0, 0.18, 'triangle'); tone(523, 0.12, 0.25, 'triangle'); },
    egg: function () { tone(1318, 0, 0.5, 'sine', 0.07); tone(1976, 0.06, 0.6, 'sine', 0.05); }, // the good-drop ding
    cash: function () { tone(880, 0, 0.08, 'square', 0.04); tone(1175, 0.07, 0.12, 'square', 0.04); },
    good: function () { tone(523, 0, 0.15, 'triangle'); tone(659, 0.12, 0.15, 'triangle'); tone(784, 0.24, 0.35, 'triangle'); },
    bad: function () { tone(220, 0, 0.3, 'sawtooth', 0.05); tone(165, 0.22, 0.5, 'sawtooth', 0.05); },
    launch: function () { tone(98, 0, 0.9, 'sawtooth', 0.06); tone(147, 0.05, 0.9, 'sawtooth', 0.05); tone(196, 0.4, 0.8, 'triangle', 0.06); },
    no: function () { tone(140, 0, 0.12, 'square', 0.04); }
  };
  Snd.play = function (name) {
    if (Snd.muted || !SOUNDS[name]) return;
    try { SOUNDS[name](); } catch (e) { /* audio is optional */ }
  };
  Snd.toggle = function () {
    Snd.muted = !Snd.muted;
    try { localStorage.setItem('ggg-sim-muted', Snd.muted ? '1' : '0'); } catch (e) { /* ignore */ }
    return Snd.muted;
  };
})();
