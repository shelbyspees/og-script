const chromium = require('chrome-aws-lambda');
const fs = require('fs-extra');
const path = require('path');

console.log('inside index.js!');

module.exports = async posts => {
  console.log('✨ Generating og:image for all posts ✨');

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: true, //chromium.headless,
  });

  const page = await browser.newPage();

  let html = (
    await fs.readFile(path.resolve(__dirname, './template.html'))
  ).toString();

  let avatar = await fs.readFile(path.resolve(__dirname, './avatar.jpeg'), {
    encoding: 'base64',
  });
  html = html.replace(
    './avatar.jpeg',
    `data:image/jpeg;charset=utf-8;base64,${avatar}`
  );

  await page.setContent(html, {
    waitUntil: ['domcontentloaded'],
  });

  await page.evaluateHandle('document.fonts.ready');

  await page.setViewport({
    width: 1200,
    height: 632,
  });

  const baseDir = path.resolve('/Users/spees/projects/website/public/og-images/');
  fs.ensureDir(path.resolve(baseDir)); // this works

  for (const post of posts) {
    await page.evaluate($post => {
      let dom = document.querySelector('#title');
      dom.innerHTML = $post.title;
    }, post);
    await page.screenshot({
      path: `${baseDir}${post.slug.slice(0, -1)}.jpeg`,
      type: 'jpeg',
      quality: 100,
      clip: { x: 0, y: 0, width: 1200, height: 632 },
    });
  }

  await browser.close();
};
