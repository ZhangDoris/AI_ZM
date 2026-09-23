const fs = require('fs');
const files = [
  '审核记录-其它-医学不可沟通.html',
  '审核记录-其它-医学可沟通.html',
  '审核记录-医学-医学可沟通.html',
  '审核记录-医学-医学不可沟通.html'
];
files.forEach(function (f) {
  const s = fs.readFileSync('modules/审核沟通记录/' + f).toString('utf8');
  const opens = (s.match(/<div\b/g) || []).length;
  const closes = (s.match(/<\/div>/g) || []).length;
  const checks = {
    'right-drawer-handle': s.indexOf('right-drawer-handle') > -1,
    'reviewActions': s.indexOf('id="reviewActions"') > -1,
    'rightChat': s.indexOf('id="rightChat"') > -1,
    'rightLink': s.indexOf('id="rightLink"') > -1,
    'rightInfo': s.indexOf('id="rightInfo"') > -1,
    'rightRemark': s.indexOf('id="rightRemark"') > -1,
    'matchDrawer': s.indexOf('id="matchDrawer"') > -1,
    'showRightMode(appended)': s.indexOf('function showRightMode(') > -1,
    'remindMask(提醒人员保留)': s.indexOf('id="remindMask"') > -1 || s.indexOf('remindMask') > -1,
    'toggleRemind(保留)': s.indexOf('function toggleRemind(') > -1,
    '遗留:全宽stage-nav前content-row': /stage-nav">\s*<div class="stage-tabs"[\s\S]*?<\/div>\s*<\/div>\s*<div class="content-row">/.test(s) === false,
    '遗留:左列chat-footer': s.indexOf('class="chat-footer"') === -1 || /content-row[\s\S]*?chat-footer/.test(s) === false
  };
  console.log('== ' + f);
  console.log('   div open/close:', opens, '/', closes, opens === closes ? 'BALANCED' : '*** UNBALANCED ***');
  Object.keys(checks).forEach(function (k) {
    console.log('   ' + (checks[k] ? 'OK ' : 'XX ') + k);
  });
  console.log('');
});
