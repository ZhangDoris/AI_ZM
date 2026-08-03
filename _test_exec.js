const fs = require('fs');
const vm = require('vm');
const h = fs.readFileSync('d:/艾迪研/智能预筛项目/原型/modules/研究中心改造/member-directory.html', 'utf8');
const m = h.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// ---- 最小 DOM mock ----
function makeEl(id) {
  return {
    id: id,
    _classes: new Set(),
    value: '',
    innerHTML: '',
    textContent: '',
    checked: false,
    classList: {
      add: function(c){ this._set.add(c); },
      remove: function(c){ this._set.delete(c); },
      contains: function(c){ return this._set.has(c); },
      _set: null
    },
    getAttribute: function(){ return null; },
    setAttribute: function(){},
    addEventListener: function(){},
    querySelectorAll: function(){ return []; },
    appendChild: function(){},
    style: {}
  };
}

var els = {};
function getEl(id){
  if(!els[id]){
    var e = makeEl(id);
    e.classList._set = e._classes;
    els[id] = e;
  }
  return els[id];
}
// 初始 handoverModal 带 modal-hidden
getEl('handoverModal')._classes.add('modal-hidden');

var documentMock = {
  getElementById: function(id){ return getEl(id); },
  querySelector: function(){ return null; },
  querySelectorAll: function(){ return []; },
  addEventListener: function(){},
  createElement: function(){ return makeEl('tmp'); }
};

var windowMock = {};
var ctx = {
  document: documentMock,
  window: windowMock,
  alert: function(msg){ console.log('[ALERT]', msg); },
  console: console,
  setTimeout: function(fn){ fn(); }
};
ctx.openModal = function(id){ getEl(id).classList.remove('modal-hidden'); };
ctx.closeModal = function(id){ getEl(id).classList.add('modal-hidden'); };
ctx.showToast = function(msg){ console.log('[TOAST]', msg); };
ctx.escapeHtml = function(s){ return String(s); };

vm.createContext(ctx);
try {
  // 先执行整段脚本（定义函数）
  vm.runInContext(code, ctx);
  // 再单独执行 openHandover('m1')
  console.log('--- calling openHandover(m1) ---');
  ctx.openHandover('m1');
  console.log('handoverModal hidden after open?', getEl('handoverModal')._classes.has('modal-hidden'));
  console.log('hoMemberName textContent:', getEl('hoMemberName').textContent || '(set via innerHTML?)');
  console.log('hoHint:', getEl('hoHint').textContent);
  console.log('hoTarget innerHTML length:', getEl('hoTarget').innerHTML.length);
} catch(e) {
  console.log('RUNTIME ERROR:', e.message);
  console.log(e.stack.split('\n').slice(0,5).join('\n'));
}
