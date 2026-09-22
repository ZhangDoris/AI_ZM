
    function showToast(text) {
      var t = document.getElementById('toast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        t.className = 'toast';
        document.body.appendChild(t);
      }
      t.textContent = text;
      t.classList.add('show');
      setTimeout(function () { t.classList.remove('show'); }, 1600);
    }
    function onDownload() { showToast('开始下载审核记录'); }
    function openDetailPage() { window.open('操作明细.html', '_blank'); }
    function openDetail() { document.getElementById('detailMask').classList.remove('hidden'); }
    function closeDetail() { document.getElementById('detailMask').classList.add('hidden'); }
    function openMatchDrawer() { document.getElementById('matchDrawer').classList.remove('hidden'); }
    function closeMatchDrawer() { document.getElementById('matchDrawer').classList.add('hidden'); }
    function toggleRow(td) {
      var row = td.parentElement;
      var next = row.nextElementSibling;
      if (!next || !next.classList.contains('collapse-row')) return;
      var icon = td.querySelector('i');
      var hidden = next.classList.toggle('hidden');
      if (icon) icon.className = hidden ? 'fa fa-chevron-right' : 'fa fa-chevron-down';
    }
    var pendingFiles = [];
    var remindPersons = [
      { name: '张三', role: 'CRA', phone: '188****0005', selected: true },
      { name: '李四', role: 'CRC', phone: '182****0005', selected: true },
      { name: '测试医学', role: '医学经理', phone: '166****0012', selected: false }
    ];
    function onUpload() { document.getElementById('fileInput').click(); }
    function onFileChosen(input) {
      addFiles(input.files);
      input.value = '';
    }
    function addFiles(fileList) {
      Array.prototype.forEach.call(fileList, function (f) {
        pendingFiles.push(f.name);
      });
      renderPending();
    }
    /* 拖拽上传：从桌面把图片 / 文件拖到聊天输入区即可上传 */
    (function () {
      var box = document.getElementById('chatBox');
      if (!box) return;
      function hasFiles(e) {
        return e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') > -1;
      }
      ['dragenter', 'dragover'].forEach(function (ev) {
        box.addEventListener(ev, function (e) {
          if (!hasFiles(e)) return;
          e.preventDefault();
          box.classList.add('dragging');
        });
      });
      box.addEventListener('dragleave', function (e) {
        if (e.relatedTarget && box.contains(e.relatedTarget)) return;
        box.classList.remove('dragging');
      });
      box.addEventListener('drop', function (e) {
        if (!hasFiles(e)) return;
        e.preventDefault();
        box.classList.remove('dragging');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
          addFiles(e.dataTransfer.files);
        }
      });
      // 阻止把文件拖到页面其它位置时浏览器直接打开文件
      ['dragover', 'drop'].forEach(function (ev) {
        window.addEventListener(ev, function (e) {
          if (hasFiles(e) && !box.contains(e.target)) e.preventDefault();
        });
      });
    })();
    function renderPending() {
      var box = document.getElementById('pendingFiles');
      if (!pendingFiles.length) { box.classList.add('hidden'); box.innerHTML = ''; return; }
      box.classList.remove('hidden');
      box.innerHTML = pendingFiles.map(function (name, i) {
        return '<span class="pending-file"><i class="fa fa-file-o"></i>' + escapeHtml(name) +
          '<i class="fa fa-times pf-del" title="移除" onclick="removePending(' + i + ')"></i></span>';
      }).join('');
    }
    function removePending(i) { pendingFiles.splice(i, 1); renderPending(); }

    function toggleRemind() {
      openRemind();
    }
    function openRemind() {
      document.getElementById('remindMask').classList.remove('hidden');
      document.getElementById('rpList').classList.add('hidden');
      renderRemind();
    }
    function closeRemind() {
      document.getElementById('remindMask').classList.add('hidden');
      document.getElementById('rpList').classList.add('hidden');
    }
    function confirmRemind() {
      var sel = remindPersons.filter(function (p) { return p.selected; });
      if (!sel.length) { showToast('请至少选择一名提醒人员'); return; }
      closeRemind();
      showToast('已设置提醒人员，发送时将自动 @ 提醒');
    }
    function toggleRemindList() { document.getElementById('rpList').classList.toggle('hidden'); }
    function togglePerson(i) {
      remindPersons[i].selected = !remindPersons[i].selected;
      renderRemind();
    }
    function removeRemindRow(i) {
      remindPersons[i].selected = false;
      renderRemind();
    }
    function renderRemind() {
      var sel = remindPersons.filter(function (p) { return p.selected; });
      var box = document.getElementById('rpTagBox');
      if (!sel.length) {
        box.innerHTML = '<span class="rp-placeholder">请选择提醒人员</span>' +
          '<span class="rp-arrow"><i class="fa fa-caret-down"></i></span>';
      } else {
        box.innerHTML = sel.map(function (p) {
          var idx = remindPersons.indexOf(p);
          return '<span class="rp-tag">' + escapeHtml(p.name + ' - ' + p.role) +
            '<i class="fa fa-times-circle rp-tag-del" title="移除" onclick="event.stopPropagation();removeRemindRow(' + idx + ')"></i></span>';
        }).join('') + '<span class="rp-arrow"><i class="fa fa-caret-down"></i></span>';
      }
      document.querySelectorAll('#rpList .rp-option').forEach(function (op) {
        op.classList.toggle('selected', remindPersons[+op.getAttribute('data-idx')].selected);
      });
      renderMentionChips();
      var roles = [];
      if (document.getElementById('dnCRA').checked) roles.push('CRA');
      if (document.getElementById('dnCRC').checked) roles.push('CRC');
      document.getElementById('rpTipText').innerHTML =
        '默认选中：' + (roles.length ? roles.join(',') : '无') + '；若需修改默认，可自行修改默认通知。<br/>' +
        '提示：若需更改，可直接删除已选人员后重新添加。';
      var tbody = document.getElementById('rpTableBody');
      if (!sel.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="rp-empty">暂未选择提醒人员</td></tr>';
        return;
      }
      tbody.innerHTML = sel.map(function (p) {
        var idx = remindPersons.indexOf(p);
        return '<tr><td>' + (sel.indexOf(p) + 1) + '</td><td>' + escapeHtml(p.name) + '</td><td>' + p.role +
          '</td><td>' + p.phone + '</td><td><span class="rp-del" onclick="removeRemindRow(' + idx + ')">删除</span></td></tr>';
      }).join('');
    }
    function renderMentionChips() {
      var box = document.getElementById('mentionChips');
      if (!box) return;
      var sel = remindPersons.filter(function (p) { return p.selected; });
      if (!sel.length) { box.classList.add('hidden'); box.innerHTML = ''; return; }
      box.classList.remove('hidden');
      box.innerHTML = sel.map(function (p) {
        var idx = remindPersons.indexOf(p);
        return '<span class="mention-chip"><span class="mc-at"><i class="fa fa-at"></i></span>' +
          '<span class="mc-name">' + escapeHtml(p.name) + '</span>' +
          '<span class="mc-role">' + escapeHtml(p.role) + '</span>' +
          '<i class="fa fa-times mc-del" title="移除" onclick="removeMention(' + idx + ')"></i></span>';
      }).join('');
    }
    function removeMention(i) {
      remindPersons[i].selected = false;
      renderRemind();
    }
    function onDefaultNotifyChange() {
      var cra = document.getElementById('dnCRA').checked;
      var crc = document.getElementById('dnCRC').checked;
      remindPersons.forEach(function (p) {
        if (p.role === 'CRA') p.selected = cra;
        else if (p.role === 'CRC') p.selected = crc;
      });
      renderRemind();
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
      // 消息发送成功后，右侧切回「信息」模式（重新展示审核流程 / 审核链路）
      showRightMode('info');
      expandRightDrawer();
    }
    /* 输入框放大编辑（页面内浮层，不脱离当前页面） */
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
    /* 通用放大编辑：审批批注 / 批注 等 textarea */
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
    function appendSelfMsg(text, files, mentions) {
      var body = document.querySelector('.chat-panel .chat-body');
      if (!body) return;
      var mentionHtml = (mentions || []).map(function (p) {
        return '<span class="chat-mention">@' + escapeHtml(p.name) + '</span>';
      }).join('');
      var bubble = mentionHtml + escapeHtml(text);
      if (files && files.length) {
        bubble += '<div class="chat-files">' + files.map(function (name) {
          return '<div class="chat-file"><span class="chat-fname">' + escapeHtml(name) + '</span>' +
            '<button class="attach-btn" onclick="showToast(\'下载附件\')">下载</button>' +
            '<button class="attach-btn danger" onclick="showToast(\'删除附件\')">删除</button></div>';
        }).join('') + '</div>';
      }
      var msg = document.createElement('div');
      msg.className = 'chat-msg self';
      msg.innerHTML = '<div class="chat-avatar">刘</div>' +
        '<div class="chat-content"><div class="chat-meta">刘梅 · CRC专员 · ' + now() +
        '</div><div class="chat-bubble">' + bubble + '</div></div>';
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
    }
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
    /* 沟通：点「沟通」按钮打开右侧折叠面板（收缩审核流程 / 审核链路），与驳回 / 通过一致 */
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

    /* 我的批注：点「我的批注」按钮打开右侧折叠面板，类比驳回 / 通过 */
    var remarkTotal = 3;
    function refreshRemark() {
      var bc = document.getElementById('remarkCount');
      if (bc) bc.textContent = remarkTotal;
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

    /* 审核操作：驳回 / 通过 */
    var reviewType = '';
    var chatBoxWasHidden = true;
    function toggleReason(el) { el.classList.toggle('active'); }
    function openReview(type) {
      reviewType = type;
      document.getElementById('reviewActions').classList.add('hidden');
      document.getElementById('remarkPanel').classList.add('hidden');
      // 打开审核面板（驳回/通过）时，隐藏消息输入区
      var chatBox = document.getElementById('chatBox');
      chatBoxWasHidden = chatBox.classList.contains('hidden');
      chatBox.classList.add('hidden');
      // 右侧切换到「操作」模式并展开抽屉（审核表单在右侧显示）
      showRightMode('action');
      expandRightDrawer();
      var panel = document.getElementById('reviewPanel');
      panel.classList.remove('hidden');
      var title = document.getElementById('reviewPanelTitle');
      var confirmBtn = document.getElementById('reviewConfirm');
      if (type === 'reject') {
        title.textContent = '驳回审核';
        document.getElementById('rejectBlock').style.display = '';
        document.getElementById('approveBlock').style.display = 'none';
        confirmBtn.textContent = '确认驳回';
        confirmBtn.className = 'btn btn-primary';
      } else {
        title.textContent = '通过审核';
        document.getElementById('rejectBlock').style.display = 'none';
        document.getElementById('approveBlock').style.display = '';
        confirmBtn.textContent = '确认通过';
        confirmBtn.className = 'btn btn-primary';
      }
    }
    function closeReview() {
      // 右侧切回「信息」模式（展示审核流程 / 审核链路）
      showRightMode('info');
      document.getElementById('reviewActions').classList.remove('hidden');
      // 取消时恢复打开前的输入区状态
      if (!chatBoxWasHidden) document.getElementById('chatBox').classList.remove('hidden');
    }
    /* 右侧抽屉：信息 / 操作 / 沟通 / 批注 四种模式，互斥整块替换 */
    function showRightMode(mode) {
      var info = document.getElementById('rightInfo');
      var link = document.getElementById('rightLink');
      var action = document.getElementById('rightAction');
      var chat = document.getElementById('rightChat');
      var remark = document.getElementById('rightRemark');
      if (!info || !action || !chat) return;
      // 除「信息」模式外，其余模式均整块替换右侧：审核流程 / 审核链路隐藏，仅显示当前面板
      var isChat = mode === 'chat';
      var isRemark = mode === 'remark';
      var isAction = mode === 'action';
      var isOther = isChat || isRemark || isAction;
      info.classList.toggle('hidden', isOther);
      if (link) link.classList.toggle('hidden', isOther);
      action.classList.toggle('hidden', !isAction);
      chat.classList.toggle('hidden', !isChat);
      if (remark) remark.classList.toggle('hidden', !isRemark);
      // 非「信息」模式下，隐藏顶部审核操作按钮栏（与驳回 / 通过一致）
      var actions = document.getElementById('reviewActions');
      if (actions) actions.classList.toggle('hidden', mode !== 'info');
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
      handle.style.right = collapsed ? '12px' : '362px';
      handle.innerHTML = collapsed
        ? '<i class="fa fa-chevron-left"></i>'
        : '<i class="fa fa-chevron-right"></i>';
    }
    function toggleCountersign() {
      var yes = document.querySelector('input[name="countersign"]:checked').value === 'yes';
      document.getElementById('nextReviewerItem').style.display = yes ? '' : 'none';
    }
    function confirmReview() {
      if (reviewType === 'reject') {
        var reasons = Array.prototype.map.call(
          document.querySelectorAll('#rejectReasonTags .reason-tag.active'),
          function (el) { return el.textContent; }
        );
        if (!reasons.length) { showToast('请选择驳回原因'); return; }
        var comment = document.getElementById('reviewComment').value.trim();
        appendSysMsg('【驳回】原因：' + reasons.join('、') + (comment ? '；备注：' + comment : ''), 'reject');
        showToast('已提交驳回');
      } else {
        var comment = document.getElementById('approveComment').value.trim();
        if (!comment) { showToast('请输入审核批注'); return; }
        var yes = document.querySelector('input[name="countersign"]:checked').value === 'yes';
        var next = '';
        if (yes) {
          next = document.getElementById('nextReviewer').value;
          if (!next) { showToast('请选择下一个审核人'); return; }
        }
        appendSysMsg('【通过】批注：' + comment + (yes ? '；加签至 ' + next : '；不加签'), 'approve');
        showToast('已通过审核' + (yes ? '并加签' : ''));
      }
      document.querySelectorAll('#rejectReasonTags .reason-tag.active').forEach(function (el) {
        el.classList.remove('active');
      });
      document.getElementById('reviewComment').value = '';
      document.getElementById('approveComment').value = '';
      document.querySelector('input[name="countersign"][value="no"]').checked = true;
      document.getElementById('nextReviewerItem').style.display = 'none';
      document.getElementById('nextReviewer').value = '';
      // 提交后不再恢复输入区
      chatBoxWasHidden = true;
      closeReview();
    }
    function appendSysMsg(text, kind) {
      var body = document.querySelector('.chat-panel .chat-body');
      if (!body) return;
      var cls = kind === 'reject' ? 'chat-sys reject' : (kind === 'approve' ? 'chat-sys approve' : 'chat-sys');
      var msg = document.createElement('div');
      msg.className = cls;
      msg.innerHTML = '【' + now() + '】 ' + escapeHtml(text);
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
    }

    function switchTab(el) {
      var sw = el.parentElement;
      sw.querySelectorAll('.tab-item').forEach(function (i) {
        i.classList.toggle('active', i === el);
      });
      var col = el.closest('.col');
      var tab = el.getAttribute('data-tab');
      col.querySelectorAll('.tab-view').forEach(function (v) {
        v.classList.toggle('hidden', v.getAttribute('data-tab') !== tab);
      });
    }
    function switchStage(el) {
      var sw = el.parentElement;
      sw.querySelectorAll('.stage-tab').forEach(function (i) {
        i.classList.toggle('active', i === el);
      });
      var group = el.getAttribute('data-group');
      document.querySelectorAll('.group-view, .audit-notice[data-group]').forEach(function (v) {
        v.classList.toggle('hidden', v.getAttribute('data-group') !== group);
      });
    }

    renderMentionChips();
    refreshRemark();
    updateRightHandle();
  