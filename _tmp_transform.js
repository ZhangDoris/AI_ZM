const fs = require('fs');
const path = require('path');

const root = 'D:/艾迪研/智能预筛项目/原型/modules/审核沟通记录';
const masterPath = path.join(root, '审核-医学可沟通.html');
const targets = [
  '审核记录-其它-医学不可沟通.html',
  '审核记录-其它-医学可沟通.html',
  '审核记录-医学-医学可沟通.html',
  '审核记录-医学-医学不可沟通.html'
];

let master = fs.readFileSync(masterPath, 'utf8').replace(/\r\n/g, '\n');

// 提取 master 的 <style>...</style>
const styleMatch = master.match(/<style>[\s\S]*?<\/style>/);
if (!styleMatch) { console.error('master style not found'); process.exit(1); }
const masterStyle = styleMatch[0];

// ---- 需要注入的 HTML 片段（取自 master，确保与审核页一致）----
const rightChatHtml = `          <!-- 沟通输入面板（点击「沟通」时显示，位于收缩后的审核流程 / 审核链路之间） -->
          <div id="rightChat" class="hidden">
            <div class="review-panel-head" style="margin-bottom:10px;flex:0 0 auto;">
              <span class="review-panel-title"><i class="fa fa-comments"></i> 沟通</span>
            </div>
            <div class="chat-box" id="chatBox">
              <div class="chat-toolbar">
                <button class="btn btn-default btn-sm" onclick="onUpload()"><i class="fa fa-paperclip"></i> 上传附件</button>
                <button class="btn btn-default btn-sm" onclick="toggleRemind()"><i class="fa fa-bell"></i> 提醒人员</button>
                <input type="file" id="fileInput" style="display:none" multiple onchange="onFileChosen(this)" />
              </div>
              <div class="pending-files hidden" id="pendingFiles"></div>
              <div class="mention-chips hidden" id="mentionChips"></div>
              <div class="chat-input-row" id="chatInputRow">
                <div class="chat-input-wrap">
                  <textarea class="chat-input" id="chatInput" placeholder="请输入消息，Enter 换行；也可将图片 / 文件拖拽、复制到此处上传" onkeydown="chatInputKey(event)"></textarea>
                  <div class="chat-expand-tip"><span>放大编辑中：Enter 换行，Esc 缩小</span></div>
                </div>
                <div class="chat-hint" style="flex:0 0 auto;"><i class="fa fa-info-circle"></i> 如需提醒相关人员，请先点击「提醒人员」添加后再发送。</div>
                <div class="chat-actions">
                  <div class="chat-actions-right">
                    <button class="btn btn-default" onclick="closeChat()">取消</button>
                    <button class="btn btn-primary chat-send" onclick="sendMsg()">发送</button>
                  </div>
                </div>
              </div>
              <div class="drop-overlay" id="dropOverlay">
                <i class="fa fa-cloud-upload-alt"></i>
                <span>将图片 / 文件拖拽到此处即可上传</span>
              </div>
            </div>
          </div>`;

