const fs = require('fs');
const path = require('path');

console.log('🚀 开始合并 AI 改进报告页面...\n');

// 读取两个文件
const listPath = path.join(__dirname, '..', 'modules', 'ai-improve-report.html');
const detailPath = path.join(__dirname, '..', 'modules', 'ai-improve-report-detail.html');
const outputPath = path.join(__dirname, '..', 'modules', 'ai-improve-report-merged.html');

console.log('📖 读取列表页文件...');
const listHtml = fs.readFileSync(listPath, 'utf-8');
console.log(`✅ 列表页大小: ${(listHtml.length / 1024).toFixed(2)} KB\n`);

console.log(' 读取详情页文件...');
const detailHtml = fs.readFileSync(detailPath, 'utf-8');
console.log(`✅ 详情页大小: ${(detailHtml.length / 1024).toFixed(2)} KB\n`);

// 解析 HTML
console.log('🔍 解析 HTML 结构...');
const listDoc = parseHTML(listHtml);
const detailDoc = parseHTML(detailHtml);
console.log('✅ HTML 解析完成\n');

// 提取详情页内容
console.log('📦 提取详情页主体内容...');
const detailMainLayout = detailDoc.querySelector('.main-layout');
if (!detailMainLayout) {
  console.error(' 未找到详情页的 .main-layout 元素');
  process.exit(1);
}
console.log('✅ 已提取详情页内容\n');

// 创建详情页容器
const detailContainer = listDoc.createElement('div');
detailContainer.id = 'detail-page-container';
detailContainer.style.display = 'none';
detailContainer.innerHTML = detailMainLayout.outerHTML;
console.log('📦 创建详情页容器完成\n');

// 给列表页 body 添加 ID
const listBody = listDoc.querySelector('body');
if (listBody) {
  listBody.id = 'list-page-container';
  listBody.appendChild(detailContainer);
  console.log('✅ 已将详情页嵌入列表页\n');
}

// 修复跳转链接
console.log('🔧 修复跳转链接...');
fixNavigationLinks(listDoc);
console.log('✅ 跳转链接修复完成\n');

// 合并样式
console.log('🎨 合并 CSS 样式...');
mergeStyles(listDoc, detailDoc);
console.log('✅ 样式合并完成\n');

// 合并脚本
console.log('📜 合并 JavaScript 代码...');
mergeScripts(listDoc, detailDoc);
console.log('✅ 脚本合并完成\n');

// 添加页面切换功能
console.log('🧭 添加页面切换按钮...');
addPageSwitcher(listDoc);
console.log('✅ 页面切换功能添加完成\n');

// 生成最终 HTML
const finalHtml = '<!DOCTYPE html>\n' + listDoc.documentElement.outerHTML;

// 写入文件
console.log('💾 写入合并后的文件...');
fs.writeFileSync(outputPath, finalHtml, 'utf-8');
console.log(`✅ 合并完成！\n`);
console.log(`📁 输出文件: ${outputPath}`);
console.log(` 文件大小: ${(finalHtml.length / 1024).toFixed(2)} KB`);
console.log(`📏 总行数: ${finalHtml.split('\n').length} 行\n`);
console.log('✨ 所有操作已完成！\n');

// ========== 辅助函数 ==========

