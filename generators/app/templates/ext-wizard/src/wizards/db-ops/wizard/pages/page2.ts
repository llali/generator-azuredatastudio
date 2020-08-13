import * as azdata from 'azdata'
import * as vscode from 'vscode'
import {ConnectionModel} from '../api/models'
import {BasePage} from '../api/basePage'

/**
* Represents the second page of the Wizard, which allows the user to select
* one of several operations on their selected connection
*/
export class Page2 extends BasePage {
    private tasks : Map<string, any>;
    private optionsDropdown: azdata.DropDownComponent | undefined;
    private wizard: azdata.window.Wizard;

    public constructor(wizardPage: azdata.window.WizardPage, model: ConnectionModel,
    view: azdata.ModelView, width: number, wizard : azdata.window.Wizard) {
        super(wizardPage, model, view, width);
        this.tasks = new Map();
        this.wizard = wizard;
    }

    async start(): Promise<boolean> {
        this.tasks.set('New Query', () => this.newQuery());
        this.tasks.set('Expand and Refresh Connection', () => this.refreshConnection());
        this.tasks.set('View Connection String', () => this.viewConnectionString());

        let optionsComponent = await this.createOptionsDropdown();

        let layout = {componentWidth: this.width};
        let formBuilder = this.view.modelBuilder.formContainer().withFormItems(
        [optionsComponent], layout);

        if (this.optionsDropdown) {
            this.wizard.doneButton.onClick(() => this.tasks.get(String(this.optionsDropdown?.value)).call());
        }

        await this.view.initializeModel(formBuilder.component());
        return true;
    }

    async onPageEnter(): Promise<boolean> {
        return true;
    }

    private async createOptionsDropdown(): Promise<azdata.FormComponent> {
        let optionsDropdown = this.view.modelBuilder.dropDown().withProperties({
            required: true,
            values: Array.from(this.tasks.keys())
        }).component();

        this.optionsDropdown = optionsDropdown;
        return {
            component: optionsDropdown,
            title: 'Select a Task:'
        };
    }

    // working with VS Code file APIs
    private newQuery(){
        let sqlContent = 'SELECT * FROM ' + this.model.database + '.INFORMATION_SCHEMA.TABLES';
        vscode.workspace.openTextDocument({ language: 'sql', content: sqlContent }).then(doc => {
            vscode.window.showTextDocument(doc, vscode.ViewColumn.Active, false);
        });
    }

    // working with azdata object explorer API
    private refreshConnection() {
        azdata.objectexplorer.getNode(this.model.server.connectionId).then(node => {
            if (node) {
                node.refresh();
                vscode.window.showInformationMessage('Connection refreshed!');
            }
        });
    }

    // working with azdata connection API
    private viewConnectionString() {
        azdata.connection.getConnectionString(this.model.server.connectionId, true).then(connection => {
            if (connection) {
                vscode.window.showInformationMessage(connection);
            } else {
                vscode.window.showErrorMessage('Could not retrieve connection string');
            }
        }, error => {
            vscode.window.showErrorMessage(error);
        });
    }
}