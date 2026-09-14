// 轻量冒烟：用 DOM 桩执行页面内联脚本，检查是否有运行时报错、表格/列表是否渲染出数据
const fs = require('fs');
const path = require('path');

class El {
  constructor(id) {
    this.id = id;
    this.value = '';
    this.innerHTML = '';
    this.textContent = '';
    this.style = {};
    this.dataset = {};
    this._cls = new Set();
    this.classList = {
      add: c => this._cls.add(c),
      remove: c => this._cls.delete(c),
      toggle: (c, on) => (on ? this._cls.add(c) : this._cls.delete(c)),
      contains: c => this._cls.has(c)
    };
  }
  addEventListener() {}
  appendChild() {}
  remove() {}
  closest() { return null; }
  contains() { return false; }
  blur() {}
  querySelector() { return null; }
  querySelectorAll() { return []; }
}

const dirs = [path.join('modules', 'mcp', 'mcp'), path.join('modules', '研究中心改造')];

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(n => n.endsWith('.html'));
  for (const file of files) {
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(x => x[1]);
    const pool = {};
    ids.forEach(i => (pool[i] = new El(i)));

    const docListeners = [];
    const winListeners = [];
    const document = {
      getElementById: id => pool[id] || null,
      addEventListener: (t, fn) => docListeners.push({ t, fn }),
      querySelector: () => ({ dataset: { role: 'admin' } }),
      querySelectorAll: () => [],
      createElement: () => new El('tmp'),
      body: { appendChild: () => {} }
    };
    const window = { addEventListener: (t, fn) => winListeners.push({ t, fn }) };

    const m = html.match(/<script>([\s\S]*?)<\/script>/);
    if (!m) { console.log(file + ': 无内联脚本（跳过）'); continue; }
    const script = m[1];
    try {
      // 验证启用/停用流程（若有）
      var extra =
        '\n;if (typeof renderImCards === "function") renderImCards();' +
        '\n;if (typeof renderImTable === "function") renderImTable();' +
        '\n;if (typeof openToggleModal === "function") { openToggleModal("IM-001","停用"); confirmToggleM(); }' +
        '\n;if (typeof openToggleDialog === "function") { openToggleDialog("IM-001","停用"); confirmToggle(); }';
      new Function('document', 'window', 'navigator', script + extra)(
        document, window, { clipboard: { writeText: () => Promise.resolve() } }
      );
      // 只触发 DOMContentLoaded / load 初始化回调
      const fakeEvent = { target: null, key: '', preventDefault: function(){}, currentTarget: null };
      [...docListeners, ...winListeners]
        .filter(l => l.t === 'DOMContentLoaded' || l.t === 'load')
        .forEach(l => l.fn(fakeEvent));
      console.log(file + ': 执行成功');
      ['keyTableBody', 'pjKeyTableBody', 'lgTableBody', 'logBody', 'icCardList', 'imCardList'].forEach(id => {
        if (!pool[id]) return;
        const html2 = pool[id].innerHTML || '';
        console.log('  ' + id + ': 片段长度=' + html2.length);
      });
      ['totalCount', 'pjTotalCount', 'lgTotalCount', 'mIcTotal', 'mImTotal', 'imTotalCount', 'icTotalCount'].forEach(id => {
        if (pool[id]) console.log('  ' + id + ' = ' + pool[id].textContent);
      });
    } catch (e) {
      console.log(file + ': 运行时报错 -> ' + e.message);
    }
  }
}