const rightRemarkHtml = `          <!-- 我的批注（点击「我的批注」时显示，右侧折叠模式） -->
          <div id="rightRemark" class="hidden">
            <div class="review-panel" id="remarkPanel">
              <div class="review-panel-head">
                <span class="review-panel-title"><i class="fa fa-pencil-square-o"></i> 我的批注</span>
              </div>
              <div class="review-panel-body">
                <div class="remark-edit-title">新增 / 编辑批注</div>
                <div class="form-item x-expand-host" style="margin-bottom:0">
                  <div class="x-wrap">
                    <textarea class="form-textarea" id="remarkText" placeholder="请输入批注内容" onkeydown="xExpandKey(event,'remarkText')">患者既往病史需进一步核实，已备注待跟进。</textarea>
                  </div>
                  <div class="x-expand-tip"><span>放大编辑中：Enter 换行，Esc 缩小</span></div>
                </div>
                <div class="remark-edit-actions">
                  <button class="btn btn-default" onclick="closeRemark()">取消</button>
                  <button class="btn btn-primary" onclick="saveRemark()">保存批注</button>
                </div>
              </div>
              <div class="review-panel-head" style="border-top:1px solid #f0f0f0">
                <span class="review-panel-title">历史批注<span class="remark-panel-tip">仅自己可见</span></span>
              </div>
              <div class="review-panel-body remark-scroll">
                <div class="remark-card">
                  <div class="remark-card-hd">
                    <span class="remark-card-tag">V2审核</span>
                    <span class="remark-card-time">2026-08-07 20:50:12</span>
                  </div>
                  <div class="remark-card-bd">患者既往病史需进一步核实，已备注待跟进。</div>
                  <div class="remark-card-ops">
                    <span class="remark-op" onclick="editRemark()"><i class="fa fa-pencil"></i> 编辑</span>
                    <span class="remark-op danger" onclick="showToast('删除批注')"><i class="fa fa-trash"></i> 删除</span>
                  </div>
                </div>
                <div id="remarkMore">
                  <div class="remark-card">
                    <div class="remark-card-hd">
                      <span class="remark-card-tag">V1审核</span>
                      <span class="remark-card-time">2026-08-10 14:22:03</span>
                    </div>
                    <div class="remark-card-bd">入排标准基本符合，建议补充近期血脂复查结果。</div>
                    <div class="remark-card-ops">
                      <span class="remark-op" onclick="editRemark()"><i class="fa fa-pencil"></i> 编辑</span>
                      <span class="remark-op danger" onclick="showToast('删除批注')"><i class="fa fa-trash"></i> 删除</span>
                    </div>
                  </div>
                  <div class="remark-card">
                    <div class="remark-card-hd">
                      <span class="remark-card-tag">预筛审核</span>
                      <span class="remark-card-time">2026-07-13 09:11:45</span>
                    </div>
                    <div class="remark-card-bd">已电话联系患者，确认下周复查时间。</div>
                    <div class="remark-card-ops">
                      <span class="remark-op" onclick="editRemark()"><i class="fa fa-pencil"></i> 编辑</span>
                      <span class="remark-op danger" onclick="showToast('删除批注')"><i class="fa fa-trash"></i> 删除</span>
                    </div>
                  </div>
                </div>
                <button class="remark-more" id="remarkMoreBtn" onclick="toggleRemarkMore()">收起历史批注（2）</button>
              </div>
            </div>
          </div>`;

const matchDrawerHtml = `  <!-- 匹配详情抽屉（右侧大屏，iframe 嵌入） -->
  <div class="drawer-mask hidden" id="matchDrawer" onclick="if(event.target===this)closeMatchDrawer()">
    <div class="drawer-panel">
      <div class="drawer-head">
        <span><i class="fa fa-file-alt"></i> 匹配详情</span>
        <i class="fa fa-times" onclick="closeMatchDrawer()"></i>
      </div>
      <div class="drawer-body">
        <iframe class="drawer-iframe" src="预筛没有匹配.html" title="匹配详情"></iframe>
      </div>
    </div>
  </div>`;

