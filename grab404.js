const { writeFile } = require('fs');

const {Builder, By, Key, promise, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');


const driver = new Builder().forBrowser('firefox').build();
driver.get('http://www.google.com/ncr');
driver.takeScreenshot()
  .then(data => {
    writeFile('screenshot.png',data,'base64', () => driver.quit());
  })
  .catch(console.error);
  
