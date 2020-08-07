'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'; // Refer to `node_modules/@types/vscode/index.d.ts` for full API

// The module 'azdata' contains the Azure Data Studio extensibility API
// This is a complementary set of APIs that add SQL / Data-specific functionality to the app
// Import the module and reference it with the alias azdata in your code below.
import * as azdata from 'azdata'; // Refer to `node_modules/@types/azdata/index.d.ts` for full API

//--------------------------------- Activating Your Extension ----------------------------------//

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    //----------------------------- Creating the Wizard --------------------------------------//

    // The command has been defined in the package.json file
    // This method defines what occurs when the command is entered in the ADS command palette
    context.subscriptions.push(vscode.commands.registerCommand('<%= name %>.launch<%= wizardOrDialog %>', () => {
        // Create wizard
        let wizard : azdata.window.Wizard = azdata.window.createWizard('Sample Wizard');
        // Create wizard pages
        let page1 : azdata.window.WizardPage = azdata.window.createWizardPage('Sample Page 1');
        let page2 : azdata.window.WizardPage = azdata.window.createWizardPage('Sample Page 2');
        let page3 : azdata.window.WizardPage = azdata.window.createWizardPage('Sample Page 3');
        // Populate pages with content
        registerContentPage1(page1);
        registerContentPage2(page2);
        registerContentPage3(page3);

        wizard.pages = [page1, page2, page3]; // set wizard's content field to the wizard pages
        wizard.generateScriptButton.hidden = true;
        wizard.open(); // open wizard
    }));

    //------------------------------- Populating Wizard Pages -------------------------------------//

    // This functions registers sample content for the first wizard page
    function registerContentPage1(page : azdata.window.WizardPage) {
        page.registerContent(async (view : azdata.ModelView) => {
            // Initialize a text component. Note the use of the builder pattern via modelBuilder.
            //  This means the text component is not created until component()
            //  method is called.
            let textComponent : azdata.TextComponent = view.modelBuilder.text()
            .withProperties({ // Use withProperties() method to customize components
                value: 'Use a text component to include text in your Wizard page.',
                width: 800
            }).component();

            // To display the components on the page, call view's initializeModel method
            await view.initializeModel(textComponent);
        });
    }

    // This functions registers sample content for the second wizard page
    function registerContentPage2(page : azdata.window.WizardPage) {
        page.registerContent(async (view : azdata.ModelView) => {
            // Create text, input box, and button components:
            let textComponent : azdata.TextComponent = view.modelBuilder.text()
            .withProperties({
                value: 'Use input boxes and buttons to add interaction with users.'
            }).component();
            let inputBoxComponent : azdata.InputBoxComponent = view.modelBuilder.inputBox()
            .component();
            let buttonComponent : azdata.ButtonComponent = view.modelBuilder.button()
            .withProperties({ // Use withProperties() method to customize components
                width: 120,
                height: 30,
                label: 'Register Input'
            }).component();

            // To add actions to components, use "on" methods, such as "onDidClick"
            buttonComponent.onDidClick(params => {
                // Displays a message indicating the current contents of the inputBox
                //  at the time the button is clicked
                vscode.window.showInformationMessage(String(inputBoxComponent.value));
            })

            // Page components are organized in a tree structure. There must be a single
            //  component at the top, encompassing all others. For example, a group
            //  container:
            let groupContainer : azdata.GroupContainer = view.modelBuilder.groupContainer()
            .withItems([textComponent, inputBoxComponent, buttonComponent]).component();

            // Creates the page by passing the root component to the initializeModel method
            await view.initializeModel(groupContainer);
        });
    }

    // This functions registers sample content for the third wizard page
    function registerContentPage3(page : azdata.window.WizardPage) {
        page.registerContent(async (view : azdata.ModelView) => {
            // There are many components that contain other components, including
            //  groupContainers (used in page2), flexContainers, formContainers, divContainers.
            //  This page (page3) uses a formContainer:

            // Create the components inside the form:
            let textComponent : azdata.TextComponent = view.modelBuilder.text()
                .withProperties({
                value: 'Forms provide a clean layout to collect user input'}).component();
            let inputBoxComponent : azdata.InputBoxComponent = view.modelBuilder.inputBox()
                .component();
            let dropdownComponent = view.modelBuilder.dropDown()
                .withProperties({
                values: ['Option A', 'Option B', 'Option C']}).component();

            let button1 = view.modelBuilder.radioButton()
                .withProperties({ name: 'buttons', label: 'Button1'}).component();
            let button2 = view.modelBuilder.radioButton()
                .withProperties({ name: 'buttons', label: 'Button2'}).component();
            let radioButtons = view.modelBuilder.groupContainer().withItems([button1, button2])
                .component();

            // Initialize a 'show connection' button component
            let connectionButton : azdata.ButtonComponent = view.modelBuilder.button()
            .withProperties({
                width: 120,
                height: 30,
                label: 'Show Connection'
            }).component();

            connectionButton.onDidClick(() => onShowConnection());

            // Initialize a 'submit' button component
            let submitButton : azdata.ButtonComponent = view.modelBuilder.button()
            .withProperties({
                width: 120,
                height: 30,
                label: 'Submit and Clear'
            }).component();

            submitButton.onDidClick(() => onSubmit(inputBoxComponent, dropdownComponent, button1, button2));

            // Create the form using the above components:
            let formContainer = view.modelBuilder.formContainer().withFormItems([{
                component: textComponent,
                title: 'Text:'
            }, {
                component: inputBoxComponent,
                title: 'Input Box:'
            }, {
                component: dropdownComponent,
                title: 'Dropdown:'
            }, {
                component: radioButtons, title: 'Buttons:'
            }, {
                component: connectionButton, title: ''
            }, {
                component: submitButton, title: ''
            }], {componentWidth: 800}) // defining layout of the form
            .component();

            // Create the page
            await view.initializeModel(formContainer);
        });
    }

    // function called when submit button on tab2 is clicked
    function onSubmit(inputBox : azdata.InputBoxComponent, dropdown : azdata.DropDownComponent,
    button1 : azdata.RadioButtonComponent, button2 : azdata.RadioButtonComponent) {
        vscode.window.showInformationMessage('You entered: ' + inputBox.value + ' ' + dropdown.value);
        inputBox.value = undefined;
        dropdown.value = 'Option A';
        button1.checked = false;
        button2.checked = false;
    }

    // function called when show connection button on tab2 is clicked
    function onShowConnection() {
        azdata.connection.getCurrentConnection().then(connection => {
            let connectionId = connection ? connection.connectionId : 'No connection found!';
            vscode.window.showInformationMessage(connectionId);
        }, error => {
            console.info(error);
        });
    }
}

//------------------------------ Deactivating Your Extension ----------------------------------//

// this method is called when your extension is deactivated
export function deactivate() {
}