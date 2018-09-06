const { writeFile } = require('fs');

const {Builder, By, Key, promise, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const {ArgumentParser, HelpFormatter} = require('argparse');

console.log('Starting grab404...');

const outputFolderDefault = './out';

var parser = new ArgumentParser(
	{
		addHelp: true,
		// TODO: all whitespace characters are trimmed :( must override own HelpFormatter
		// Read about this: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance
		epilog: 'Examples:\n \
  		\tnode grab404.js -f cities.txt\n \
		\tnode grab404.js -u www.github.com,wikipedia.org -o ../output/screenshots \
		'
	});

parser.addArgument(
	['-f','--filename'],
	{
		help: 'Text file containing the URLs separated by a new line'
	});

parser.addArgument(
	['-u', '--urls'],
	{
		help: 'URLs separated my commas'
	});

parser.addArgument(
	['-o', '--outputFolder'],
	{
		help: 'Output folder where the screenshots will be placed',
		defaultValue: outputFolderDefault
	});

var args = parser.parseArgs();
console.dir(args);

const driver = new Builder()
	.forBrowser('firefox')
	.setFirefoxOptions(new firefox.Options().headless())
	.build();

console.log('Firefox initialized...')

driver.get('http://www.google.com/ncr');
driver.takeScreenshot()
  	.then(data => {
    	writeFile('screenshot.png',data,'base64', () => {
    		console.log('Screenshot taken!')
    		driver.quit();
    	});
  	})
  	.catch(console.error);


  
