// file system
const { writeFile } = require('fs');
const { mkdirp } = require('mkdirp');
const getDirName = require('path').dirname;

// image processing
const graphicsMagick = require('gm')
const Readable = require('stream').Readable
const Writable = require('stream').Writable

// selenium webriver
const {Builder, promise, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const promiseUtil = require('selenium-webdriver/lib/promise');

// The argument parser
const {ArgumentParser, HelpFormatter} = require('argparse');
const {CustomHelpFormatter} = require('./customHelpFormatter.js'); 


console.log('Starting grab404...');

const outputFolderDefault = './out';


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
	// TODO read urls from file
}
console.log('URLs:');
urls.forEach(url => console.log('\t'+url));


const driver = new Builder()
	.forBrowser('firefox')
	.setFirefoxOptions(new firefox.Options().headless())
	.build();

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
    var outputFileName = './out/' + indexString + '.' + strippedUrl + '.png';
    return outputFileName;
};

var cropImage = function(base64ImageString, callback) {
	var readStream = new Readable();



	graphicsMagick(readStream).crop(1024, 200, 0, 0);

	

	var data = '';
	readStream.on('readable', () => {
		console.log('READABLE: ');
		var res = readStream.read();
		console.log('RES: '+res);
	});
	readStream.on('data', (chunk) => {
		console.log('DATA: '+chunk);
    	data += chunk;
	});

	readStream.on('end', () => {
	    console.log('END: ');
	    callback(data);
	});

	readStream._read = () => {};
	readStream.push(base64ImageString);
	readStream.push(null);
} 

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

	console.log('BEFORE GET...'+urls);

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
			cropImage(base64ImageString, croppedBase64String => {
				writeFile(outputFileName, croppedBase64String, 'base64', (error) => {
					if(error) {
	  					console.error('ERROR WRITING FILE: '+error);
	  				} else { 
	  					console.log('FILE WRITTEN '+outputFileName)
	  				}
	  				retrieveNext();
	  			});
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

