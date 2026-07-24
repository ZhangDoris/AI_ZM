// 页面版本配置 - 轻量后端（JSON 文件即数据库）
// 启动：node db-server.js  ->  http://localhost:8099
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = 'd:/艾迪研/智能预筛项目/原型/modules/phase';
const DB = 'd:/艾迪研/智能预筛项目/原型/page-version-db.json';

const mime = {
  '.html': 'text/html;charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json;charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

// 读取「数据库」
function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); }
  catch (e) { return { projects: {} }; }
}
// 写入「数据库」
function saveDB(d) {
  try { fs.writeFileSync(DB, JSON.stringify(d, null, 2)); return true; }
  catch (e) { console.error('saveDB error', e); return false; }
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];

  // ---- 页面版本配置 API ----
  if (urlPath === '/api/pv') {
    // 查询
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': mime['.json'] });
      res.end(JSON.stringify(loadDB()));
      return;
    }
    // 保存（按项目保存配置列表）
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try {
          const p = JSON.parse(body || '{}');
          const db = loadDB();
          if (!db.projects) db.projects = {};
          if (p.key && Array.isArray(p.list)) {
            db.projects[p.key] = { list: p.list };
          }
          const ok = saveDB(db);
          res.writeHead(ok ? 200 : 500, { 'Content-Type': mime['.json'] });
          res.end(JSON.stringify({ ok, db }));
        } catch (e) {
          res.writeHead(500, { 'Content-Type': mime['.json'] });
          res.end(JSON.stringify({ ok: false, error: String(e) }));
        }
      });
      return;
    }
    res.writeHead(405); res.end('Method Not Allowed');
    return;
  }

  // ---- 静态文件 ----
  let u = urlPath === '/' ? '/index.html' : urlPath;
  const fp = path.join(ROOT, u);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(fp);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(8099, () => console.log('PV DB server running at http://localhost:8099'));
