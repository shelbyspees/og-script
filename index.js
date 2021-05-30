const chromium = require('chrome-aws-lambda');
console.log("inside index.js!");

exports.handler = async (event, context, callback) => {
  let result = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    let page = await browser.newPage();
    await page.goto(event.url || 'https://example.com');
    result = await page.title();
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

  function callback() {
    console.log(`page title: ${result}`);
  }

  return callback(null, result);
};

exports.handler({ url: "https://spees.dev" });
