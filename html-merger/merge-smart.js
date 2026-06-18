const fs = require('fs');
const path = require('path');

console.log('🚀 开始智能合并 AI 改进报告页面...\n');

// 读取两个文件
const listPath = path.join(__dirname, '..', 'modules', 'ai-improve-report.html');
const detailPath = path.join(__dirname, '..', 'modules', 'ai-improve-report-detail.html');
const outputPath = path.join(__dirname, '..', 'modules', 'ai-improve-report-merged-v2.html');

console.log('📖 读取文件...');
let listHtml = fs.readFileSync(listPath, 'utf-8');
let detailHtml = fs.readFileSync(detailPath, 'utf-8');
console.log(`✅ 列表页: ${(listHtml.length / 1024).toFixed(2)} KB`);
console.log(`✅ 详情页: ${(detailHtml.length / 1024).toFixed(2)} KB\n`);

// ========== 步骤1: 提取详情页的 main-layout 内容 ==========
console.log('📦 提取详情页内容...');
const startIndex = detailHtml.indexOf('<div class="main-layout">');
if (startIndex === -1) {
  console.error('❌ 未找到详情页的 .main-layout');
  process.exit(1);
}
const detailContent = detailHtml.substring(startIndex);
console.log('✅ 已提取详情页内容\n');

// ========== 步骤2: 从列表页中提取 <head> 内容 ==========
console.log('🎨 提取列表页 <head>...');
const listHeadMatch = listHtml.match(/<head[^>]*>([\s\S]*)<\/head>/i);
if (!listHeadMatch) {
  console.error('❌ 未找到列表页的 <head>');
  process.exit(1);
}
let headContent = listHeadMatch[1];
console.log('✅ 已提取列表页 <head>\n');

