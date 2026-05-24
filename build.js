// Simple static blog generator
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'posts');
const TEMPLATES = path.join(ROOT, 'templates');
const OUTPUT = path.join(ROOT, 'output');
const ASSETS = path.join(ROOT, 'assets');

// Read template
const template = fs.readFileSync(path.join(TEMPLATES, 'post.html'), 'utf8');

// Read all markdown files
const files = fs.readdirSync(CONTENT).filter(f => f.endsWith('.md'));

// Simple markdown to HTML (handles common elements)
function md2html(md) {
  let html = md
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Images
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered lists (simple)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Tables - simple detection
    .replace(/^\|(.+)\|$/gm, (line) => {
      const cells = line.split('|').filter(c => c.trim());
      if (line.includes('---')) return ''; // skip separator
      const tag = line.match(/^##/m) ? 'th' : 'td'; // rough heuristic
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    })
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
    // Paragraphs - wrap lines that aren't HTML tags
    .replace(/^(?!<[a-z/!])(.+)$/gm, '<p>$1</p>')
    // Cleanup empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')

  return html;
}

// Extract title from markdown (first # heading)
function extractTitle(md) {
  const match = md.match(/^# (.+)$/m);
  return match ? match[1] : 'Untitled';
}

// Extract date from filename or use today
function extractDate(filename) {
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
}

// Build index page
const articles = [];

files.forEach((file, i) => {
  const md = fs.readFileSync(path.join(CONTENT, file), 'utf8');
  const title = extractTitle(md);
  const date = extractDate(file);
  const slug = file.replace('.md', '').replace(/^\d+-/, '').replace(/-/g, '-');
  const outName = file.replace('.md', '.html');

  articles.push({ title, date, slug, file: outName });

  const bodyHtml = md2html(md);
  const page = template
    .replace(/{{TITLE}}/g, title)
    .replace(/{{DATE}}/g, date)
    .replace(/{{CONTENT}}/g, bodyHtml)
    .replace(/{{BODY_CLASS}}/g, 'post');

  fs.writeFileSync(path.join(OUTPUT, outName), page);
  console.log(`Built: ${outName}`);
});

// Build index page
const indexTemplate = fs.readFileSync(path.join(TEMPLATES, 'index.html'), 'utf8');
const articleListHtml = articles.map(a =>
  `<article class="post-card">
    <h2><a href="${a.file}">${a.title}</a></h2>
    <time>${a.date}</time>
    <p><a href="${a.file}">阅读全文 →</a></p>
  </article>`
).join('\n');

const indexPage = indexTemplate
  .replace(/{{TITLE}}/g, 'AI工具推荐博客 - 用AI赚钱的实操指南')
  .replace(/{{ARTICLES}}/g, articleListHtml)
  .replace(/{{BODY_CLASS}}/g, 'home');

fs.writeFileSync(path.join(OUTPUT, 'index.html'), indexPage);
console.log('Built: index.html');

// Copy CSS
fs.copyFileSync(path.join(ASSETS, 'css', 'style.css'), path.join(OUTPUT, 'style.css'));
console.log('Copied: style.css');

console.log('\n✅ Blog built successfully!');
console.log(`Open: ${OUTPUT}\\index.html`);
