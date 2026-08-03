const fs = require('fs');
const vm = require('vm');
const h = fs.readFileSync('d:/艾迪研/智能预筛项目/原型/modules/研究中心改造/member-directory.html', 'utf8');
const code = h.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeEl(id){
  var e = {
    id:id, _classes:new Set(), value:'', innerHTML:'', textContent:'', checked:false,
    classList:{ add:function(c){this._set.add(c);}, remove:function(c){this._set.delete(c);}, contains:function(c){return this._set.has(c);}, _set:null },
    getAttribute:function(){return null;}, setAttribute:function(){}, addEventListener:function(){}, querySelectorAll:function(){return [];}, appendChild:function(){}, style:{}
  };
  e.classList._set = e._classes; return e;
}
var els={};
function getEl(id){ if(!els[id]) els[id]=makeEl(id); return els[id]; }
getEl('handoverModal')._classes.add('modal-hidden');

var documentMock={ getElementById:function(id){return getEl(id);}, querySelector:function(){return null;}, querySelectorAll:function(){return [];}, addEventListener:function(){}, createElement:function(){return makeEl('tmp');} };
var ctx={ document:documentMock, window:{}, alert:function(m){console.log('[ALERT]',m);}, console:console, setTimeout:function(fn){fn();} };
ctx.openModal=function(id){getEl(id).classList.remove('modal-hidden');};
ctx.closeModal=function(id){getEl(id).classList.add('modal-hidden');};
ctx.showToast=function(m){console.log('[TOAST]',m);};
ctx.escapeHtml=function(s){return String(s);};
vm.createContext(ctx);
vm.runInContext(code, ctx);

// 打开 m1 并模拟选交接人 m2，确认交接
ctx.openHandover('m1');
getEl('hoTarget').value='m2';
console.log('--- calling confirmHandover (m1 -> m2) ---');
try {
  ctx.confirmHandover();
  console.log('handoverModal hidden after confirm?', getEl('handoverModal')._classes.has('modal-hidden'));
  // 检查 m1 状态
  var m1 = ctx.memberData.find(function(x){return x.id==='m1';});
  console.log('m1 status after confirm:', m1 && m1.status);
  console.log('patientData 王慧柳 len:', (ctx.patientData['王慧柳']||[]).length, '| 刘雪红 len:', (ctx.patientData['刘雪红']||[]).length);
} catch(e){ console.log('RUNTIME ERROR in confirmHandover:', e.message); console.log(e.stack.split('\n').slice(0,6).join('\n')); }
