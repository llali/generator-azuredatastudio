'use strict';
import * as azdata from 'azdata';
import { WizardModel } from './api/models';
import {Page1} from './pages/page1';
import {Page2} from './pages/page2';
import {Page3} from './pages/page3';
import { BasePage } from './api/basePage';


export class SampleWizard {
    public wizard: azdata.window.Wizard;
	public model: WizardModel;
	
	constructor() {
        this.wizard = azdata.window.createWizard('Sample Wizard: Profile Builder');
        this.model = <WizardModel>{};
    }
    
    public async start() {
        let page1 : azdata.window.WizardPage = azdata.window.createWizardPage('Your Profile');
        let page2 : azdata.window.WizardPage = azdata.window.createWizardPage('Fun Fact');
        let page3 : azdata.window.WizardPage = azdata.window.createWizardPage('Edit and Save Profile');
        
        const pagesMap = new Map<number, BasePage>();
        const width = 800;
        
        page1.registerContent(async (view) => {
            let page = new Page1(page1, this.model, view, width);
            pagesMap.set(0, page);
            await page.start().then(() => {
				page.onPageEnter();
            });
        });
        page2.registerContent(async (view) => {
            let page = new Page2(page2, this.model, view, width);
            pagesMap.set(1, page);
            await page.start();
        });
        page3.registerContent(async (view) => {
            let page = new Page3(page3, this.model, view, width, this.wizard);
            pagesMap.set(2, page);
            await page.start();
        });
        
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
        
        this.wizard.pages = [page1, page2, page3];
        this.wizard.generateScriptButton.hidden = true;
		this.wizard.open();
    }
}