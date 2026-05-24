const { chromium } = require('playwright');
const path = require('path');

const products = [
  { name: 'ai-prompt-bible', file: 'cover.html' },
  { name: 'ai-money-guide', file: 'cover.html' },
  { name: 'one-person-business-plan', file: 'cover.html' },
  { name: 'social-media-calendar', file: 'cover.html' },
];

const baseDir = 'C:/Users/1/.easyclaw/workspace-caishen/projects/digital-products/products';

(async () => {
  const browser = await chromium.launch();
  
  for (const product of products) {
    const htmlPath = path.join(baseDir, product.name, product.file);
    const outputPath = path.join(baseDir, product.name, 'cover.png');
    const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
    
    console.log(`Loading: ${fileUrl}`);
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`Saved: ${outputPath}`);
    await page.close();
  }
  
  await browser.close();
  console.log('All covers generated!');
})();
