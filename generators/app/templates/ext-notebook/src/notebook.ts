'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// The module 'azdata' contains the Azure Data Studio extensibility API
// This is a complementary set of APIs that add SQL / Data-specific functionality to the app
// Import the module and reference it with the alias azdata in your code below

import * as azdata from 'azdata';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

function processNotebookFolder(folderPath: string) {
    var errors = [], notebooks = [];
    var notebookCount = 0;

    var count = convert(folderPath);
    if (count <= 0) {
        generator.log("No valid notebooks found in " + folderPath + (errors.length > 0 ? '.\n' + errors.join('\n'): ''));
        return count;
    }

    generator.log(count + " notebook(s) found." + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n'): ''));
    return count;

    function convert(folderPath: string) {
        var files = getFolderContent(folderPath, errors);
        if (errors.length > 0) {
            return -1;
        }

        files.forEach(function (fileName) {
            var extension = path.extname(fileName).toLowerCase();
            if (extension === '.md' || extension === '.ipynb') {
                notebookCount++;
                var filePath = path.join(folderPath, fileName);
                notebooks.push(filePath);
            }
        });
        generator.extensionConfig.notebooks = notebooks;
        return notebookCount;
    }
}

function getFolderContent(folderPath: string, errors: Array<string>) {
    try {
        return fs.readdirSync(folderPath);
    } catch (e) {
        errors.push("Unable to access " + folderPath + ": " + e.message);
        return [];
    }
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "<%= name %>" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    context.subscriptions.push(vscode.commands.registerCommand('Launch Notebooks: <%= name %>', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        var notebookPath = path.join(os.homedir(), '.azuredatastudio','extensions', '<%= name %>')

        vscode.commands.executeCommand('bookTreeView.openNotebook', );
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}