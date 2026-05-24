const fs = require('fs');
const path = require('path');
const postsDir = path.join(__dirname, 'posts');
const publicDir = path.join(__dirname, 'public');
const baseUrl = 'https://caishen-ai.github.io/caishen-blog';

const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md')).sort().reverse();
const articles = files.map(f => {
  const raw = fs.readFileSync(path.join(postsDir, f), 'utf8');
  const titleMatch = raw.match(/^title:\s*(.+)$/m);
  const dateMatch = raw.match(/^date:\s*(\d{4}-\d{2}-\d{2})$/m);
  const descMatch = raw.match(/^description:\s*(.+)$/m);
  return {
    file: f.replace('.md', '.html'),
    title: titleMatch ? titleMatch[1] : f.replace('.md', ''),
    date: dateMatch ? dateMatch[1] : '2026-05-22',
    desc: descMatch ? descMatch[1] : ''
  };
});

// RSS
const rssItems = articles.slice(0, 50).map(a =>
  '    <item>\n      <title>' + a.title + '</title>\n      <link>' + baseUrl + '/' + a.file + '</link>\n      <guid>' + baseUrl + '/' + a.file + '</guid>\n      <pubDate>' + new Date(a.date).toUTCString() + '</pubDate>\n      <description><![CDATA[' + a.desc + ']]></description>\n    </item>'
).join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AI赚钱实操指南</title>
    <link>${baseUrl}</link>
    <description>用AI工具赚钱的实操教程和工具推荐</description>
    <language>zh-CN</language>
${rssItems}
  </channel>
</rss>`;

fs.writeFileSync(path.join(publicDir, 'rss.xml'), rss, 'utf8');
console.log('RSS: ' + articles.slice(0,50).length + ' items');

// baidu-urls.txt
const baiduUrls = articles.map(a => baseUrl + '/' + a.file).join('\n');
fs.writeFileSync(path.join(publicDir, 'baidu-urls.txt'), baiduUrls, 'utf8');
console.log('baidu-urls.txt: ' + articles.length + ' URLs');

// Pagination
const PER_PAGE = 25;
const totalPages = Math.ceil(articles.length / PER_PAGE);

const indexTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'index.html'), 'utf8');

for (let page = 1; page <= totalPages; page++) {
  const start = (page - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const pageArticles = articles.slice(start, end);

  const articleListHtml = pageArticles.map(a =>
    '<article class="post-card">\n      <h2><a href="' + a.file + '">' + a.title + '</a></h2>\n      <time>' + a.date + '</time>\n      <p><a href="' + a.file + '">阅读全文 →</a></p>\n    </article>'
  ).join('\n');

  let pagNav = '<div class="pagination">';
  if (page > 1) pagNav += '<a href="' + (page === 2 ? 'index.html' : 'page-' + (page - 1) + '.html') + '">← 上一页</a> ';
  pagNav += '<span>第 ' + page + ' / ' + totalPages + ' 页</span> ';
  if (page < totalPages) pagNav += '<a href="page-' + (page + 1) + '.html">下一页 →</a>';
  pagNav += '</div>';

  let pageHtml = indexTemplate
    .replace(/{{TITLE}}/g, 'AI赚钱实操指南 - 用AI工具做副业 (第' + page + '页)')
    .replace(/{{ARTICLES}}/g, articleListHtml + '\n' + pagNav)
    .replace(/{{BODY_CLASS}}/g, 'home');

  const outName = page === 1 ? 'index.html' : 'page-' + page + '.html';
  fs.writeFileSync(path.join(publicDir, outName), pageHtml, 'utf8');
}

// Copy CSS
const cssSrc = path.join(__dirname, 'assets', 'css', 'style.css');
const cssDst = path.join(publicDir, 'style.css');
if (fs.existsSync(cssSrc)) fs.copyFileSync(cssSrc, cssDst);

console.log('Paginated index: ' + totalPages + ' pages');
console.log('Total articles: ' + articles.length);
console.log('Done!');
