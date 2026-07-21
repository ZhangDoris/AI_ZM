const http = require('http'), fs = require('fs'), path = require('path');
const root = 'd:/艾迪研/智能预筛项目/原型/modules/患者状态配置';
http.createServer((req, res) => {
  let url = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  let fp = path.join(root, url);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(fp);
    const ct = { html: 'text/html', js: 'text/javascript', css: 'text/css' }[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
}).listen(8123, () => console.log('Server running on http://localhost:8123'));