// ---- 需要补齐的 JS 函数（取自 master，showRightMode 去掉对 rightAction 的依赖）----
const appendedJs = `
    /* ===== 以下为对齐「审核页」布局补齐的抽屉 / 沟通 / 批注 逻辑 ===== */
    function now() {
      var d = new Date();
      function p(n) { return (n < 10 ? '0' : '') + n; }
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
        p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    }
    function escapeHtml(s) {
      return s.replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }
    function appendSelfMsg(text, files, mentions) {
      var body = document.querySelector('.chat-panel .chat-body');
      if (!body) return;
      var mentionHtml = (mentions || []).map(function (p) {
        return '<span class="chat-mention">@' + escapeHtml(p.name) + '</span>';
      }).join('');
      var bubble = mentionHtml + escapeHtml(text);
      if (files && files.length) {
        bubble += '<div class="chat-files">';
        files.forEach(function (f) {
          if (f.url) {
            bubble += '<div class="chat-file">' +
              '<img class="file-thumb" src="' + f.url + '" alt="' + escapeHtml(f.name) + '" onclick="zoomImg(this)"/>' +
              '<button class="attach-btn" onclick="showToast(\'下载附件\')">下载</button>' +
              '<button class="attach-btn danger" onclick="showToast(\'删除附件\')">删除</button></div>';
          } else {
            bubble += '<div class="chat-file"><span class="chat-fname">' + escapeHtml(f.name) + '</span>' +
              '<button class="attach-btn" onclick="showToast(\'下载附件\')">下载</button>' +
              '<button class="attach-btn danger" onclick="showToast(\'删除附件\')">删除</button></div>';
          }
        });
        bubble += '</div>';
      }
      var msg = document.createElement('div');
      msg.className = 'chat-msg self';
      msg.innerHTML = '<div class="chat-avatar">王</div>' +
        '<div class="chat-content"><div class="chat-meta">王强 · 医学经理 · ' + now() +
        '</div><div class="chat-bubble">' + bubble + '</div></div>';
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
    }
    function toggleChatExpand(force) {
      var row = document.getElementById('chatInputRow');
      var btn = document.getElementById('chatExpandBtn');
      if (!row) return;
      var on = typeof force === 'boolean' ? force : !row.classList.contains('expanded');
      row.classList.toggle('expanded', on);
      if (btn) btn.innerHTML = on ? '<i class="fa fa-compress"></i>' : '<i class="fa fa-expand"></i>';
      if (on) {
        var ta = document.getElementById('chatInput');
        if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
      }
    }
    function chatInputKey(e) {
      var expanded = document.getElementById('chatInputRow').classList.contains('expanded');
      if (expanded) {
        if (e.key === 'Escape') { e.preventDefault(); toggleChatExpand(false); }
        else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendMsg(); }
      } else {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
      }
    }
    function toggleXExpand(id, force) {
      var ta = document.getElementById(id);
      if (!ta) return;
      var host = ta.closest('.x-expand-host');
      if (!host) return;
      var btn = host.querySelector('.x-expand-btn');
      var on = typeof force === 'boolean' ? force : !host.classList.contains('expanded');
      host.classList.toggle('expanded', on);
      if (btn) btn.innerHTML = on ? '<i class="fa fa-compress"></i>' : '<i class="fa fa-expand"></i>';
      if (on) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
    }
    function xExpandKey(e, id) {
      var ta = document.getElementById(id);
      if (!ta) return;
      var host = ta.closest('.x-expand-host');
      if (host && host.classList.contains('expanded') && e.key === 'Escape') {
        e.preventDefault(); toggleXExpand(id, false);
      }
    }
    /* 右侧抽屉：信息 / 沟通 / 批注 三种模式，互斥整块替换（本页无「操作/通过驳回」） */
    function showRightMode(mode) {
      var info = document.getElementById('rightInfo');
      var link = document.getElementById('rightLink');
      var chat = document.getElementById('rightChat');
      var remark = document.getElementById('rightRemark');
      if (!info || !chat) return;
      var isChat = mode === 'chat';
      var isRemark = mode === 'remark';
      var isOther = isChat || isRemark;
      info.classList.toggle('hidden', isOther);
      if (link) link.classList.toggle('hidden', isOther);
      chat.classList.toggle('hidden', !isChat);
      if (remark) remark.classList.toggle('hidden', !isRemark);
    }
    function toggleRightDrawer() {
      var stack = document.getElementById('rightStack');
      if (!stack) return;
      if (stack.classList.contains('collapsed')) expandRightDrawer();
      else collapseRightDrawer();
    }
    function collapseRightDrawer() {
      var stack = document.getElementById('rightStack');
      if (stack) stack.classList.add('collapsed');
      updateRightHandle();
    }
    function expandRightDrawer() {
      var stack = document.getElementById('rightStack');
      if (stack) stack.classList.remove('collapsed');
      updateRightHandle();
    }
    function updateRightHandle() {
      var handle = document.getElementById('rightHandle');
      if (!handle) return;
      var collapsed = document.getElementById('rightStack').classList.contains('collapsed');
      handle.style.right = collapsed ? '12px' : '502px';
      handle.innerHTML = collapsed
        ? '<i class="fa fa-chevron-left"></i>'
        : '<i class="fa fa-chevron-right"></i>';
    }
    function openChat() {
      showRightMode('chat');
      expandRightDrawer();
      document.getElementById('chatBox').classList.remove('hidden');
      var ta = document.getElementById('chatInput');
      if (ta) ta.focus();
    }
    function closeChat() {
      showRightMode('info');
    }
    function openRemark() {
      showRightMode('remark');
      expandRightDrawer();
      var ta = document.getElementById('remarkText');
      if (ta) ta.focus();
    }
    function closeRemark() {
      showRightMode('info');
    }
    function editRemark() {
      var ta = document.getElementById('remarkText');
      if (ta) { ta.focus(); ta.scrollIntoView({ block: 'center' }); }
    }
    function saveRemark() {
      var ta = document.getElementById('remarkText');
      if (!ta || !ta.value.trim()) { showToast('请输入批注内容'); return; }
      closeRemark();
      showToast('批注已保存');
    }
    function toggleRemarkMore() {
      var box = document.getElementById('remarkMore');
      var btn = document.getElementById('remarkMoreBtn');
      var open = box.classList.toggle('hidden');
      var n = box.querySelectorAll('.remark-card').length;
      btn.textContent = open ? ('更多批注（' + n + '）') : ('收起历史批注（' + n + '）');
    }
    var remarkTotal = 3;
    function refreshRemark() {
      var bc = document.getElementById('remarkCount');
      if (bc) bc.textContent = remarkTotal;
    }
    function sendMsg() {
      var ta = document.getElementById('chatInput');
      var text = ta.value.trim();
      var mentions = remindPersons.filter(function (p) { return p.selected; });
      if (!text && !pendingFiles.length) { showToast('请输入消息内容'); return; }
      appendSelfMsg(text, pendingFiles.slice(), mentions);
      ta.value = '';
      if (document.getElementById('chatInputRow').classList.contains('expanded')) toggleChatExpand(false);
      pendingFiles = [];
      renderPending();
      remindPersons.forEach(function (p) { p.selected = false; });
      renderRemind();
      document.getElementById('rpList').classList.add('hidden');
      showRightMode('info');
      expandRightDrawer();
    }
    function openMatchDrawer() { document.getElementById('matchDrawer').classList.remove('hidden'); }
    function closeMatchDrawer() { document.getElementById('matchDrawer').classList.add('hidden'); }
    updateRightHandle();
`;

