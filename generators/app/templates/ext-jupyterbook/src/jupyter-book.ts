'use strict';

import * as vscode from 'vscode';
import * as azdata from 'azdata';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

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

const findCorrectFolder = (folderName: string, rootExtensionsFolder: string) => {
    let folderExt = path.basename(folderName).toLowerCase();

    if (folderExt.indexOf('<%= publisherName%>.<%= name%>') > -1) {
        let fullFolderPath = path.join(rootExtensionsFolder, folderName);
        vscode.commands.executeCommand('bookTreeView.openBook', fullFolderPath, false);
    }
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
    context.subscriptions.push(vscode.commands.registerCommand('launchBook.<%= name %>', () => {
        processNotebooks();
    }));
}
