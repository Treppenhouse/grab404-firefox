// file system
const fs = require('fs');
const { mkdirp } = require('mkdirp');
const getDirName = require('path').dirname;

// image processing
const graphicsMagick = require('gm')
const Readable = require('stream').Readable
const Writable = require('stream').Writable

// selenium webriver
const {Builder, promise, until} = require('selenium-webdriver');
const command = require('selenium-webdriver/lib/command');
const firefox = require('selenium-webdriver/firefox');
const promiseUtil = require('selenium-webdriver/lib/promise');

// The argument parser
const {ArgumentParser, HelpFormatter} = require('argparse');
const {CustomHelpFormatter} = require('./customHelpFormatter.js'); 


console.log('Starting grab404...');

const outputFolderDefault = 'out';


let parser = new ArgumentParser(
	{
		addHelp: true,
		// TODO: all whitespace characters are trimmed :( must override own HelpFormatter
		// Read about this: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance
		formatterClass: CustomHelpFormatter,
		epilog: 'Examples:\n \
  		node grab404.js -f cities.txt\n \
		node grab404.js -urls www.github.com,wikipedia.org -o ../output/screenshots \
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
		help: 'URLs separated by commas'
	});

parser.addArgument(
	['-o', '--outputFolder'],
	{
		help: 'Output folder where the screenshots will be placed',
		defaultValue: outputFolderDefault
	});

let args = parser.parseArgs();
let outputFolder = args.outputFolder;
let filename = args.filename;
let urlString = args.urls;

console.log('Output folder: '+outputFolder);
console.log('Filename: '+filename);
console.log('URL string: '+urlString);


if(filename == null && urlString == null) {
	console.error('ERROR: Either filename or urls must be provided!!\n')
	parser.printHelp();
	process.exit();
}
if(filename != null && urlString != null) {
	console.error('ERROR: Must provide EITHER filename OR urls. Not both!!\n')
	parser.printHelp();
	process.exit();	
}

let urls = [];
if(urlString != null) {
	urls = urlString.split(',');
}
else {
	let completeString = fs.readFileSync(filename).toString();
	console.log('COMPLETE FILE CONTENT: '+completeString);
	urls = completeString.replace(/\r\n/g,'\n').split('\n');

}
console.log('URLs:');
urls.forEach(url => console.log('\t'+url));


const driver = new Builder()
	.forBrowser('firefox')
	.setFirefoxOptions(new firefox.Options()
		.headless()
		.windowSize({height:1080, width: 1920}))
	.build();

const commandWindowSize = new command.Command(command.Name.SET_WINDOW_SIZE);
commandWindowSize.setParameter('windowHandle','current');
commandWindowSize.setParameter('width',1920);
commandWindowSize.setParameter('height',1080);
driver.schedule(commandWindowSize);


console.log('Firefox initialized...')




/**
 * Calculate the filename of the screenshot image based on the url and the current index
 * 
 * @param url
 *            the url
 */
var calculateOutputFilename = function(url) {
    var indexString = ("0" + urlIndex).slice(-2);
    strippedUrl = url.replace("/", "")
    var outputFileName = './'+outputFolder+'/' + indexString + '.' + strippedUrl + '.png';
    return outputFileName;
};

let urlIndex = 0;

var retrieveNext = function() {
    var url;
    if(urls.length < 1){
    	afterLast();
    	return;
    }
	url = urls.shift();
	urlIndex++;

	let outputFileName = calculateOutputFilename(url);
	let outputDirectoryName = getDirName(outputFileName)
	mkdirp(outputDirectoryName,	function (error) {
    if (error){
		console.error('ERROR CREATING DIRECTORY: '+error);
		afterLast();
		return;
    } 

	// TODO: why www here?
	var fullUrl = "http://www." + url + "/reddit";

	console.log('BEFORE GET...'+fullUrl);

	driver.get(fullUrl)
	.then(
		success => {
			return driver.takeScreenshot()
		},
		error => {
			console.error('ERROR GETTING THE URL: '+error);
			retrieveNext();
		})
	.then(
		base64ImageString => {
			fs.writeFile(outputFileName, base64ImageString, 'base64', (error) => {
				if(error) {
  					console.error('ERROR WRITING FILE: '+error);
  				} else { 
  					console.log('FILE WRITTEN '+outputFileName)
  				}
  				retrieveNext();
  			});
		});
		},
		error => {
			console.error('ERROR TAKING SCREENSHOT: '+error);
			retrieveNext();
		});
	}

retrieveNext();

function afterLast() {
	console.log('Quitting driver...');
	driver.quit();
}

