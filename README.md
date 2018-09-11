# Prerequisites
1. `firefox` need to be installed and added to the `PATH`
2. `node.js` need to be installed

# Usage
```
Usage: grab404.js [-h] [-f FILENAME] [-u URLS] [-o OUTPUTFOLDER]

Optional arguments:
  -h, --help            Show this help message and exit.
  -f FILENAME, --filename FILENAME
                        Text file containing the URLs separated by a new line
  -u URLS, --urls URLS  URLs separated by commas
  -o OUTPUTFOLDER, --outputFolder OUTPUTFOLDER
                        Output folder where the screenshots will be placed

Examples:
   		node grab404.js -f examples/cities.txt
 		node grab404.js -urls www.github.com,wikipedia.org -o ../output/screenshots
```

