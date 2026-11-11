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
var D = ctx.GGG.data, out = [];
function line(id, what) { out.push((id + '.jpg').padEnd(22) + what); }

out.push('PICTURE SLOTS');
out.push('');
out.push('Save a picture in this folder under one of the names below and the game uses it.');
out.push('No code changes needed. .jpg, .png and .webp all work. Reload the page afterwards.');
out.push('Anything you do not supply falls back to the built-in art.');
out.push('You are responsible for having the right to use whatever you put here.');
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
console.log('wrote art/README.txt with ' + (out.length - 16) + ' slots');
