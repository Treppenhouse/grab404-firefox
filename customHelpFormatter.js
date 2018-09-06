

const {ArgumentParser, HelpFormatter} = require('argparse');

/**
 *  
 * This is custom formatter for the help text.
 * 
 * It extends the formatter from the `argparse` module. The new behaviour ensures
 * that whitespaces characeters like \n in the description or epilog are not removed.
 *
 */
var CustomHelpFormatter = module.exports = function CustomHelpFormatter(options){
	HelpFormatter.call(this, options);
}
CustomHelpFormatter.prototype =  Object.create(HelpFormatter.prototype);
CustomHelpFormatter.prototype.constructor = CustomHelpFormatter;

HelpFormatter.prototype._splitLines = function (text, width) {
  var lines = [];
  var delimiters = [ ' ', '.', ',', '!', '?' ];
  var re = new RegExp('[' + delimiters.join('') + '][^' + delimiters.join('') + ']*$');

  // CHANGE 1
  //text = text.replace(/[\n\|\t]/g, ' ');
  text = text.trim();
  // CHANGE 2
  //text = text.replace(this._whitespaceMatcher, ' ');

  // Wraps the single paragraph in text (a string) so every line
  // is at most width characters long.
  text.split('\n').forEach(function (line) {
    if (width >= line.length) {
      lines.push(line);
      return;
    }

    var wrapStart = 0;
    var wrapEnd = width;
    var delimiterIndex = 0;
    while (wrapEnd <= line.length) {
      if (wrapEnd !== line.length && delimiters.indexOf(line[wrapEnd] < -1)) {
        delimiterIndex = (re.exec(line.substring(wrapStart, wrapEnd)) || {}).index;
        wrapEnd = wrapStart + delimiterIndex + 1;
      }
      lines.push(line.substring(wrapStart, wrapEnd));
      wrapStart = wrapEnd;
      wrapEnd += width;
    }
    if (wrapStart < line.length) {
      lines.push(line.substring(wrapStart, wrapEnd));
    }
  });

  return lines;
};
