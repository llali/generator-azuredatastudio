import * as azdata from 'azdata'
import {ProfileModel, PronounTypes} from '../api/models'
import {BasePage} from '../api/basePage'

/**
 * Represents the first page of the Profile Builder Wizard, that collects
 * information like user's name, role, etc. Lays out UI elements on page and
 * updates Profile Model according to user input.
 */
export class Page1 extends BasePage {

    public constructor(wizardPage: azdata.window.WizardPage, model: ProfileModel,
            view: azdata.ModelView, width: number) {
        super(wizardPage, model, view, width);
	}

	async start(): Promise<boolean> {
        let wizardDescription : string = 'This Wizard will demo commonly-used wizard operations '
                + 'and UI elements. You will be guided through some steps to generate a profile for '
                + 'yourself and save it to a text file.';
        let description = this.view.modelBuilder.text().component();
        let nameInput = this.view.modelBuilder.inputBox().component();
        let roleInput = this.view.modelBuilder.inputBox().component();
        let yearsInput = this.view.modelBuilder.inputBox()
            .withProperties({inputType: 'number'}).component();
        let pronounOptions = await this.createPronounOptions();
        let formItemLayout = {componentWidth: this.width};

        this.addAction(nameInput, roleInput, yearsInput);

        let formBuilder = this.view.modelBuilder.formContainer().withFormItems([{
            component: description,
            title: wizardDescription
        }, {
            component: nameInput,
            title: 'Name',
            required: true
        }, {
            component: roleInput,
            title: 'Role',
            required: true
        }, {
            component: yearsInput,
            title: 'Years in Role',
            required: true
        }, {
            component: pronounOptions,
            title: 'Pronouns',
            required: true
        }], formItemLayout);

        await this.view.initializeModel(formBuilder.component());
        return true;
	}

	async onPageEnter(): Promise<boolean> {
		return true;
    }

    private async createPronounOptions() : Promise<azdata.Component> {
        let maleButton= this.view.modelBuilder.radioButton()
            .withProperties({
                name: 'pronounsOption',
                label: 'He/Him',
                checked: true // make male button the default
            }).component();
        let maleModel = {
            type: PronounTypes.Male,
            subject: 'he',
            object: 'him',
            possessive: 'his',
            possessivePronoun: 'his',
            reflexive: 'himself'
        }
        this.model.pronouns = maleModel; // make male button the default
        maleButton.onDidClick(() => {
            this.model.pronouns= maleModel;
        });

        let femaleButton = this.view.modelBuilder.radioButton()
            .withProperties({
                name: 'pronounsOption',
                label: 'She/Her'
            }).component();
        femaleButton.onDidClick(() => {
            this.model.pronouns= {
                type: PronounTypes.Female,
                subject: 'she',
                object: 'her',
                possessive: 'her',
                possessivePronoun: 'hers',
                reflexive: 'herself'
            };
        });

        let neutralButton = this.view.modelBuilder.radioButton()
            .withProperties({
                name: 'pronounsOption',
                label: 'They/Them'
            }).component();
        neutralButton.onDidClick(() => {
            this.model.pronouns = {
                type: PronounTypes.Neutral,
                subject: 'they',
                object: 'them',
                possessive: 'their',
                possessivePronoun: 'theirs',
                reflexive: 'themself'
            };
        });

        let pronounOptions = this.view.modelBuilder.groupContainer()
            .withItems([
                maleButton, femaleButton, neutralButton
            ]).component();
        return pronounOptions;
    }

    private addAction(nameInput : azdata.InputBoxComponent, roleInput : azdata.InputBoxComponent,
            yearsInput : azdata.InputBoxComponent) {

        nameInput.onTextChanged(text => {
			this.model.name = text;
        });

        roleInput.onTextChanged(text => {
			this.model.role = text;
        });

        yearsInput.onTextChanged(years => {
            this.model.yearsInRole = years;
        });
    }
}