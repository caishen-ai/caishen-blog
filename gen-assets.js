<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head><body>
<canvas id="logo" width="512" height="512"></canvas>
<canvas id="screenshot" width="1200" height="630"></canvas>
<script>
const fs = require('fs');
const { createCanvas } = require('canvas');
// Logo
const logoCanvas = createCanvas(512, 512);
const ctx = logoCanvas.getContext('2d');
ctx.fillStyle = '#1a1a2e';
ctx.fillRect(0, 0, 512, 512);
ctx.fillStyle = '#e94560';
ctx.beginPath();
ctx.arc(256, 200, 100, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = '#ffd700';
ctx.font = 'bold 72px Arial';
ctx.fillText('¥', 200, 235);
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 48px Arial';
ctx.fillText('财神AI', 130, 380);
ctx.fillStyle = '#aaaacc';
ctx.font = '24px Arial';
ctx.fillText('AI赚钱实战指南', 145, 430);
fs.writeFileSync('logo.png', logoCanvas.toBuffer('image/png'));
// Screenshot
const ssCanvas = createCanvas(1200, 630);
const ctx2 = ssCanvas.getContext('2d');
ctx2.fillStyle = '#f5f5f5';
ctx2.fillRect(0, 0, 1200, 630);
ctx2.fillStyle = '#1a1a2e';
ctx2.fillRect(0, 0, 1200, 80);
ctx2.fillStyle = '#ffd700';
ctx2.font = 'bold 36px Arial';
ctx2.fillText('财神AI博客 - AI赚钱实战指南', 40, 55);
ctx2.fillStyle = '#333';
ctx2.font = '24px Arial';
ctx2.fillText('2026年最新 · 134篇原创干货 · 永久免费', 40, 150);
ctx2.fillStyle = '#e94560';
ctx2.font = 'bold 30px Arial';
ctx2.fillText('🔥 AI副业赚钱实操', 40, 220);
ctx2.fillText('🛠️ AI工具深度测评', 40, 270);
ctx2.fillText('🏢 一人公司AI全栈', 40, 320);
ctx2.fillText('📱 AI自媒体矩阵', 40, 370);
ctx2.fillText('🛒 AI电商运营', 40, 420);
ctx2.fillText('🤖 AI自动化/n8n', 40, 470);
ctx2.fillStyle = '#1a1a2e';
ctx2.fillRect(0, 540, 1200, 90);
ctx2.fillStyle = '#ffffff';
ctx2.font = '18px Arial';
ctx2.fillText('caishen-ai.github.io/caishen-blog/  |  免费 · 无广告 · 不割韭菜', 40, 595);
fs.writeFileSync('screenshot.png', ssCanvas.toBuffer('image/png'));
console.log('Done: logo.png + screenshot.png');
</script></body></html>
