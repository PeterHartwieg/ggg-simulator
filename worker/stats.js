/* Anonymous play statistics. The site itself is static files; this Worker only answers /api/.
   POST /api/visit  adds one to today's page-load counter.
   POST /api/run    stores how far one game got, one row per game, overwritten as the game goes on.
   Nothing here stores an IP address, a cookie or anything that names a person. */

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS visits (day TEXT PRIMARY KEY, n INTEGER NOT NULL)',
  `CREATE TABLE IF NOT EXISTS runs (
     id TEXT PRIMARY KEY, first_at TEXT NOT NULL, last_at TEXT NOT NULL,
     week INTEGER, launches INTEGER, last_release TEXT, ended INTEGER, secs INTEGER,
     money REAL, staff INTEGER, par INTEGER, mood INTEGER, sanity INTEGER,
     beat INTEGER, eggs INTEGER, narrow INTEGER, depth INTEGER, trail TEXT)`
];
const MAX_BODY = 6000;

const UPSERT = `INSERT INTO runs
  (id, first_at, last_at, week, launches, last_release, ended, secs, money, staff, par, mood, sanity, beat, eggs, narrow, depth, trail)
  VALUES (?1, ?2, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)
  ON CONFLICT(id) DO UPDATE SET
    last_at = excluded.last_at, week = excluded.week, launches = excluded.launches, last_release = excluded.last_release,
    ended = excluded.ended, secs = excluded.secs, money = excluded.money, staff = excluded.staff, par = excluded.par,
    mood = excluded.mood, sanity = excluded.sanity, beat = excluded.beat, eggs = excluded.eggs,
    narrow = excluded.narrow, depth = excluded.depth, trail = excluded.trail
  WHERE excluded.week >= runs.week`;

function int(v, lo, hi) { v = Math.round(Number(v)); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo; }
function num(v, lo, hi) { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo; }
function releaseId(v) { return typeof v === 'string' && /^c_[a-z0-9]{1,14}$/.test(v) ? v : ''; }

/* Keeps only the fields we expect, in the ranges the game can produce. Anything else is dropped. */
function clean(o) {
  if (!o || typeof o.id !== 'string' || !/^[a-f0-9]{16}$/.test(o.id)) return null;
  const trail = (Array.isArray(o.trail) ? o.trail : []).slice(0, 60).map(function (t) {
    return Array.isArray(t) && releaseId(t[0]) ? [t[0], Math.round(num(t[1], 0, 3) * 100) / 100, t[2] == null ? null : Math.round(num(t[2], 0, 20) * 100) / 100] : null;
  }).filter(Boolean);
  return [
    o.id, new Date().toISOString(), int(o.week, 0, 2000), int(o.launches, 0, 60), releaseId(o.last), o.ended ? 1 : 0,
    int(o.secs, 0, 864000), Math.round(num(o.money, -1e10, 1e11)), int(o.staff, 0, 5000), int(o.par, 0, 5000),
    int(o.mood, 0, 100), int(o.sanity, 0, 100), int(o.beat, 0, 60), int(o.eggs, 0, 200),
    o.narrow ? 1 : 0, int(o.depth, 1, 999), JSON.stringify(trail)
  ];
}

/* The tables are made the first time a write finds them missing. */
async function write(env, sql, args) {
  const stmt = function () { return env.DB.prepare(sql).bind(...args); };
  try { await stmt().run(); } catch (e) {
    if (!/no such table/i.test(String(e && e.message))) throw e;
    await env.DB.batch(SCHEMA.map(function (s) { return env.DB.prepare(s); }));
    await stmt().run();
  }
}

/* Only the game's own pages may post. */
function ownPage(request, url) {
  const origin = request.headers.get('Origin');
  try { return !!origin && new URL(origin).host === url.host; } catch (e) { return false; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return new Response(null, { status: 405 });
    if (!ownPage(request, url)) return new Response(null, { status: 403 });
    try {
      if (url.pathname === '/api/visit') {
        await write(env, 'INSERT INTO visits (day, n) VALUES (?1, 1) ON CONFLICT(day) DO UPDATE SET n = n + 1', [new Date().toISOString().slice(0, 10)]);
        return new Response(null, { status: 204 });
      }
      if (url.pathname === '/api/run') {
        const text = await request.text();
        let run = null;
        if (text.length <= MAX_BODY) { try { run = clean(JSON.parse(text)); } catch (e) { run = null; } }
        if (!run) return new Response(null, { status: 400 });
        await write(env, UPSERT, run);
        return new Response(null, { status: 204 });
      }
    } catch (e) {
      console.error('stats write failed', e && e.message);
      return new Response(null, { status: 500 });
    }
    return new Response(null, { status: 404 });
  }
};
