'use strict';

import * as vscode from 'vscode';
import * as azdata from 'azdata';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// This function looks in the user's default extensions folder for Azure Data Studio
// to find this extension and its packaged files. If it encounters an error, a
// message will appear in an error window.
const processNotebooks = () => {
    const rootExtensionsFolder = path.normalize(path.join(os.homedir(), '.azuredatastudio', 'extensions'))
    let notebookNames: Array<string> = [];

    let subExtensionFolder = getFolderContent(rootExtensionsFolder);

    subExtensionFolder.forEach(folderName => {
        findCorrectFolder(folderName, rootExtensionsFolder, notebookNames);
    });
    return notebookNames;
}

// This function is called by processNotebooks to find the correct folder that contains
// this extension. If it is found, then it opens up the book in Azure Data Studio's
// native notebook viewlet.
const findCorrectFolder = (folderName: string, rootExtensionsFolder: string, notebookNames: Array<string>) => {
    let folderExt = path.basename(folderName).toLowerCase();

    if (folderExt.indexOf(('<%= publisherName%>.<%= name%>').toLowerCase()) > -1) {
        let fullFolderPath = path.join(rootExtensionsFolder, folderName);
        try {
            extractNotebooksFromFolder(fullFolderPath, notebookNames);
        } catch (e) {
            vscode.window.showErrorMessage("Unable to access " + fullFolderPath + ": " + e.message);
        }
    }
}

// Each notebook or markdown file packaged with your extension will be found through this
// function so that they can be individually opened through the `showNotebookDocument` command.
const extractNotebooksFromFolder = (fullFolderPath: string, notebookNames: Array<string>) => {
    const files = getFolderContent(fullFolderPath);
    files.forEach(fileName => {
        let fileExtension = path.extname(fileName).toLowerCase();
        if (fileExtension === '.ipynb' || fileExtension === '.md') {
            let fullFilePath = path.join(fullFolderPath, fileName)
            notebookNames.push(path.normalize(fullFilePath));
        }
    })
}

// This is a wrapper to read each subfolder in the extensions folder.
const getFolderContent = (folderPath: string) => {
    try {
        return fs.readdirSync(folderPath);
    } catch (e) {
        vscode.window.showErrorMessage("Unable to access " + folderPath + ": " + e.message);
        return [];
    }
}

// This function is called when you run the command `Launch Notebooks: <%= name %>` from
// command palette in Azure Data Studio. If you would like any additional functionality
// to occur when you launch the book, add to the activate function.
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('launchNotebooks.<%= name %>', () => {
        let notebooksToDisplay: Array<string> = processNotebooks();
        notebooksToDisplay.forEach(name => {
            azdata.nb.showNotebookDocument(vscode.Uri.file(name));
        });
    }));
}