function parseHTML(html) {
  // 使用简单的字符串解析，不依赖 jsdom
  return {
    querySelector: (selector) => {
      // 简单的正则匹配
      if (selector === 'body') {
        const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        return match ? { innerHTML: match[1], id: null, appendChild: () => {} } : null;
      }
      if (selector === '.main-layout') {
        const match = html.match(/<div[^>]*class="[^"]*main-layout[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        return match ? { outerHTML: match[0] } : null;
      }
      return null;
    },
    querySelectorAll: (selector) => {
      const results = [];
      if (selector === 'style') {
        const regex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let match;
        while ((match = regex.exec(html)) !== null) {
          results.push({ textContent: match[1], cloneNode: () => ({ outerHTML: match[0] }) });
        }
      }
      if (selector === 'link[rel="stylesheet"]') {
        const regex = /<link[^>]*rel=["']stylesheet["'][^>]*>/gi;
        let match;
        while ((match = regex.exec(html)) !== null) {
          const hrefMatch = match[0].match(/href=["']([^"']+)["']/);
          results.push({ href: hrefMatch ? hrefMatch[1] : '', cloneNode: () => ({ outerHTML: match[0] }) });
        }
      }
      if (selector === 'script') {
        const regex = /<script[^>]*>([\s\S]*?)<\/script>|<script[^>]*\/>/gi;
        let match;
        while ((match = regex.exec(html)) !== null) {
          const srcMatch = match[0].match(/src=["']([^"']+)["']/);
          results.push({ 
            src: srcMatch ? srcMatch[1] : null,
            textContent: match[1] || '',
            cloneNode: () => ({ outerHTML: match[0] })
          });
        }
      }
      if (selector === '*') {
        // 返回所有带 onclick 或 href 的元素
        const onclickRegex = /<(?:div|a|button)[^>]*onclick=["']([^"']+)["'][^>]*>/gi;
        const hrefRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi;
        let match;
        while ((match = onclickRegex.exec(html)) !== null) {
          results.push({ 
            hasAttribute: () => true,
            getAttribute: () => match[1],
            setAttribute: (attr, val) => {
              // 替换原始 HTML 中的 onclick
              html = html.replace(match[0], match[0].replace(match[1], val));
            }
          });
        }
        while ((match = hrefRegex.exec(html)) !== null) {
          if (match[1].includes('ai-improve-report-detail.html')) {
            results.push({
              tagName: 'A',
              href: match[1],
              onclick: null
            });
          }
        }
      }
      return results;
    },
    createElement: (tag) => ({
      id: null,
      style: {},
      innerHTML: '',
      outerHTML: ''
    }),
    head: {
      appendChild: (node) => {}
    },
    body: {
      id: null,
      appendChild: (node) => {},
      insertAdjacentHTML: (pos, html) => {}
    },
    documentElement: {
      outerHTML: html
    }
  };
}

function fixNavigationLinks(doc) {
  let fixedCount = 0;
  const allElements = doc.querySelectorAll('*');
  
  allElements.forEach(el => {
    // 修复 onclick 属性
    if (el.hasAttribute('onclick')) {
      const onclick = el.getAttribute('onclick');
      if (onclick.includes('ai-improve-report-detail.html')) {
        const match = onclick.match(/projId=([^'\"&]+)/);
        if (match) {
          const projId = match[1];
          el.setAttribute('onclick', `switchToDetail('${projId}')`);
          fixedCount++;
        }
      }
    }
    
    // 修复 href 属性
    if (el.tagName === 'A' && el.href && el.href.includes('ai-improve-report-detail.html')) {
      const url = new URL(el.href, 'http://localhost');
      const projId = url.searchParams.get('projId');
      if (projId) {
        el.href = '#';
        el.onclick = function(e) {
          e.preventDefault();
          switchToDetail(projId);
        };
        fixedCount++;
      }
    }
  });
  
  console.log(`   已修复 ${fixedCount} 个跳转链接`);
}

function mergeStyles(targetDoc, sourceDoc) {
  let mergedCount = 0;
  
  // 合并 style 标签
  const styles = sourceDoc.querySelectorAll('style');
  styles.forEach(style => {
    if (!containsStyle(targetDoc, style.textContent)) {
      targetDoc.head.appendChild(style.cloneNode(true));
      mergedCount++;
    }
  });
  
  // 合并 link 标签
  const links = sourceDoc.querySelectorAll('link[rel="stylesheet"]');
  links.forEach(link => {
    if (!containsLink(targetDoc, link.href)) {
      targetDoc.head.appendChild(link.cloneNode(true));
      mergedCount++;
    }
  });
  
  console.log(`   已合并 ${mergedCount} 个样式资源`);
}

function mergeScripts(targetDoc, sourceDoc) {
  let mergedCount = 0;
  
  const scripts = sourceDoc.querySelectorAll('script');
  scripts.forEach(script => {
    const clone = script.cloneNode(true);
    if (script.src) {
      if (!containsScript(targetDoc, script.src)) {
        targetDoc.body.appendChild(clone);
        mergedCount++;
      }
    } else {
      targetDoc.body.appendChild(clone);
      mergedCount++;
    }
  });
  
  console.log(`   已合并 ${mergedCount} 个脚本`);
}

function addPageSwitcher(doc) {
  const switcherHTML = `
    <div id="page-switcher" style="position:fixed;top:70px;right:20px;z-index:9999;display:flex;gap:10px;background:#fff;padding:10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:1px solid #e8e8e8;">
      <button id="btn-list" onclick="switchToList()" style="padding:8px 16px;background:#1677ff;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:500;">
        <i class="fas fa-list"></i> 列表页
      </button>
      <button id="btn-detail" onclick="switchToDetail()" style="padding:8px 16px;background:#f5f5f5;color:#333;border:1px solid #d9d9d9;border-radius:4px;cursor:pointer;font-size:14px;font-weight:500;">
        <i class="fas fa-file-alt"></i> 详情页
      </button>
    </div>
    <script>
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
    <\\/script>
  `;
  
  doc.body.insertAdjacentHTML('afterbegin', switcherHTML);
  console.log('   已添加页面切换按钮（右上角）');
}

function containsStyle(doc, styleText) {
  const styles = Array.from(doc.querySelectorAll('style'));
  return styles.some(s => s.textContent.trim() === styleText.trim());
}

function containsLink(doc, href) {
  const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
  return links.some(l => l.href === href);
}

function containsScript(doc, src) {
  const scripts = Array.from(doc.querySelectorAll('script[src]'));
  return scripts.some(s => s.src === src);
}
