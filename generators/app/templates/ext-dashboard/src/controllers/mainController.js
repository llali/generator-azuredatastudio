/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const azdata = require("azdata");
const Utils = require("../utils");
const controllerBase_1 = require("./controllerBase");
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const openurl = require("openurl");
/**
 * The main controller class that initializes the extension
 */
class MainController extends controllerBase_1.default {
    // PUBLIC METHODS //////////////////////////////////////////////////////
    /**
     * Deactivates the extension
     */
    deactivate() {
        Utils.logDebug('Main controller deactivated');
    }
    activate() {
        const webviewExampleHtml = fs.readFileSync(path.join(__dirname, 'webviewExample.html')).toString();
        azdata.dashboard.registerWebviewProvider('webviewExample', e => {
			e.html = webviewExampleHtml;
        });
        azdata.tasks.registerTask('<%= name %>.getUrl', e => this.openurl('https://github.com/microsoft/azuredatastudio'));
        azdata.tasks.registerTask('<%= name %>.getQuery', e => this.onExecute(e, 'query.sql'));
        azdata.tasks.registerTask('<%= name %>.getNotebook', e => this.openNotebook(e, 'SampleTSQLNotebook.ipynb'));
        azdata.tasks.registerTask('<%= name %>.getConnection', e => this.showConnection());
        azdata.tasks.registerTask('<%= name %>.getWebview', e => this.showWebview());
        return Promise.resolve(true);
    }
    openurl(link) {
        openurl.open(link);
    }
    onExecute(connection, fileName) {
        let sqlContent = fs.readFileSync(path.join(__dirname, '..', 'sql', fileName)).toString();
        vscode.workspace.openTextDocument({ language: 'sql', content: sqlContent }).then(doc => {
            vscode.window.showTextDocument(doc, vscode.ViewColumn.Active, false).then(() => {
                let filePath = doc.uri.toString();
                azdata.queryeditor.connect(filePath, connection.id).then(() => azdata.queryeditor.runQuery(filePath));
            });
        });
    }

    openNotebook(connection, fileName) {
        let sqlContent = fs.readFileSync(path.join(__dirname, '..', 'notebook', fileName)).toString();
        vscode.workspace.openTextDocument({ language: 'notebook', content: sqlContent }).then(doc => {
            vscode.window.showNotebookDocument(doc, vscode.ViewColumn.Active, false).then(() => {
                let filePath = doc.uri.toString();
                azdata.queryeditor.connect(filePath, connection.id).then(() => azdata.queryeditor.runQuery(filePath));
            });
        });
    }

    showConnection(){
        azdata.connection.getCurrentConnection().then(connection => {
            let connectionId = connection ? connection.connectionId : 'No connection found!';
            vscode.window.showInformationMessage(connectionId);
        }, error => {
             console.info(error);
        });
    }
    showWebview(){
        const panel = vscode.window.createWebviewPanel(
            'catCoding',
            'Cat Coding',
            vscode.ViewColumn.One,
            {}
        );
        panel.webview.html = fs.readFileSync(path.join(__dirname, 'webviewExample.html')).toString();
    }
}
exports.default = MainController;

//# sourceMappingURL=mainController.js.map
