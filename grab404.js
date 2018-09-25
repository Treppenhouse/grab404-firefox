
// file system
const fs = require('fs');
const { mkdirp } = require('mkdirp');
const getDirName = require('path').dirname;

// image processing
const graphicsMagick = require('gm')
const Readable = require('stream').Readable
const Writable = require('stream').Writable

// selenium webriver
const { Builder, promise, until } = require('selenium-webdriver');
const command = require('selenium-webdriver/lib/command');
const firefox = require('selenium-webdriver/firefox');
const promiseUtil = require('selenium-webdriver/lib/promise');

// argument parser
const { parseCliArguments } = require("./argumentParser");


/**
 * Calculate the filename of the screenshot image based on the url and the current index
 * 
 * @param url
 *            the url
 */
let calculateOutputFilename = function (url, index, outputFolder) {
	let indexString = ("0" + index).slice(-2);
	let strippedUrl = url.replace("/", "")
	let outputFileName = outputFolder + '/' + indexString + '.' + strippedUrl + '.png';
	return outputFileName;
};
module.exports.calculateOutputFilename = calculateOutputFilename;


if (require.main === module) {
	// this module was run directly from the command line as in node xxx.js


	console.log('Starting grab404...');

	let args = parseCliArguments();

	let outputFolder = args.outputFolder;
	let filename = args.filename;
	let urlString = args.urls;
	let prefix = args.prefix;
	let postfix = args.postfix;

	console.log('Output folder: ' + outputFolder);
	console.log('Filename: ' + filename);
	console.log('URL string: ' + urlString);


	let urls = [];
	if (urlString != null) {
		urls = urlString.split(',');
	}
	else {
		let completeString = fs.readFileSync(filename).toString();
		console.log('COMPLETE FILE CONTENT: ' + completeString);
		urls = completeString.replace(/\r\n/g, '\n').split('\n');
	}
	console.log('URLs:');
	urls.forEach(url => console.log('\t' + url));


	const driver = new Builder()
		.forBrowser('firefox')
		.setFirefoxOptions(new firefox.Options()
			.headless()
			.windowSize({ height: 1080, width: 1920 }))
		.build();

	const commandWindowSize = new command.Command(command.Name.SET_WINDOW_SIZE);
	commandWindowSize.setParameter('windowHandle', 'current');
	commandWindowSize.setParameter('width', 1920);
	commandWindowSize.setParameter('height', 1080);
	driver.schedule(commandWindowSize);


	console.log('Firefox initialized...')






	let urlIndex = 0;

	var retrieveNext = function () {
		var url;
		if (urls.length < 1) {
			afterLast();
			return;
		}
		url = urls.shift();
		urlIndex++;

		let outputFileName = calculateOutputFilename(url, urlIndex, outputFolder);
		let outputDirectoryName = getDirName(outputFileName)
		mkdirp(outputDirectoryName, function (error) {
			if (error) {
				console.error('ERROR CREATING DIRECTORY: ' + error);
				afterLast();
				return;
			}

			var fullUrl = prefix + url + postfix;

			console.log('BEFORE GET...' + fullUrl);

			driver.get(fullUrl)
				.then(
					success => {
						return driver.takeScreenshot()
					},
					error => {
						console.error('ERROR GETTING THE URL: ' + error);
						retrieveNext();
					})
				.then(
					base64ImageString => {
						fs.writeFile(outputFileName, base64ImageString, 'base64', (error) => {
							if (error) {
								console.error('ERROR WRITING FILE: ' + error);
							} else {
								console.log('FILE WRITTEN ' + outputFileName)
							}
							retrieveNext();
						});
					});
		},
			error => {
				console.error('ERROR TAKING SCREENSHOT: ' + error);
				retrieveNext();
			});
	}

	retrieveNext();

	function afterLast() {
		console.log('Quitting driver...');
		driver.quit();
	}
}