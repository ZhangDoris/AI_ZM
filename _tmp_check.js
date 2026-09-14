const fs = require('fs');
const path = require('path');
const dirs = [path.join('modules', 'mcp', 'mcp'), path.join('modules', '研究中心改造')];

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(n => n.endsWith('.html'));
  for (const f of files) {
    const h = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = h.match(/<script>([\s\S]*?)<\/script>/);
    if (!m) { console.log(f + ': 无内联脚本'); continue; }
    let ok = true;
    try { new Function(m[1]); } catch (e) { ok = false; console.log(f + ': JS ERROR -> ' + e.message); }

    const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map(x => x[1]);
    const dup = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
    if (dup.length) console.log(f + ': 重复 id -> ' + dup.join(', '));

    const refs = [...m[1].matchAll(/getElementById\('([^']+)'\)/g)].map(x => x[1]);
    const missing = [...new Set(refs)].filter(r => !ids.includes(r));
    if (missing.length) console.log(f + ': 缺失元素 id -> ' + missing.join(', '));

    if (ok && !dup.length && !missing.length) console.log(f + ': JS OK / id OK');
  }
}
