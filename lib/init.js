'use babel'

export function activate() {
  alert("Activate;")
  // Fill something here, optional
}

export function deactivate() {
  alert("DeActivate;");
  // Fill something here, optional
}

var the_tree = '';

export function provideLinter() {
  return {
    name: 'language-wms',
    scope: 'file', // or 'project'
    lintsOnChange: true, // or false
    grammarScopes: ['text.wms.basic'],
    lint(textEditor) {
      const file_Path = textEditor.getPath();
      if (file_Path == null) {
        return null;
      } else if (!Array.from(atom.project.relativizePath(file_path))) {
        //Ignore this call since it is about a file which is not part of any currently opened projects.
        return null;
      }

      const buffer = textEditor.getBuffer(); // .getBuffer().getText()

      // Do something async
      return new Promise(function(resolve) {
        result = [];

        the_tree = await parser.parseTextBuffer(buffer, the_tree, {
        the_lines = the_tree.match(/[^\r\n]+/g);

        for (lineIndex = 0; lineIndex < the_lines.length; lineIndex++) {

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

            const regexLine = new NamedRegexp("^.*\(ERROR\s+\[(?<LINEFROM>\d+)\,\s+(?<COLFROM>\d+)\]\s+\-\s+\[(?<LINETO>\d+)\,\s+(?<COLTO>\d+)\]\).*$");

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
                  file: file_Path,
                  position: [[theStartLine, theStartCol], [theEndLine, theEndCol]]
                },
                excerpt: theMessage,
                description: theDescription,
                url: theUrl
              }
            )
        }
        resolve (result);
      })
    }
  }
}
