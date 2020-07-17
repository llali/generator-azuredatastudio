import * as vscode from 'vscode'
import * as azdata from 'azdata'
import * as fs from 'fs';
import {WizardModel, PronounTypes} from '../api/models'
import {BasePage} from '../api/basePage'

export class Page3 extends BasePage {   
    private inputBox: azdata.InputBoxComponent; // TODO: Figure out why this is a problem but not in examples
    private inputBoxWrapper: azdata.LoadingComponent;
    private wizard: azdata.window.Wizard // TODO: maybe remove

    public constructor(wizardPage: azdata.window.WizardPage, model: WizardModel, view: azdata.ModelView,
         width: number, wizard : azdata.window.Wizard) {
        super(wizardPage, model, view, width);
        this.inputBox = this.view.modelBuilder.inputBox().component(); // TODO: Get rid of this!
        this.inputBoxWrapper = this.view.modelBuilder.loadingComponent().component();
        this.wizard = wizard;
	}

	async start(): Promise<boolean> {
        this.inputBox = this.view.modelBuilder.inputBox()
            .withProperties({
                multiline: true,
                height: 200
            }).component();
        this.inputBox.onTextChanged(text => {
            this.model.profileParagraph = text;
        });
        this.createDoneButton();
        let layout = {componentWidth: this.width};

        this.inputBoxWrapper = this.view.modelBuilder.loadingComponent().withItem(this.inputBox).component();
        this.inputBoxWrapper.loading = true;
        
        let form = this.view.modelBuilder.formContainer().withFormItems([{
            component: this.inputBoxWrapper,
            title: 'Profile:'
        }], layout).component();


        await this.view.initializeModel(form);
        return true;
	}

    async onPageEnter(): Promise<boolean> { // TODO
        this.model.profileParagraph = this.capitalize(this.model.name) + ' is ' + 
            this.aOrAn(this.model.role) + ' ' + this.model.role + '. ' +
            this.capitalize(this.model.pronouns.subject) + ' ' + this.conjugateToHave() + 
            ' been in this role for ' + this.model.yearsInRole + ' years. ' + 
            'A fun fact about ' + this.model.pronouns.object + ': ' + this.model.name + 
            this.model.funFact + '.';
        
        this.inputBox.value = this.model.profileParagraph;

        // To demonstrate how to create a loading component:
        //      loads for 1 second before showing contents
        setTimeout(() => this.inputBoxWrapper.loading = false, 1000);
		return true;
    }

    async onPageLeave(): Promise<boolean> {
        return true;
    }

    private async createDoneButton() {
        this.wizard.doneButton.label = 'Save and Close';
        this.wizard.doneButton.onClick(async () => {
            await vscode.window.showSaveDialog({
                filters: {
                    'Plain Text (.txt)': ['txt']
                }
            }).then(async fileUri => {
                if (fileUri) {
                    fs.writeFile(fileUri.fsPath, this.model.profileParagraph, (error) => {
                        if (error) {
                            vscode.window.showInformationMessage(error.message);
                        }                       
                    });
                    await vscode.workspace.openTextDocument(fileUri)
                        .then(document => {
                            vscode.window.showTextDocument(document);
                            vscode.window.showInformationMessage('Profile Saved and Opened!')
                            this.wizard.close();
                        });
                }
            });
        });
    }

    private capitalize(word : string) : string{
        if (word.length === 0) {
            return word;
        } else if (word.length === 1) {
            return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    private aOrAn(word : string) : string{
        word = word.toLowerCase();
        if (word.startsWith('a') || word.startsWith('e')
            || word.startsWith('i') || word.startsWith('o')
            || word.startsWith('u')) {
            return 'an';
        } else {
            return 'a';
        }
    }

    private conjugateToHave() : string{
        if (this.model.pronouns.type === PronounTypes.Neutral) {
            return 'have';
        } else {
            return 'has';
        }
    }
}