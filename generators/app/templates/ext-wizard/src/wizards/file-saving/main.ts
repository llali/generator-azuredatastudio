'use strict';
import * as vscode from 'vscode';
import {SampleWizard} from './wizard/wizard'

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('<%= name %>.launch<%= wizardOrDialog %>',
    () => {
        new SampleWizard().start();
    }));
}