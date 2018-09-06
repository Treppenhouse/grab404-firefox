const { writeFile } = require('fs');

const {Builder, By, Key, promise, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

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
 * Render 404 error pages of given urls
 * 
 * @param urls
 *            of URLs to render
 * @param callbackPerUrl
 *            Function called after finishing each URL, including the last URL
 * @param callbackFinal
 *            Function called after finishing everything
 */
var render404Pages = function(urls, callbackPerUrl, callbackFinal) {
    // screenshot dimensions
    const width = 1024;
    const height = 1200;

    var urlIndex = 0;



    /**
     * Calculate the filename of the screenshot image based on the url and the current index
     * 
     * @param url
     *            the url
     */
    var calculateOutputFilename = function(url) {
        var indexString = ("0" + urlIndex).slice(-2);
        strippedUrl = url.replace("/", "")
        var outputFileName = "../out/" + indexString + "." + strippedUrl + ".png";
        return outputFileName;
    };


    /**
     * Calculate the filename of the screenshot image based on the url and the current index
     * 
     * @param url
     *            the url
     */
    var closeCurrentAndRetrieveNext = function(url, file) {
        callbackPerUrl(url, file);
        return retrieveNext();
    };

    var retrieveNext = function() {
        var url;
        if (urls.length > 0) {
            url = urls.shift();
            
            let outputFileName = calculateOutputFilename(url);
            console.log("Outputfilename = " + outputFileName);
            

            // TODO: do they have to start with www?
            var fullUrl = "http://www." + url + "/reddit";
            urlIndex++;



			var status = driver.get(fullUrl).then(element => {
				console.log(element);
				driver.takeScreenshot()
				  	.then(data => {
				  		console.log("screenshot taken?");
				    	writeFile(outputFileName,data,'base64', () => {
				    		console.log("File written: " + outputFileName);
	   						closeCurrentAndRetrieveNext(fullUrl, outputFileName);
				    	});
				  	});
			});
			

            /*page = webpage.create();
            page.settings.userAgent = "Grab 404 bot";
            page.settings.resourceTimeout = 300000; // 5 minutes
            page.onResourceTimeout = function(e) {
                // the url whose request timed out
                console.log("Timeout on URL: " + e.url + " Index = " + (index + 1));
            };
            page.viewportSize = {
                width: width,
                height: height
            };
            console.log("Requesting URL: " + fullUrl);
            return page.open(fullUrl, function(status) {
                page.evaluate(function(w, h) {
                    document.body.bgColor = 'white';
                    document.body.style.width = w + "px";
                    document.body.style.height = h + "px";
                }, width, height);
                page.clipRect = {
                    height: height,
                    width: width
                };
                var outputFileName;
                outputFileName = calculateOutputFilename(url);
                console.log("Outputfilename = " + outputFileName);
                if (status === "success") {
                    return window.setTimeout((function() {
                        page.render(outputFileName);
                        console.log("File written: " + outputFileName);
                        return closeCurrentAndRetrieveNext(status, fullUrl, outputFileName);
                    }), 400);
                } else {
                    return closeCurrentAndRetrieveNext(status, fullUrl, outputFileName);
                }
            });*/
        } else {
            return callbackFinal();
        }
    };
    return retrieveNext();
}










render404Pages(urls, (function(url, file) {
    console.log("Rendered '" + url + "' at '" + file + "'");
}), function() {
	console.log('Exiting program...');
	driver.quit();
    process.exit();
});

console.log("hello");








process.exit();	


  
