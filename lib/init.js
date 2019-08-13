// This file contains all the logic to lint wmf files.
// Import every required libraries.

const {
  CompositeDisposable
} = require('atom');

const helpers = require('atom-linter');
const helpers_tree_sitter_wms = require('tree-sitter-wms');
const path = require('path');
const NamedRegexp = require('named-js-regexp');
const Parser = require('tree-sitter');
const Wms = require('tree-sitter-wms');

var the_tree = '';
const parser = new Parser();
parser.setLanguage(Wms);

// Define every available settings.
module.exports = {
  config: {

    lintTrigger: {
      title: 'Lint Trigger',
      type: 'string',
      default: 'LintAsYouType',
      enum: [{
          value: 'LintOnFileSave',
          description: 'Lint on file save'
        },
        {
          value: 'LintAsYouType',
          description: 'Lint as you type'
        }
      ],
      description: "Specify the lint trigger",
      order: 1
    },
  }
}

  function activate() {
    require('atom-package-deps').install('language-wms');

    //Listen and reload any settings changes to prevent having to restart Atom for them to apply.
    this.subscriptions = new CompositeDisposable;


    this.subscriptions.add(atom.config.observe('language-wms.lintTrigger',
      lintTrigger => {
        this.lintTrigger = lintTrigger;
        return provider.lintsOnChange = "LintAsYouType" === lintTrigger;
      }));
  }

  function deactivate() {
    // Unsubscribe any registered atom's event.
    if (this.subscriptions) {
      return this.subscriptions.dispose();
    }
  }

function parseMessages(file_path, output) {
  const [projectPath] = Array.from(atom.project.relativizePath(file_path));
  if (!projectPath) {
    //Ignore this call since it is about a file which is not part of any currently opened projects.
    return [];
  }

  // Parse the pre-processed wms warnings output and isolate:
  // - file_path = The file path to the file being linted.
  // - line_from = The line number where the warning starts.
  // - col_from = The column where the warning starts within the line.
  // - line_to = The line number where the warning ends.
  // - col_to = The column where the warning ends within the line.
  // - message = The warning text.

  // Declare regex which extract information about the lint details.
  // Error lines contains:
  //    '(ERROR [5, 0] - [5, 31])'

  const regexLine = new NamedRegexp("^.*\(ERROR\s+\[(?<LINEFROM>\d+)\,\s+(?<COLFROM>\d+)\]\s+\-\s+\[(?<LINETO>\d+)\,\s+(?<COLTO>\d+)\]\).*$");

  // Prepare an array of all the warnings to report.
  const result = [];
  for (let output_line = 0; output_line < output.length; output_line++) {
    const v_CurrMessageRaw = regexLine.execGroups(output[output_line]);
    if (v_CurrMessageRaw) {} else {
      //Ignore this output line, since it does not contains an error.
      continue;
    }

    // At this point every messages will be reported, we won't filter them
    // But we will improve them a little to make them more helpful.

    //Prepare the warn characteristics.
    let theSeverity = 'warning';
    let theMessage = 'Something is wrong';
    let theDescription = "";
    let theUrl = "";
    let theStartLine = parseInt(v_CurrMessageRaw.LINEFROM, 10);
    let theStartCol = parseInt(v_CurrMessageRaw.COLFROM, 10);

    if (theStartLine) {
      if (theStartLine < 0) {
        theStartLine = 0;
      }
    } else {
      // Can this occur?
      theStartLine = 0;
    }

    if (0 === theStartCol) {
      theStartCol += 0;
    } else if (theStartCol) {
      theStartCol += 0;
    } else {
      // May occur if the start column is not provided by tree-sitter
      theStartCol = 0;
    }

    //HACK: Work around in case only the start column of the error, we have to use heuristics for the end column of the warning, without this workaround the warning would not be underline.
    const theEndLine = theStartLine;
    let theEndCol = theStartCol;

    if (0 < theStartCol) {
      //Rational: The underline is off by one character.
      theStartCol -= 1;
      theEndCol -= 1;

      //Rational: Since mypy points to something it must at least be one character long.
      theEndCol += 1;
    }

    // Use specialized heuristic base on the lint message...
    //The job is over, let's return the result so it can be displayed to the user.
  
    result.push(
            {
              severity: theSeverity,
              location: {
                file: file_path,
                position: [[theStartLine, theStartCol], [theEndLine, theEndCol]]
              },
              excerpt: theMessage,
              description: theDescription,
              url: theUrl
            }
          )
        //The job is over, let's return the result so it can be displayed to the user.
        return result
  }
  return result;
}

function provideLinter() {
  var provider = {
    name: 'language-wms',
    grammarScopes: ['text.wms.basic'],
    scope: 'file',
    lintsOnChange: false,
    lint: (textEditor) => {
      // Let's lint it and returns the warnings...
      // if provider.lintsOnChange && textEditor.isModified()
      const filePath = textEditor.getPath();
      if (filePath == null) {
        return null;
      }
      const buffer = textEditor.getBuffer(); // .getBuffer().getText()
      const the_tree = parser.parseTextBuffer(buffer, the_tree);
      return parseMessages(filePath, the_tree.match(/[^\r\n]+/g));
      }
    };
  return provider;
}
