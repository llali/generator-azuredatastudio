import * as vscode from 'vscode'
import * as azdata from 'azdata'
import * as fs from 'fs';
import {ProfileModel, PronounTypes} from '../api/models'
import {BasePage} from '../api/basePage'

/**
 * Represents the third page of the Profile Builder Wizard, which displays default
 * profile, and allows user to update and save their profile to a txt file.
 * Lays out UI elements on page and updates Profile Model according to user input.
 */
export class Page3 extends BasePage {
    private inputBox: azdata.InputBoxComponent;
    private inputBoxWrapper: azdata.LoadingComponent;
    private wizard: azdata.window.Wizard

    public constructor(wizardPage: azdata.window.WizardPage, model: ProfileModel, view: azdata.ModelView,
         width: number, wizard : azdata.window.Wizard) {
        super(wizardPage, model, view, width);
        this.inputBox = this.view.modelBuilder.inputBox().component();
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

    async onPageEnter(): Promise<boolean> {
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
            // Opens file-saving dialog and allows user to save a txt file
            await vscode.window.showSaveDialog({
                filters: {
                    'Plain Text (.txt)': ['txt']
                }
            }).then(async fileUri => {
                if (fileUri) { // if user chose to save a file
                    // write their profile to a txt file, and display error if one occurs
                    fs.writeFile(fileUri.fsPath, this.model.profileParagraph, (error) => {
                        if (error) {
                            vscode.window.showInformationMessage(error.message);
                        }
                    });
                    // open the txt file with user's profile in ADS
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

    // Accepts a string and returns the same string with the first character capitalized,
    //  if it exists and is a letter. If not, returns the original string.
    private capitalize(word : string) : string{
        if (word.length === 0) {
            return word;
        } else if (word.length === 1) {
            return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Accepts a string and returns 'an' if the string begins with a vowel, and 'a' otherwise
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

    // Returns 'has' or 'have' depending on the pronoun selection of the user
    private conjugateToHave() : string{
        if (this.model.pronouns.type === PronounTypes.Neutral) {
            return 'have';
        } else {
            return 'has';
        }
    }
}