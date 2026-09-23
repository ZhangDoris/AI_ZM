const fs = require('fs');
const files = [
  '审核记录-其它-医学不可沟通.html',
  '审核记录-其它-医学可沟通.html',
  '审核记录-医学-医学可沟通.html',
  '审核记录-医学-医学不可沟通.html'
];
files.forEach(function (f) {
  const s = fs.readFileSync('modules/审核沟通记录/' + f).toString('utf8');
  const m = s.match(/<script>([\s\S]*?)<\/script>/);
  let syntax = 'OK';
  if (!m) { syntax = 'NO SCRIPT'; }
  else {
    try {
      // 仅做语法解析（不执行），DOM 引用不影响 --check 式解析
      new Function(m[1]);
    } catch (e) {
      syntax = 'SYNTAX ERROR: ' + e.message;
    }
  }
  const need = ['remindPersons', 'pendingFiles', 'renderPending', 'renderRemind', 'rpList', 'zoomImg', 'showToast'];
  const missing = need.filter(function (n) { return s.indexOf(n) === -1; });
  console.log('== ' + f);
  console.log('   script syntax:', syntax);
  console.log('   missing deps:', missing.length ? missing.join(', ') : 'none');
});
