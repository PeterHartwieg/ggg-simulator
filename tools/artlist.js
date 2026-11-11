/* Writes art/README.txt: every picture slot in the game and the file name it looks for.
   Usage: node tools/artlist.js */
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, Date: Date };
ctx.globalThis = ctx;
vm.createContext(ctx);
['js/util.js', 'js/data/tune.js', 'js/data/cycles.js', 'js/data/events.js', 'js/data/randoms.js', 'js/data/requests.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
});
var D = ctx.GGG.data, out = [], slots = 0;
function line(id, what) { out.push((id + '.jpg').padEnd(22) + what); slots++; }

out.push('PICTURE SLOTS');
out.push('');
out.push('GGG artwork is bundled in art/ggg. credits.html lists every source and use.');
out.push('sources.json is the source catalog; rebuild with python tools/import-art.py (Pillow required).');
out.push('manifest.js maps pictures to slots and takes precedence over automatic file-name lookup.');
out.push('For unmapped slots, save art/<slot>.jpg, .png or .webp and reload the page.');
out.push('To replace bundled art, edit sources.json and rebuild, or edit manifest.js directly.');
out.push('Missing optional pictures leave the underlying GGG background visible.');
out.push('All included game artwork is copyright Grinding Gear Games. This is an unofficial fan project.');
out.push('');
out.push('WHOLE GAME');
line('background', 'Page background, behind every panel. Large and dark works best.');
line('logo', 'Shown top left and on the title screen. A transparent .png is ideal.');
line('title', 'Title screen picture, about 16:9.');
out.push('');
out.push('RELEASES (fills the main view while that release is in development, wide pictures work best)');
D.cycles.forEach(function (c) { line(c.id, (c.ver + ' ' + c.name).trim() + ', ' + c.date); });
out.push('');
out.push('HISTORY EVENTS');
D.events.forEach(function (e) { line(e.id, e.title + ', ' + e.date); });
out.push('');
out.push('OFFICE EVENTS');
D.randoms.forEach(function (e) { line(e.id, e.title); });
out.push('');
out.push('COMMUNITY REQUESTS (shown when you ship one)');
D.requests.forEach(function (r) { line(r.id, r.name); });
out.push('');
out.push('To use other file names or locations, list them in manifest.js instead.');
fs.writeFileSync(path.join(root, 'art', 'README.txt'), out.join('\r\n') + '\r\n');
console.log('wrote art/README.txt with ' + slots + ' slots');
