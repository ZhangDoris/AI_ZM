// 最小 DOM 模拟，验证 openHandover 执行路径是否有异常
const fs = require('fs');
const h = fs.readFileSync('d:/艾迪研/智能预筛项目/原型/modules/研究中心改造/member-directory.html', 'utf8');

// 提取所有 function 定义名，确认 openHandover 存在且完整
const openFn = h.match(/function openHandover\(id\) \{[\s\S]*?\n    \}/);
console.log('openHandover found:', !!openFn);

// 检查 handoverModal 初始是否带 modal-hidden
const modalTag = h.match(/<div id="handoverModal"[^>]*>/);
console.log('handoverModal tag:', modalTag ? modalTag[0] : 'NOT FOUND');
console.log('has modal-hidden initially:', /<div id="handoverModal"[^>]*modal-hidden/.test(h));

// 检查 onclick 调用与函数名是否一致
const calls = h.match(/onclick="openHandover\([^)]*\)"/g) || [];
console.log('openHandover onclick count:', calls.length);
console.log('openHandover onclick samples:', calls.slice(0,3));

// 关键：openModal 定义
console.log('openModal defined:', h.includes('function openModal(id) {'));

// 检查是否存在重复的 handoverModal id
const ids = h.match(/id="handoverModal"/g) || [];
console.log('handoverModal id occurrences:', ids.length);

// 检查全局 modal-overlay click 监听：是否会在打开后立刻关闭
// 模拟点击停用 -> openHandover -> openModal(remove modal-hidden)
// 事件冒泡是否经过 handoverModal（作为 a 的祖先？）-> 不是，handoverModal 是 body 子元素，a 在 main 内
console.log('handoverModal is sibling of main (not ancestor of table):',
  /<main[\s\S]*?<\/main>[\s\S]*<div id="handoverModal"/.test(h));
