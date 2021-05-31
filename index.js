const chromium = require('chrome-aws-lambda');
const fs = require('fs');
const path = require('path');

console.log('inside index.js!');

exports.handler = async (event, context, callback) => {
  let result = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    const page = await browser.newPage();

    // Load html from template
    const html = fs
      .readFileSync(path.resolve(__dirname, './template.html'))
      .toString();

    // Render html
    await page.setContent(html, {
      waitUntil: ['domcontentloaded'],
    });

    // Wait until the document is fully rendered
    await page.evaluateHandle('document.fonts.ready');

    // Set the viewport to your preferred og:image size
    await page.setViewport({
      width: 1200,
      height: 632
    });

    // grab the page title to make sure it worked
    // returns undefined right now
    result = await page.$title;
  }
  catch (error) {
    console.log(error);
    return callback(error);
  }
  finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return callback(result);
};

function printTitle(title) {
  console.log(`page title: ${title}`);
}

exports.handler(
  { url: 'https://spees.dev' },
  '', // context doesn't get used
  printTitle // page title gets passed in by caller
);
