const { ArgumentParser } = require('argparse');
const { CustomHelpFormatter } = require('./customHelpFormatter.js');


const outputFolderDefault = 'out';
const prefixDefault = 'http://';
const postfixDefault = '/grab404';


function parseCliArguments() {
	let parser = new ArgumentParser({
		addHelp: true,
		description: 'This program can be used to capture screenshot of the 404 pages of websites.\n \
			The list of URLs can be provided either by file or by CLI argument.',
		// TODO: all whitespace characters are trimmed :( must override own HelpFormatter
		// Read about this: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance
		formatterClass: CustomHelpFormatter,
		epilog: 'Examples:\n \
  			node grab404.js -f cities.txt\n \
			node grab404.js --urls www.github.com,wikipedia.org -o ../output/screenshots'
	});
	parser.addArgument(['-f', '--filename'], {
		help: 'Text file containing the URLs separated by a new line'
	});
	parser.addArgument(['-u', '--urls'], {
		help: 'URLs separated by commas'
	});
	parser.addArgument(['-o', '--outputFolder'], {
		help: 'Output folder where the screenshots will be placed.\n \
			Default: ' + outputFolderDefault,
		defaultValue: outputFolderDefault
	});
	parser.addArgument(['--prefix'], {
		help: 'String that the URLs are prefixed with.\n \
			Default: ' + prefixDefault,
		defaultValue: prefixDefault
	});
	parser.addArgument(['--postfix'], {
		help: 'String that the URLs are postfixed with.\n \
			Default: ' + postfixDefault,
		defaultValue: postfixDefault
	});

	let args = parser.parseArgs();

	if (args.filename == null && args.urls == null) {
		console.error('ERROR: Either filename or urls must be provided!!\n')
		parser.printHelp();
		process.exit();
	}
	if (args.filename != null && args.urls != null) {
		console.error('ERROR: Must provide EITHER filename OR urls. Not both!!\n')
		parser.printHelp();
		process.exit();
	}
	return args;
}
exports.parseCliArguments = parseCliArguments;