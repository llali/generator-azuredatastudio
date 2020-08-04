'use strict';
import * as azdata from 'azdata';
import { ConnectionModel } from './api/models';
import {Page1} from './pages/page1';
import {Page2} from './pages/page2';
import { BasePage } from './api/basePage';

/**
 * Represents a Wizard that guides user through selecting a connection, and then
 * performing a database-specific operation on that connection.
*/
export class DbOpsWizard {
    public wizard: azdata.window.Wizard; // The Azure Data Wizard to be displayed
	public model: ConnectionModel; // Model to communicate between Wizard Pages

	constructor() {
        this.wizard = azdata.window.createWizard('Sample Wizard: Database Operations');
        this.model = <ConnectionModel>{};
    }

    // Creates, populates, and opens the database operations wizard
    public async start() {
        // Note that below, there are two concepts of pages: 1) Azure Data wizard pages, and
        //  2) custom Page objects, which extend the BasePage. Each custom Page stores the
        //  corresponding Azure Data page as a field, in addition to other relevant information
        //  like the Connection Model

        // Creates the three Azure Data wizard pages
        let page1 : azdata.window.WizardPage = azdata.window.createWizardPage('Select a Connection');
        let page2 : azdata.window.WizardPage = azdata.window.createWizardPage('Select an Operation');

        // Maps the page number to the custom page
        const pagesMap = new Map<number, BasePage>();
        const width = 800;

        // Creates custom pages, and adds them to the Azure Data pages' content
        page1.registerContent(async (view) => {
            let page = new Page1(page1, this.model, view, width);
            pagesMap.set(0, page);
            await page.start().then(() => {
				page.onPageEnter();
            });
        });
        page2.registerContent(async (view) => {
            let page = new Page2(page2, this.model, view, width, this.wizard);
            pagesMap.set(1, page);
            await page.start();
        });

        // Uses map of index to custom pages to call the custom pages' onPageLeave
        //  and onPageEnter methods when user changes Wizard pages
        this.wizard.onPageChanged(async (event) => {
			let indexLast = event.lastPage;
			let lastPage = pagesMap.get(indexLast);
			if (lastPage) {
				lastPage.onPageLeave();
			}

			let indexNew = event.newPage;
			let newPage = pagesMap.get(indexNew);
			if (newPage) {
				newPage.onPageEnter();
			}
		});

        this.wizard.pages = [page1, page2];

        this.wizard.generateScriptButton.hidden = true;
		this.wizard.open(); // open the wizard
    }
}