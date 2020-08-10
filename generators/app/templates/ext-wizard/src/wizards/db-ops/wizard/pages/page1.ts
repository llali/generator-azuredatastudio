import * as azdata from 'azdata'
import * as vscode from 'vscode'
import {ConnectionModel} from '../api/models'
import {BasePage} from '../api/basePage'

/**
* Represents the first page of the Wizard, which allows the user to select
* one of their active connections, and a specific database within the connection to work with
*/
export class Page1 extends BasePage {
    private serverDropdown: azdata.DropDownComponent | undefined;
    private databaseDropdown: azdata.DropDownComponent | undefined;
    private serverOptions : Map<string, azdata.connection.ConnectionProfile>;

    public constructor(wizardPage: azdata.window.WizardPage, model: ConnectionModel,
            view: azdata.ModelView, width: number) {
        super(wizardPage, model, view, width);
        this.serverOptions = new Map();
    }

    async start() : Promise<boolean> {
        let descriptionComponent =
            {component: this.view.modelBuilder.text().component(),
            title: 'This Wizard will demo commonly-used connection operations '
            + 'and UI elements. You will select one of your existing connections, and '
            + 'then choose an operation to perform on that connection.'};
        let serverComponent = await this.createServerDropdown();
        let databaseComponent = await this.createDatabaseDropdown();

        let layout = {componentWidth: this.width};
        let formBuilder = this.view.modelBuilder.formContainer().withFormItems(
        [descriptionComponent, serverComponent, databaseComponent], layout);

        await this.view.initializeModel(formBuilder.component());
        return true;
    }

    async onPageEnter(): Promise<boolean> {
        let r1 = await this.populateServerDropdown();
        let r2 = await this.populateDatabaseDropdown();
        return r1 && r2;
    }

    private async createServerDropdown(): Promise<azdata.FormComponent> {
        this.serverDropdown = this.view.modelBuilder.dropDown().withProperties({
            required: true,
        }).component();

        // Handle server changes
        this.serverDropdown.onValueChanged(async () => {
            if (this.serverDropdown) {
                let connection = this.serverOptions.get(String(this.serverDropdown.value));

                if (connection) {
                    this.model.server = connection;
                    await this.populateDatabaseDropdown();
                }
            }
        });

        return {
            component: this.serverDropdown,
            title: 'Select a Server:'
        };
    }

    private async createDatabaseDropdown(): Promise<azdata.FormComponent> {
        this.databaseDropdown = this.view.modelBuilder.dropDown().withProperties({
            required: true,
        }).component();

        // Handle database changes
        this.databaseDropdown.onValueChanged(async () => {
            if (this.databaseDropdown) {
                this.model.database = String(this.databaseDropdown.value);
            }
        });

        return {
            component: this.databaseDropdown,
            title: 'Select a Database:'
        };
    }

    private async populateServerDropdown(): Promise<boolean> {
        if (!this.serverDropdown) {
            return false;
        }
        let connectionsExist = await this.getServerValues();
        if (!connectionsExist) {
            vscode.window.showErrorMessage("Connect to a server first to use this wizard.")
            return false;
        }

        let connections : string[] = Array.from(this.serverOptions.keys());
        let firstConnection = this.serverOptions.get(connections[0]);
        if (firstConnection) {
            this.model.server = firstConnection;
            this.serverDropdown.updateProperties({
                values: connections
            });
        }
        return firstConnection !== undefined;
    }

    private async populateDatabaseDropdown(): Promise<boolean> {
        if (!this.databaseDropdown) {
            return false;
        }

        this.databaseDropdown.updateProperties({ values: [] });
        if (!this.model.server) {
            return false;
        }

        let values: string[];
        try {
            values = await this.getDatabaseValues();
        } catch (e) {
            values = [this.model.server.databaseName];
            console.warn(e);
        }

        this.model.database = values[0];
        this.databaseDropdown.updateProperties({
            values: values
        });
        return true;
    }

    // working with azdata connection API
    private async getServerValues(): Promise<boolean> {
        let connections = await azdata.connection.getConnections(true);

        if (!connections || connections.length === 0) {
            return false;
        }

        for (let connection of connections) {
            this.serverOptions.set(connection.serverName, connection);
        }

        return true;
    }

    // working with azdata connection API
    private async getDatabaseValues(): Promise<string[]> {
        let databaseValues = await azdata.connection.listDatabases(this.model.server.connectionId);
        return databaseValues;
    }
}