function replaceOnce(content, oldStr, newStr, label, file) {
  const idx = content.indexOf(oldStr);
  if (idx === -1) {
    console.error('  [FAIL] ' + label + ' 未在 ' + file + ' 中找到匹配');
    return null;
  }
  const count = content.split(oldStr).length - 1;
  if (count > 1) {
    console.error('  [WARN] ' + label + ' 在 ' + file + ' 中出现 ' + count + ' 次，仅替换第一处');
  }
  return content.replace(oldStr, newStr);
}

targets.forEach(function (name) {
  const file = path.join(root, name);
  console.log('== 处理 ' + name);
  let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

  // 1) 替换 <style> 为 master 的
  const styleTag = c.match(/<style>[\s\S]*?<\/style>/);
  if (!styleTag) { console.error('  [FAIL] 无 <style>'); return; }
  c = c.replace(styleTag[0], masterStyle);

  // 2) 移除全宽 stage-nav（位于 content-row 之前）
  const t1old = `    <div class="stage-nav">
      <div class="stage-tabs" id="stageTabs">
        <div class="stage-tab" data-group="预筛审核" onclick="switchStage(this)">预筛阶段</div>
        <div class="stage-tab active" data-group="入组审核" onclick="switchStage(this)">入组阶段</div>
      </div>
    </div>

    <div class="content-row">`;
  c = replaceOnce(c, t1old, `    <div class="content-row">`, '移除全宽stage-nav', name);
  if (c === null) return;

  // 3) 左列 block-header 注入 stage-nav + review-actions
  const t2old = `      <div class="col">
        <div class="block-header">
          <div class="block-title"><i class="fa fa-comments"></i> 审核沟通</div>
        </div>`;
  const t2new = `      <div class="col">
        <div class="stage-nav">
          <div class="stage-tabs" id="stageTabs">
            <div class="stage-tab" data-group="预筛审核" onclick="switchStage(this)">预筛阶段</div>
            <div class="stage-tab active" data-group="入组审核" onclick="switchStage(this)">入组阶段</div>
          </div>
        </div>
        <div class="block-header">
          <div class="block-title"><i class="fa fa-comments"></i> 审核沟通</div>
          <div class="review-actions" id="reviewActions">
            <button class="btn btn-default" onclick="openMatchDrawer()"><i class="fa fa-external-link-alt"></i> 下载</button>
            <button class="btn btn-default" onclick="openMatchDrawer()"><i class="fa fa-external-link-alt"></i> 匹配详情</button>
            <button class="btn btn-default remark-btn" onclick="openRemark()">
              <i class="fa fa-pencil-square-o"></i> 我的批注
              <span class="remark-count" id="remarkCount">3</span>
            </button>
            <button class="btn btn-primary" onclick="openChat()"><i class="fa fa-comments"></i> 沟通</button>
          </div>
        </div>`;
  c = replaceOnce(c, t2old, t2new, '左列注入stage-nav+review-actions', name);
  if (c === null) return;

  // 4) 移除左列 chat-panel 内的 chat-footer（输入区将移入右侧 rightChat）
  const t3old = `            <div class="chat-footer">
              <div class="chat-toolbar">
                <button class="btn btn-default btn-sm" onclick="onUpload()"><i class="fa fa-paperclip"></i> 上传附件</button>
                <button class="btn btn-default btn-sm" onclick="toggleRemind()"><i class="fa fa-bell"></i> 提醒人员</button>
                <div class="chat-hint" style="margin-left:auto;"><i class="fa fa-info-circle"></i> 如需提醒相关人员，请先点击「提醒人员」添加后再发送。</div>
                <input type="file" id="fileInput" style="display:none" multiple onchange="onFileChosen(this)" />
              </div>
              <div class="pending-files hidden" id="pendingFiles"></div>
              <div class="mention-chips hidden" id="mentionChips"></div>
              <div class="chat-input-row">
                <textarea class="chat-input" id="chatInput" placeholder="请输入批注" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMsg();}"></textarea>
                <button class="btn btn-primary chat-send" onclick="sendMsg()">发送</button>
              </div>
            </div>`;
  c = replaceOnce(c, t3old, ``, '移除左列chat-footer', name);
  if (c === null) return;

  // 5) right-stack 开头：加收起把手 + right-stack-inner + rightInfo
  const t4old = `      <!-- 右：审核流程 + 操作日志 -->
      <div class="right-stack">
        <!-- 右上：审核流程展示 -->
        <div class="col">`;
  const t4new = `      <!-- 右：审核流程 + 操作日志 -->
      <div class="right-drawer-handle" id="rightHandle" onclick="toggleRightDrawer()" title="收起 / 展开右侧"><i class="fa fa-chevron-right"></i></div>
      <div class="right-stack" id="rightStack">
        <div class="right-stack-inner">
          <div id="rightInfo">
        <!-- 右上：审核流程展示 -->
        <div class="col">`;
  c = replaceOnce(c, t4old, t4new, 'right-stack开头+rightInfo', name);
  if (c === null) return;

  // 6) 在 审核链路 col 之前插入 rightInfo 收尾 + rightChat + rightRemark + rightLink 开头
  const t5old = `        <div class="col oplog">`;
  const t5new = `          </div>
${rightChatHtml}
${rightRemarkHtml}
          <div id="rightLink">
        <div class="col oplog">`;
  // 仅替换第一次出现的 col oplog（即审核链路）
  const idx5 = c.indexOf(t5old);
  if (idx5 === -1) { console.error('  [FAIL] 未找到 <div class="col oplog">'); return; }
  c = c.slice(0, idx5) + t5new + c.slice(idx5 + t5old.length);

  // 7) right-stack 结尾：关闭 rightLink + right-stack-inner
  const t7old = `        </div>
      </div>
    </div>
  </div>`;
  const t7new = `        </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  c = replaceOnce(c, t7old, t7new, 'right-stack结尾+rightLink/inner收尾', name);
  if (c === null) return;

  // 8) 注入 matchDrawer
  if (c.indexOf('id="matchDrawer"') === -1) {
    c = c.replace('</body>', matchDrawerHtml + '\n</body>');
  }

  // 9) 追加补齐 JS
  if (c.indexOf('function showRightMode(') === -1) {
    c = c.replace('</script>', appendedJs + '\n  </script>');
  }

  fs.writeFileSync(file, c, 'utf8');
  console.log('  [OK] 完成');
});

console.log('全部处理结束');
