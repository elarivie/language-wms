'use babel'

// This file contains all the logic to lint wmf files.


// Import every required libraries.
import { CompositeDisposable } from 'atom'
var subscriptions = null;

const helpers = require('atom-linter');
const helpers_tree_sitter_wms = require('tree-sitter-wms');
const NamedRegexp = require('named-js-regexp');
const Parser = require('tree-sitter');
const Wms = require('tree-sitter-wms');
const the_tree = [""];
const parser = new Parser();
parser.setLanguage(Wms);

///////////////////////////////////////////////////
export function doLint(theFilePath, theText) {
  the_tree[0] = parser.parse(theText, the_tree[0]);
  //let the_real_tree = the_tree[0];
  //let the_root_tree = the_tree[0].rootNode;

  // Fetching the toString() of the rootNode hangs for ever even for empty text... how are we suppose to fetch details and parsing error? : https://github.com/tree-sitter/tree-sitter/issues/255
  //alert(the_tree[0].rootNode.toString());
  //the_lines = the_tree.toString().match(/[^\r\n]+/g);

  //const regexLine = new NamedRegexp("^.*\(ERROR\s+\[(?<LINEFROM>\d+)\,\s+(?<COLFROM>\d+)\]\s+\-\s+\[(?<LINETO>\d+)\,\s+(?<COLTO>\d+)\]\).*$");
}
///////////////////////////////////////////////////


export function activate() {
  this.subscriptions = new CompositeDisposable();
}

export function deactivate() {
  this.subscriptions.dispose();
  the_tree[0] = "";
}

export function provideLinter() {
  return {
    name: 'language-wms',
    scope: 'file', // or 'project'
    lintsOnChange: false, // or true
    grammarScopes: ['source.wms'],
    lint(textEditor) {
      return null;
      const editorPath = textEditor.getPath();
      if (editorPath == null) {
        return null;
      } else if (!Array.from(atom.project.relativizePath(editorPath))) {
        //Ignore this call since it is about a file which is not part of any currently opened projects.
        return null;
      }

      const buffer = textEditor.getBuffer(); // .getBuffer().getText()
      const buffer_text = buffer.getText();
      
      if (true) {
        // Do something sync
        doLint(editorPath, buffer_text);
        return [{
          severity: 'info',
          location: {
            file: editorPath,
            position: [[0, 0], [0, 1]]
          },
          excerpt: `A random sync value is ${Math.random()}`,
          description: "### What is this?\nThis is a randomly generated value"
      }]
      } else {

        // Do something async
        return new Promise(function(resolve) {
          doLint(editorPath, buffer_text);
          resolve([{
            severity: 'info',
            location: {
              file: editorPath,
              position: [[0, 0], [0, 1]],
            },
            excerpt: `A random ASYNC value is ${Math.random()}`,
            description: `### What is this?\nThis is a randomly generated value`
          }])
        })
      }
    }
  }
}

