const fs = require('fs');
const path = require('path');

console.log(' 开始合并 AI 改进报告页面...\n');

// 读取两个文件
const listPath = path.join(__dirname, '..', 'modules', 'ai-improve-report.html');
const detailPath = path.join(__dirname, '..', 'modules', 'ai-improve-report-detail.html');
const outputPath = path.join(__dirname, '..', 'modules', 'ai-improve-report-merged.html');

console.log('📖 读取列表页文件...');
let listHtml = fs.readFileSync(listPath, 'utf-8');
console.log(`✅ 列表页大小: ${(listHtml.length / 1024).toFixed(2)} KB\n`);

console.log(' 读取详情页文件...');
const detailHtml = fs.readFileSync(detailPath, 'utf-8');
console.log(`✅ 详情页大小: ${(detailHtml.length / 1024).toFixed(2)} KB\n`);

// 提取详情页的 .main-layout 内容
console.log(' 提取详情页主体内容...');
// 使用更宽松的匹配方式
const startIndex = detailHtml.indexOf('<div class="main-layout">');

if (startIndex === -1) {
  console.error('❌ 未找到详情页的 .main-layout 元素');
  process.exit(1);
}

// 从 main-layout 开始到文件末尾
const detailContent = detailHtml.substring(startIndex);
console.log('✅ 已提取详情页内容\n');

// 创建详情页容器 HTML
const detailContainerHTML = `
<!-- ========== 详情页容器（默认隐藏） ========== -->
<div id="detail-page-container" style="display:none">
${detailContent}
</div>
`;

// 在列表页 </body> 前插入详情页容器
console.log('🔗 嵌入详情页到列表页...');
listHtml = listHtml.replace('</body>', detailContainerHTML + '</body>');
console.log('✅ 详情页已嵌入\n');

// 给列表页 body 添加 ID
console.log('️ 添加页面标识...');
listHtml = listHtml.replace('<body', '<body id="list-page-container"');
console.log('✅ 已添加列表页标识\n');

// 修复跳转链接：将 window.location.href 改为 switchToDetail
console.log(' 修复跳转链接...');
let fixedCount = 0;

// 修复 onclick 中的跳转
listHtml = listHtml.replace(/onclick="window\.location\.href=['"]ai-improve-report-detail\.html\?projId=([^'"]+)['"]/g, (match, projId) => {
  fixedCount++;
  return `onclick="switchToDetail('${projId}')"`;
});

// 修复 viewAIReportDetail 函数调用
listHtml = listHtml.replace(/onclick="viewAIReportDetail\(['"]([^'"]+)['"]\)"/g, (match, projId) => {
  fixedCount++;
  return `onclick="switchToDetail('${projId}')"`;
});

console.log(`✅ 已修复 ${fixedCount} 个跳转链接\n`);

// 提取详情页的所有 <style> 标签
console.log('🎨 提取详情页样式...');
const styleMatches = detailHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
let styleCount = 0;
let stylesToAdd = '';
for (const match of styleMatches) {
  stylesToAdd += match[0] + '\n';
  styleCount++;
}
console.log(`✅ 已提取 ${styleCount} 个样式块\n`);

// 提取详情页的所有 <script> 标签（除了最后的 </script>）
console.log('📜 提取详情页脚本...');
const scriptMatches = detailHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
let scriptCount = 0;
let scriptsToAdd = '';
for (const match of scriptMatches) {
  // 跳过包含 initPage 定义的脚本（已经在列表页中）
  if (!match[0].includes('function initPage')) {
    scriptsToAdd += match[0] + '\n';
    scriptCount++;
  }
}
console.log(`✅ 已提取 ${scriptCount} 个脚本块\n`);

// 在列表页 </head> 前插入详情页的样式
console.log('🎨 合并样式...');
listHtml = listHtml.replace('</head>', stylesToAdd + '</head>');
console.log('✅ 样式已合并\n');

// 在列表页 </body> 前插入详情页的脚本
console.log('📜 合并脚本...');
listHtml = listHtml.replace('</body>', scriptsToAdd + '</body>');
console.log('✅ 脚本已合并\n');

// 添加页面切换功能
console.log('🧭 添加页面切换按钮...');
const pageSwitcherHTML = `
<!-- ========== 页面切换按钮 ========== -->
<div id="page-switcher" style="position:fixed;top:70px;right:20px;z-index:9999;display:flex;gap:10px;background:#fff;padding:10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:1px solid #e8e8e8;">
  <button id="btn-list" onclick="switchToList()" style="padding:8px 16px;background:#1677ff;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:500;">
    <i class="fas fa-list"></i> 列表页
  </button>
  <button id="btn-detail" onclick="switchToDetail()" style="padding:8px 16px;background:#f5f5f5;color:#333;border:1px solid #d9d9d9;border-radius:4px;cursor:pointer;font-size:14px;font-weight:500;">
    <i class="fas fa-file-alt"></i> 详情页
  </button>
</div>

<script>
// ========== 页面切换功能 ==========
function switchToList() {
  const listPage = document.getElementById('list-page-container');
  const detailPage = document.getElementById('detail-page-container');
  const btnList = document.getElementById('btn-list');
  const btnDetail = document.getElementById('btn-detail');
  
  if (listPage) listPage.style.display = 'block';
  if (detailPage) detailPage.style.display = 'none';
  if (btnList) {
    btnList.style.background = '#1677ff';
    btnList.style.color = '#fff';
  }
  if (btnDetail) {
    btnDetail.style.background = '#f5f5f5';
    btnDetail.style.color = '#333';
  }
}

function switchToDetail(projId) {
  const listPage = document.getElementById('list-page-container');
  const detailPage = document.getElementById('detail-page-container');
  const btnList = document.getElementById('btn-list');
  const btnDetail = document.getElementById('btn-detail');
  
  if (listPage) listPage.style.display = 'none';
  if (detailPage) detailPage.style.display = 'block';
  if (btnList) {
    btnList.style.background = '#f5f5f5';
    btnList.style.color = '#333';
  }
  if (btnDetail) {
    btnDetail.style.background = '#1677ff';
    btnDetail.style.color = '#fff';
  }
  
  // 如果有传入 projId，初始化详情页数据
  if (projId) {
    console.log('切换到详情页，项目ID:', projId);
    // 模拟 URL 参数并调用 initPage
    setTimeout(() => {
      const originalSearch = window.location.search;
      window.history.replaceState({}, '', '?projId=' + projId);
      if (typeof initPage === 'function') {
        initPage();
      }
      window.history.replaceState({}, '', originalSearch);
    }, 100);
  }
}

// 默认显示列表页
document.addEventListener('DOMContentLoaded', function() {
  switchToList();
});
</script>
`;

listHtml = listHtml.replace('</body>', pageSwitcherHTML + '</body>');
console.log('✅ 页面切换功能已添加\n');

// 写入合并后的文件
console.log('💾 写入合并后的文件...');
fs.writeFileSync(outputPath, listHtml, 'utf-8');
console.log('✅ 合并完成！\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📁 输出文件: ${outputPath}`);
console.log(`📊 文件大小: ${(listHtml.length / 1024).toFixed(2)} KB`);
console.log(`📏 总行数: ${listHtml.split('\n').length} 行`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('✨ 所有操作已完成！可以直接打开使用。\n');
