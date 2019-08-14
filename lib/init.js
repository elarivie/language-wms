'use babel'

alert("Hello");

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

alert("Init tree");
var the_tree = '';

alert("Pre parser init.");
const parser = new Parser();
parser.setLanguage(Wms);
alert("Post parser init.");

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

export function activate() {
  alert("Activate");
  require('atom-package-deps').install('language-wms');

  //Listen and reload any settings changes to prevent having to restart Atom for them to apply.
  this.subscriptions = new CompositeDisposable;


  this.subscriptions.add(atom.config.observe('language-wms.lintTrigger',
    lintTrigger => {
      this.lintTrigger = lintTrigger;
      return provider.lintsOnChange = "LintAsYouType" === lintTrigger;
    }));
}

export function deactivate() {
  alert("Deactivate");
  // Unsubscribe any registered atom's event.
  if (this.subscriptions) {
    return this.subscriptions.dispose();
  }
  the_tree = '';
}

export function provideLinter() {
  alert("Provide linter.");
  return {
    name: 'language-wms',
    scope: 'file', // or 'project'
    lintsOnChange: true, // or false
    grammarScopes: ['text.wms.basic'],
    lint(textEditor) {
      alert("Lint");
      // The end goal is to return a list of lint message or a promise of it.
      // Do something async
      return new Promise(function(resolve) {
        result = [];

        const buffer = textEditor.getBuffer(); // .getBuffer().getText()
        const buffer_text = buffer.getText(); // .getBuffer().getText()

        const file_path = textEditor.getPath();
        alert(file_path);
        if (file_path == null) {
          return null;
        } else if (!Array.from(atom.project.relativizePath(file_path))) {
          //Ignore this call since it is about a file which is not part of any currently opened projects.
          return null;
        }

        alert("Pre tree");
        the_tree = parser.parse(buffer_text, the_tree);
        alert(the_tree);
        the_lines = the_tree.match(/[^\r\n]+/g);

        const regexLine = new NamedRegexp("^.*\(ERROR\s+\[(?<LINEFROM>\d+)\,\s+(?<COLFROM>\d+)\]\s+\-\s+\[(?<LINETO>\d+)\,\s+(?<COLTO>\d+)\]\).*$");
        alert("Pre for");

        for (lineIndex = 0; lineIndex < the_lines.length; lineIndex++) {
          alert(lineIndex);
          // Parse the pre-processed wms warnings output and isolate:
          // - file_path = The file path to the file being linted.
          // - line_from = The line number where the warning starts.
          // - col_from = The column where the warning starts within the line.
          // - line_to = The line number where the warning ends.
          // - col_to = The column where the warning ends within the line.
          // - message = The warning text.
          // Declare regex which extract information available about a lint details.
          // Error lines contains:
          //    '(ERROR [5, 0] - [5, 31])'

            const v_CurrMessageRaw = regexLine.execGroups(the_lines[lineIndex]);
            if (v_CurrMessageRaw) {} else {
              //Ignore this output line, since it does not contain a lint.
              continue;
            }

            // Prepare the result array of all the lint to report.
            theStartLine = parseInt(v_CurrMessageRaw.LINEFROM, 10)
            theStartCol = parseInt(v_CurrMessageRaw.COLFROM, 10)
            theEndLine = parseInt(v_CurrMessageRaw.LINETO, 10)
            theEndCol = parseInt(v_CurrMessageRaw.COLTO, 10)
            theSeverity = "warning" // info/warning/error
            theMessage = 'Syntax error';
            theDescription = 'Syntax error.';
            theUrl = '';

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
        }
        alert("Post for");
        resolve(result);
        alert("Post Resolve");
      })
    }
  }
}
