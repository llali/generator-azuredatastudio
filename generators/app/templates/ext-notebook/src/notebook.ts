'use strict';

import * as vscode from 'vscode';
import * as azdata from 'azdata';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const processNotebooks = (): Array<string> => {
    const rootExtensionsFolder = path.normalize(path.join(os.homedir(), '.azuredatastudio', 'extensions'))
    let errors: Array<string> = [], notebookNames: Array<string> = [];

    let notebooks = convert(rootExtensionsFolder);
    return notebooks;

    function convert(folderPath: string) {
        let subExtensionFolder = getFolderContent(folderPath, errors);
        if (errors.length > 0) {
            return [];
        }

        subExtensionFolder.forEach((folderName) => {
            let folderExt =  path.basename(folderName).toLowerCase();
            if (folderExt.indexOf('<%= name%>') > -1) {
                let fullFolderPath = path.join(rootExtensionsFolder, folderName);
                try {
                    extractNotebooks(fullFolderPath, errors, notebookNames);
                } catch (e) {
                    vscode.window.showErrorMessage("Unable to access " + fullFolderPath + ": " + e.message);
                }
            }
        });
        return notebookNames;
    }
}

const extractNotebooks = (fullFolderPath: string, errors: Array<string>, notebookNames: Array<string>) => {
    var files = getFolderContent(fullFolderPath, errors);
    files.forEach((fileName) => {
    var fileExtension = path.extname(fileName).toLowerCase();
        if (fileExtension === '.ipynb'){
            let fullFilePath = path.join(fullFolderPath, fileName)
            notebookNames.push(path.normalize(fullFilePath));
        }
    })
}

const getFolderContent = (folderPath: string, errors: Array<string>) => {
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
