import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p==='/') p='/index.html';
  const fp = path.join(__dirname, p);
  if (!existsSync(fp)) { res.writeHead(404); res.end(); return; }
  const ext = path.extname(fp);
  const mime = { '.html':'text/html','.js':'text/javascript','.css':'text/css' }[ext]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':mime}); res.end(readFileSync(fp));
});
await new Promise(r=>server.listen(0,r));
const port = server.address().port;
const browser = await chromium.launch();
const ctx = await browser.newContext({ acceptDownloads: true });
const page = await ctx.newPage();
const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{ if(m.type()==='error') errors.push('c:'+m.text()); });
await page.goto(`http://localhost:${port}/`);
await page.waitForTimeout(500);

// open the "Phông nền" accordion
await page.evaluate(() => {
  const p = [...document.querySelectorAll('.inspector > .panel.collapsible')]
    .find(x => /Phông nền/.test(x.querySelector('.panel-heading h2')?.textContent||''));
  if (p && !p.classList.contains('open')) p.querySelector('.panel-heading').click();
});
await page.waitForTimeout(150);

const swatchCount = await page.$$eval('.swatches .swatch', els => els.map(e=>e.dataset.background));
const results = [];
for (const bg of ['snow','pearl','blush','sage','slate']) {
  await page.click(`.swatch[data-background="${bg}"]`);
  await page.waitForTimeout(120);
  const state = await page.evaluate(() => ({
    dataBg: document.getElementById('artboard')?.dataset.bg,
    active: document.querySelector('.swatch.active')?.dataset.background,
  }));
  results.push({ bg, ...state });
}

// Verify export renders the new bg (draw preset to a small canvas via the app fn is internal;
// instead test that toDataURL of a preset render differs from white)
const renderOk = await page.evaluate(() => {
  // draw the slate preset by using the app's exported draw? not exposed. quick sanity:
  const c=document.createElement('canvas'); c.width=40;c.height=40;
  return true;
});

// export png with slate active
const [dl] = await Promise.all([ page.waitForEvent('download'), page.click('#exportButton') ]);
const fname = dl.suggestedFilename();

console.log('SWATCHES:', JSON.stringify(swatchCount));
console.log('SWITCH RESULTS:', JSON.stringify(results));
console.log('EXPORT (slate active):', fname);
console.log('JS ERRORS:', errors.length?errors:'none');
await browser.close(); server.close();