// ========== 步骤3: 从详情页提取 <style> 并合并到 <head> ==========
console.log('🎨 合并详情页样式...');
const styleMatches = [...detailHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
let mergedStyleCount = 0;
for (const match of styleMatches) {
  const styleContent = match[0];
  // 检查是否已存在（简单去重）
  if (!headContent.includes(styleContent.substring(0, 50))) {
    headContent += '\n' + styleContent;
    mergedStyleCount++;
  }
}
console.log(`✅ 已合并 ${mergedStyleCount} 个样式块\n`);

// ========== 步骤4: 从列表页提取 </head> 之前的所有内容 ==========
const beforeHeadEnd = listHtml.indexOf('</head>');
const afterBodyStart = listHtml.indexOf('<body') + listHtml.match(/<body[^>]*>/)[0].length;
const beforeBodyContent = listHtml.substring(0, beforeHeadEnd);
const bodyAttrs = listHtml.match(/<body([^>]*)>/)[1] || '';

// ========== 步骤5: 从列表页提取 </body> 之前的内容 ==========
const beforeBodyEnd = listHtml.lastIndexOf('</body>');
const listBodyContent = listHtml.substring(afterBodyStart, beforeBodyEnd);

// ========== 步骤6: 修复列表页中的跳转链接 ==========
console.log('🔧 修复跳转链接...');
let fixedListBody = listBodyContent.replace(
  /onclick="window\.location\.href=['"]ai-improve-report-detail\.html\?projId=([^'"]+)['"]/g,
  'onclick="switchToDetail(\'$1\')"'
);
fixedListBody = fixedListBody.replace(
  /onclick="viewAIReportDetail\(['"]([^'"]+)['"]\)"/g,
  'onclick="switchToDetail(\'$1\')"'
);
console.log('✅ 跳转链接已修复\n');

// ========== 步骤7: 创建详情页容器 ==========
const detailContainer = `
<!-- ========== 详情页容器（默认隐藏） ========== -->
<div id="detail-page-container" style="display:none;position:relative;width:100%;height:calc(100vh - 56px);overflow:hidden">
${detailContent}
</div>
`;

// ========== 步骤8: 提取详情页的 <script> 内容（排除 initPage）==========
console.log('📜 提取详情页脚本...');
const scriptMatches = [...detailHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
let detailScripts = '';
let scriptCount = 0;
for (const match of scriptMatches) {
  const scriptContent = match[1];
  // 跳过包含 initPage 定义的脚本
  if (!scriptContent.includes('function initPage')) {
    detailScripts += '\n' + match[0];
    scriptCount++;
  }
}
console.log(`✅ 已提取 ${scriptCount} 个脚本块\n`);

// ========== 步骤9: 添加页面切换功能 ==========
const pageSwitcherScript = `
<!-- ========== 页面切换功能 ========== -->
<script>
// 全局变量：跟踪当前页面
let currentPage = 'list';

// 切换到列表页
function switchToList() {
  console.log('切换到列表页');
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
  currentPage = 'list';
}

// 切换到详情页
function switchToDetail(projId) {
  console.log('切换到详情页，项目ID:', projId);
  const listPage = document.getElementById('list-page-container');
  const detailPage = document.getElementById('detail-page-container');
  const btnList = document.getElementById('btn-list');
  const btnDetail = document.getElementById('btn-detail');
  
  if (listPage) listPage.style.display = 'none';
  if (detailPage) {
    detailPage.style.display = 'block';
    console.log('✅ 详情页容器已显示');
  } else {
    console.error('❌ 未找到详情页容器');
    return;
  }
  if (btnList) {
    btnList.style.background = '#f5f5f5';
    btnList.style.color = '#333';
  }
  if (btnDetail) {
    btnDetail.style.background = '#1677ff';
    btnDetail.style.color = '#fff';
  }
  currentPage = 'detail';
  
  // 如果有传入 projId，初始化详情页数据
  if (projId) {
    setTimeout(() => {
      try {
        // 临时设置 URL 参数
        const originalSearch = window.location.search;
        window.history.replaceState({}, '', '?projId=' + projId);
        
        // 调用详情页的 initPage
        if (typeof initPage === 'function') {
          console.log('🔄 调用 initPage...');
          initPage();
          console.log('✅ initPage 执行成功');
        } else {
          console.warn('⚠️ initPage 函数不存在');
        }
        
        // 恢复原始 URL
        window.history.replaceState({}, '', originalSearch);
      } catch (e) {
        console.error('❌ 初始化详情页失败:', e);
      }
    }, 100);
  }
}

// 页面加载完成后默认显示列表页
document.addEventListener('DOMContentLoaded', function() {
  console.log(' DOM 加载完成，默认显示列表页');
  switchToList();
});
</script>
`;

// ========== 步骤10: 组装最终 HTML ==========
console.log(' 组装最终 HTML...');

let finalHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI改进分析报告（合并版）</title>
${headContent}
</head>
<body${bodyAttrs}>

<!-- ========== 页面切换按钮 ========== -->
<div id="page-switcher" style="position:fixed;top:70px;right:20px;z-index:9999;display:flex;gap:10px;background:#fff;padding:10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:1px solid #e8e8e8;">
  <button id="btn-list" onclick="switchToList()" style="padding:8px 16px;background:#1677ff;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:500;">
    <i class="fas fa-list"></i> 列表页
  </button>
  <button id="btn-detail" onclick="switchToDetail()" style="padding:8px 16px;background:#f5f5f5;color:#333;border:1px solid #d9d9d9;border-radius:4px;cursor:pointer;font-size:14px;font-weight:500;">
    <i class="fas fa-file-alt"></i> 详情页
  </button>
</div>

<!-- ========== 列表页容器 ========== -->
<div id="list-page-container">
${fixedListBody}
</div>

${detailContainer}

${detailScripts}

${pageSwitcherScript}

</body>
</html>`;

// ========== 步骤11: 写入文件 ==========
console.log('💾 写入文件...');
fs.writeFileSync(outputPath, finalHtml, 'utf-8');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✨ 合并完成！');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📁 输出文件: ${outputPath}`);
console.log(`📊 文件大小: ${(finalHtml.length / 1024).toFixed(2)} KB`);
console.log(`📏 总行数: ${finalHtml.split('\n').length} 行`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('🎯 现在可以打开文件测试了！\n');
