import * as azdata from 'azdata';
import { WizardModel } from './models';

export abstract class BasePage {

	public readonly wizardPage: azdata.window.WizardPage;
	protected readonly model: WizardModel;
	protected readonly view: azdata.ModelView;
	protected readonly width: number;

	constructor(wizardPage: azdata.window.WizardPage, model: WizardModel, view: azdata.ModelView, width : number) {
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