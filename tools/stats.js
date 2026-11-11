/* Prints the play statistics from the live database as plain tables.
   Usage: node tools/stats.js [--local]
   It runs the queries in tools/stats.sql through wrangler, so you need to be logged in to Cloudflare. */
'use strict';
var fs = require('fs'), path = require('path'), cp = require('child_process');

var where = process.argv.indexOf('--local') >= 0 ? '--local' : '--remote';
var sql = fs.readFileSync(path.join(__dirname, 'stats.sql'), 'utf8');
/* Each query in the file starts with a comment line, which becomes its heading. */
var blocks = sql.split(/\n\s*\n/).map(function (b) {
  var lines = b.split('\n'), title = lines.filter(function (l) { return /^--/.test(l); }).map(function (l) { return l.replace(/^--\s?/, ''); }).join(' ');
  return { title: title, query: lines.filter(function (l) { return !/^--/.test(l); }).join(' ').trim() };
}).filter(function (b) { return b.query; });

var out = cp.execSync('npx --yes wrangler@latest d1 execute ggg-simulator-stats ' + where + ' --json --command "' +
  blocks.map(function (b) { return b.query.replace(/"/g, '\\"'); }).join(' ') + '"',
  { cwd: path.join(__dirname, '..'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 });
var results = JSON.parse(out.slice(out.indexOf('[')));

results.forEach(function (res, i) {
  var rows = res.results || [], title = blocks[i] ? blocks[i].title : '';
  console.log('\n' + title);
  if (!rows.length) { console.log('  (nothing yet)'); return; }
  var cols = Object.keys(rows[0]);
  var width = cols.map(function (c) { return Math.max(c.length, Math.max.apply(null, rows.map(function (r) { return String(r[c] == null ? '' : r[c]).length; }))); });
  function line(vals) { return '  ' + vals.map(function (v, k) { return String(v == null ? '' : v).padEnd(width[k]); }).join('  '); }
  console.log(line(cols));
  rows.forEach(function (r) { console.log(line(cols.map(function (c) { return r[c]; }))); });
});
