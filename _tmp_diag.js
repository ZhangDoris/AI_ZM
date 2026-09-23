const fs = require('fs');
const files = [
  '审核记录-其它-医学不可沟通.html',
  '审核记录-其它-医学可沟通.html',
  '审核记录-医学-医学可沟通.html',
  '审核记录-医学-医学不可沟通.html'
];
files.forEach(function (f) {
  const b = fs.readFileSync('modules/审核沟通记录/' + f);
  const s = b.toString('utf8');
  const crlf = (b.indexOf(Buffer.from('\r\n')) > -1);
  const t1 = s.indexOf('    <div class="stage-nav">\n      <div class="stage-tabs" id="stageTabs">\n        <div class="stage-tab" data-group="预筛审核" onclick="switchStage(this)">预筛阶段</div>\n        <div class="stage-tab active" data-group="入组审核" onclick="switchStage(this)">入组阶段</div>\n      </div>\n    </div>\n\n    <div class="content-row">');
  const t1crlf = s.indexOf('    <div class="stage-nav">\r\n      <div class="stage-tabs" id="stageTabs">\r\n        <div class="stage-tab" data-group="预筛审核" onclick="switchStage(this)">预筛阶段</div>\r\n        <div class="stage-tab active" data-group="入组审核" onclick="switchStage(this)">入组阶段</div>\r\n      </div>\r\n    </div>\r\n\r\n    <div class="content-row">');
  const hasHandle = s.indexOf('right-drawer-handle') > -1;
  console.log(f, '| CRLF:', crlf, '| t1(LF):', t1 > -1, '| t1(CRLF):', t1crlf > -1, '| transformed:', hasHandle);
});
