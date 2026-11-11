-- Play statistics. Run with: node tools/stats.js
-- Each query starts with one comment line, which the tool prints as its heading. Keep a blank line between queries.

-- Page loads and games started, per day.
SELECT d.day, COALESCE(v.n, 0) AS page_loads, COALESCE(r.games, 0) AS games_started
FROM (SELECT day FROM visits UNION SELECT substr(first_at, 1, 10) FROM runs) d
LEFT JOIN visits v ON v.day = d.day
LEFT JOIN (SELECT substr(first_at, 1, 10) AS day, COUNT(*) AS games FROM runs GROUP BY 1) r ON r.day = d.day
ORDER BY d.day DESC LIMIT 30;

-- How far games get. Each row counts the games that shipped at least that many releases.
WITH steps(n) AS (VALUES (0), (1), (2), (4), (6), (10), (15), (20), (30), (40), (50), (54))
SELECT n AS releases_shipped,
       (SELECT COUNT(*) FROM runs WHERE launches >= n) AS games,
       ROUND(100.0 * (SELECT COUNT(*) FROM runs WHERE launches >= n) / MAX(1, (SELECT COUNT(*) FROM runs)), 1) AS percent
FROM steps;

-- Where games stop. The last release shipped by games that never reached the ending.
SELECT COALESCE(NULLIF(last_release, ''), 'before the first release') AS stopped_after, COUNT(*) AS games,
       ROUND(AVG(secs) / 60.0, 1) AS avg_minutes, ROUND(AVG(money)) AS avg_money, ROUND(AVG(mood)) AS avg_reddit, ROUND(AVG(sanity)) AS avg_sanity
FROM runs WHERE ended = 0 AND datetime(last_at) < datetime('now', '-1 hour')
GROUP BY 1 ORDER BY games DESC LIMIT 25;

-- How each release goes for players. Quality 1.0 is par. vs_real is the launch peak against the real Steam peak.
SELECT json_extract(t.value, '$[0]') AS release_id, COUNT(*) AS games,
       ROUND(AVG(json_extract(t.value, '$[1]')), 2) AS avg_quality,
       ROUND(AVG(json_extract(t.value, '$[2]')), 2) AS avg_vs_real,
       ROUND(100.0 * SUM(json_extract(t.value, '$[2]') >= 1) / MAX(1, SUM(json_extract(t.value, '$[2]') IS NOT NULL))) AS beat_real_percent
FROM runs, json_each(runs.trail) t
GROUP BY 1 ORDER BY MIN(t.key);

-- Finished games.
SELECT COUNT(*) AS finished, ROUND(AVG(secs) / 60.0) AS avg_minutes, ROUND(AVG(beat), 1) AS avg_launches_that_beat_reality,
       ROUND(AVG(eggs), 1) AS avg_secrets, SUM(narrow) AS on_narrow_screens, SUM(depth > 1) AS replays
FROM runs WHERE ended = 1;
