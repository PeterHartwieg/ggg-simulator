/* Synthesized effects and the classic 2013 Path of Exile menu theme by Adgio Hutchings.
   Music is bundled at audio/menu.mp3. Credits and provenance: audio/credits.html. */
(function () {
  'use strict';
  var GGG = window.GGG, Snd = GGG.audio = {};
  var ctx = null, master = null, music = null;
  var MUSIC_SRC = 'audio/menu.mp3', PAR = 70;

  function load(key, def) { try { var v = localStorage.getItem(key); return v == null ? def : v; } catch (e) { return def; } }
  function store(key, val) { try { localStorage.setItem(key, String(val)); } catch (e) { /* private mode */ } }
  function pct(v, def) { v = parseInt(v, 10); return isNaN(v) ? def : Math.min(100, Math.max(0, v)); }

  Snd.muted = load('ggg-sim-muted', '0') === '1';
  /* Volumes run 0 to 100. Sound at 70 is the level the effects were tuned at. */
  var vol = { sfx: pct(load('ggg-sim-vol'), PAR), music: pct(load('ggg-sim-music'), 40) };
  Snd.hasMusic = false;

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = vol.sfx / PAR;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type, v) {
    var c = ac();
    if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + start;
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v || 0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
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
    if (Snd.muted || !vol.sfx || !SOUNDS[name]) return;
    try { SOUNDS[name](); } catch (e) { /* audio is optional */ }
  };

  /* Music plays whenever it may: not muted, slider above zero, tab in view. Browsers hold it back until the first click. */
  function syncMusic() {
    if (!music) return;
    var on = !Snd.muted && vol.music > 0 && document.visibilityState !== 'hidden';
    music.volume = Math.pow(vol.music / 100, 1.6);
    if (!on) { music.pause(); return; }
    if (music.paused) { try { var p = music.play(); if (p && p.catch) p.catch(function () { /* waits for a click */ }); } catch (e) { /* optional */ } }
  }

  /* What a slider should show: zero while everything is muted. */
  Snd.level = function (kind) { return Snd.muted ? 0 : vol[kind]; };
  /* Moving a slider above zero also ends a mute. */
  Snd.setLevel = function (kind, v) {
    v = pct(v, 0);
    if (Snd.muted && v > 0) { Snd.muted = false; store('ggg-sim-muted', '0'); }
    vol[kind] = v;
    store(kind === 'sfx' ? 'ggg-sim-vol' : 'ggg-sim-music', v);
    if (master) master.gain.value = vol.sfx / PAR;
    syncMusic();
  };
  Snd.toggle = function () {
    Snd.muted = !Snd.muted;
    /* Unmuting with everything at zero would do nothing, so it brings the sound back. */
    if (!Snd.muted && !vol.sfx && !(Snd.hasMusic && vol.music)) Snd.setLevel('sfx', PAR);
    store('ggg-sim-muted', Snd.muted ? '1' : '0');
    syncMusic();
    return Snd.muted;
  };

  if (/^https?:$/.test(location.protocol) && window.fetch) {
    fetch(MUSIC_SRC, { method: 'HEAD' }).then(function (r) {
      if (!r.ok || !/^audio\//.test(r.headers.get('Content-Type') || '')) return;
      music = new Audio(MUSIC_SRC);
      music.loop = true;
      Snd.hasMusic = true;
      syncMusic();
    }).catch(function () { /* no music */ });
    document.addEventListener('pointerdown', syncMusic);
    document.addEventListener('click', syncMusic);
    document.addEventListener('keydown', syncMusic);
    document.addEventListener('visibilitychange', syncMusic);
  }
})();
