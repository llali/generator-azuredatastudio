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
    let subExtensionFolder = getFolderContent(rootExtensionsFolder);

    try {
        subExtensionFolder.forEach(folderName => {
            findCorrectFolder(folderName, rootExtensionsFolder);
        });
    } catch (e) {
        vscode.window.showErrorMessage("Unable to access " + rootExtensionsFolder + ": " + e.message);
    }
}

// This function is called by processNotebooks to find the correct folder that contains
// this extension. If it is found, then it opens up the book in Azure Data Studio's
// native book viewlet.
const findCorrectFolder = (folderName: string, rootExtensionsFolder: string) => {
    let folderExt = path.basename(folderName).toLowerCase();

    if (folderExt.indexOf(('<%= publisherName%>.<%= name%>').toLowerCase()) > -1) {
        let fullFolderPath = path.join(rootExtensionsFolder, folderName);
        vscode.commands.executeCommand('bookTreeView.openBook', fullFolderPath, false);
    }
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

// This function is called when you run the command `Launch Book: <%= name %>` from
// command palette in Azure Data Studio. If you would like any additional functionality
// to occur when you launch the book, add to the activate function.
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('launchBook.<%= name %>', () => {
        processNotebooks();
    }));
}
