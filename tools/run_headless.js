const fs = require('fs');
const puppeteer = require('puppeteer');
(async () => {
  const url = 'http://localhost:8000/posters/AI_for_Space_Engineering_and_Autonomous_Systems/index.html';
  const outScreenshot = '/tmp/poster_screenshot.png';
  const logs = [];
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => {
      const txt = `[PAGE ${msg.type()}] ${msg.text()}`;
      logs.push(txt);
      console.log(txt);
    });
    page.on('pageerror', err => {
      const txt = `[PAGE ERROR] ${err.stack || err}`;
      logs.push(txt);
      console.error(txt);
    });
    await page.setViewport({ width: 1366, height: 900 });
    const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('HTTP status:', resp.status());
    // wait briefly to allow dynamic scripts to run
    await page.waitForTimeout(1200);
    await page.screenshot({ path: outScreenshot, fullPage: true });
    console.log('Saved screenshot to', outScreenshot);
    await browser.close();
    fs.writeFileSync('/tmp/headless_logs.txt', logs.join('\n'));
    console.log('Wrote logs to /tmp/headless_logs.txt');
    process.exit(0);
  } catch (e) {
    console.error('Headless run failed:', e);
    try { fs.writeFileSync('/tmp/headless_logs.txt', logs.join('\n')); } catch(_){}
    process.exit(1);
  }
})();