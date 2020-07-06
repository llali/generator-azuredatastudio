'use strict';

import * as vscode from 'vscode';
import * as azdata from 'azdata';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const processNotebooks = (): Array<string> => {
    const folderPath = path.normalize(path.join(os.homedir(), '.azuredatastudio', 'extensions'))
    var errors: Array<string> = [], notebookNames: Array<string> = [];

    var names = convert(folderPath);
    return names;

    function convert(folderPath: string) {
        var files = getFolderContent(folderPath, errors);
        if (errors.length > 0) {
            return [];
        }

        files.forEach(function (fileName) {
            var extension = path.extname(fileName).toLowerCase();
            if (extension === '.ipynb') {
                notebookNames.push(fileName);
            }
        });

        return notebookNames;
    }

}

const getFolderContent = (folderPath: string, errors: Array<string>) => {
    if (folderPath.indexOf('<%= name%>') > -1){
        try {
            return fs.readdirSync(folderPath);
        } catch (e) {
            vscode.window.showErrorMessage("Unable to access " + folderPath + ": " + e.message);
            return [];
        }
    } else {
        vscode.window.showErrorMessage("Unable to find appropriate extension folder.");
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
