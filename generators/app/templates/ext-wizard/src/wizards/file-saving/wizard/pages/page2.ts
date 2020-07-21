import * as azdata from 'azdata'
import {ProfileModel} from '../api/models'
import {BasePage} from '../api/basePage'

/**
 * Represents the second page of the Profile Builder Wizard, that prompts user for
 * a fun fact about themselves from a selection of options. Lays out UI elements on page and
 * updates Profile Model according to user input.
 */
export class Page2 extends BasePage {
    private dropdownOptions : Map<string, azdata.FormComponent>;
    private currentOption : string;

    public constructor(wizardPage: azdata.window.WizardPage, model: ProfileModel,
            view: azdata.ModelView, width: number) {
        super(wizardPage, model, view, width);
        this.dropdownOptions =  this.populateDropdownOptionsMap();
        this.currentOption = '';
	}

	async start(): Promise<boolean> {
        let options : Array<string> = Array.from(this.dropdownOptions.keys());
        let funFactDropdown = this.view.modelBuilder.dropDown()
            .withProperties({
                values: options,
                required: true
            }).component();

        let layout = {componentWidth: this.width};
        let formBuilder = this.view.modelBuilder.formContainer().withFormItems([{
            component: funFactDropdown,
            title: 'Choose a Fun Fact:'
        }], layout);


        // Create default option
        this.currentOption = options[0];
        let funFactInput = this.dropdownOptions.get(this.currentOption);
        formBuilder.addFormItem(funFactInput as azdata.FormComponent);

        funFactDropdown.onValueChanged(params => {
            // remove current one
            formBuilder.removeFormItem(this.dropdownOptions.get(this.currentOption) as azdata.FormComponent);

            // add new one
            this.currentOption = funFactDropdown.value as string;
            formBuilder.addFormItem(this.dropdownOptions.get(this.currentOption) as azdata.FormComponent);
        });

        await this.view.initializeModel(formBuilder.component());
        return true;
	}

    async onPageEnter(): Promise<boolean> {
		return true;
    }

    private populateDropdownOptionsMap() : Map<string, azdata.FormComponent> {
        let mapNamesToComponents : Map<string, azdata.FormComponent> = new Map();

        this.addDropdownOption(mapNamesToComponents, 'Favorite Book', 'What is your favorite book?',
            '\'s favorite book is');
        this.addDropdownOption(mapNamesToComponents, 'Favorite Food', 'What is your favorite food?',
            '\'s favorite food is');
        this.addDropdownOption(mapNamesToComponents, 'Languages Spoken', 'What languages do you speak?' +
            ' (enter as comma-separated list)', ' can speak');

        return mapNamesToComponents;
    }

    private addDropdownOption(mapNamesToComponents :  Map<string, azdata.FormComponent>,
            dropdownLabel : string, question : string, answer : string) {
        let factInput = this.view.modelBuilder.inputBox().component();
        let dropdownOption = {
            component: factInput,
            title: question,
            required: true
        }

        factInput.onTextChanged(text => {
            this.model.funFact = answer + ' ' + text;
        })

        mapNamesToComponents.set(dropdownLabel, dropdownOption);
    }
}