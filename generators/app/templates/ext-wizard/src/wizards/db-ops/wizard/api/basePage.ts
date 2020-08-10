import * as azdata from 'azdata';
import { ConnectionModel } from './models';

/**
* Represents a Wizard Page backed by a data model and an Azure Data Model View
*/
export abstract class BasePage {
    public readonly wizardPage: azdata.window.WizardPage;
    protected readonly model: ConnectionModel;
    protected readonly view: azdata.ModelView;
    protected readonly width: number; // width of the page

    constructor(wizardPage: azdata.window.WizardPage, model: ConnectionModel, view: azdata.ModelView, width : number) {
        this.wizardPage = wizardPage;
        this.model = model;
        this.view = view;
        this.width = width;
    }

    /**
    * This method constructs all the elements of the page.
    */
    public async abstract start(): Promise<boolean>;

    /**
    * This method is called when the user is entering the page.
    */
    public async abstract onPageEnter(): Promise<boolean>;

    /**
    * This method is called when the user is leaving the page.
    */
    async onPageLeave(): Promise<boolean> {
        return true;
    }

    /**
    * Override this method to cleanup what you don't need cached in the page.
    */
    public async cleanup(): Promise<boolean> {
        return true;
    }
}