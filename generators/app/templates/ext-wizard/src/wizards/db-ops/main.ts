'use strict';
import * as vscode from 'vscode';
import {DbOpsWizard} from './wizard/wizard'

// Function that is called when extension is activated
export function activate(context: vscode.ExtensionContext) {
    // When 'Launch...' command is entered in the Command Palette, the Database Operations Wizard opens.
    context.subscriptions.push(vscode.commands.registerCommand('<%= name %>.launch<%= wizardOrDialog %>',
    () => {
        new DbOpsWizard().start();
    }));
}