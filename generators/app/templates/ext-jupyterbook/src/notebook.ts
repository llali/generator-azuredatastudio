'use strict';

import * as vscode from 'vscode';
import * as azdata from 'azdata';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const processNotebooks = () => {
    const rootExtensionsFolder = path.normalize(path.join(os.homedir(), '.azuredatastudio', 'extensions'))
    let notebookNames: Array<string> = [];

    let subExtensionFolder = getFolderContent(rootExtensionsFolder);

    subExtensionFolder.forEach(folderName => {
        findCorrectFolder(folderName, rootExtensionsFolder, notebookNames);
    });
    return notebookNames;
}

const findCorrectFolder = (folderName: string, rootExtensionsFolder: string, notebookNames: Array<string>) => {
    let folderExt = path.basename(folderName).toLowerCase();

    if (folderExt.indexOf('<%= name%>') > -1) {
        let fullFolderPath = path.join(rootExtensionsFolder, folderName);
        try {
            extractNotebooksFromFolder(fullFolderPath, notebookNames);
        } catch (e) {
            vscode.window.showErrorMessage("Unable to access " + fullFolderPath + ": " + e.message);
        }
    }
}

const extractNotebooksFromFolder = (fullFolderPath: string, notebookNames: Array<string>) => {
    var files = getFolderContent(fullFolderPath);
    files.forEach(fileName => {
    var fileExtension = path.extname(fileName).toLowerCase();
        if (fileExtension === '.ipynb'){
            let fullFilePath = path.join(fullFolderPath, fileName)
            notebookNames.push(path.normalize(fullFilePath));
        }
    })
}

const getFolderContent = (folderPath: string) => {
    try {
        return fs.readdirSync(folderPath);
    } catch (e) {
        vscode.window.showErrorMessage("Unable to access " + folderPath + ": " + e.message);
        return [];
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('launchNotebooks.<%= name %>', () => {
        let notebooksToDisplay: Array<string> = processNotebooks();
        notebooksToDisplay.forEach(name => {
            azdata.nb.showNotebookDocument(vscode.Uri.file(name));
        });
    }));
}
