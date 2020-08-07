'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'; // Refer to `node_modules/@types/vscode/index.d.ts` for full API

// The module 'azdata' contains the Azure Data Studio extensibility API
// This is a complementary set of APIs that add SQL / Data-specific functionality to the app
// Import the module and reference it with the alias azdata in your code below.
import * as azdata from 'azdata'; // Refer to `node_modules/@types/azdata/index.d.ts` for full API

// Refer to https://github.com/Microsoft/azuredatastudio/blob/main/src/sql/azdata.d.ts
// for full API documentation

//--------------------------------- Activating Your Extension ----------------------------------//

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    //----------------------------- Creating the Dialog --------------------------------------//

    // The command has been defined in the package.json file
    // This method defines what occurs when the command is entered in the ADS command palette
    context.subscriptions.push(vscode.commands.registerCommand('<%= name %>.launch<%= wizardOrDialog %>', () => {
        // Create dialog
        let dialog : azdata.window.Dialog = azdata.window.createModelViewDialog('Sample Dialog');
        // Create dialog tabs
        let tab1 : azdata.window.DialogTab = azdata.window.createTab("Tab 1");
        let tab2 : azdata.window.DialogTab = azdata.window.createTab("Tab 2");
        // Populate dialog tabs with content
        registerTab1Content(tab1);
        registerTab2Content(tab2);

        dialog.content = [tab1, tab2]; // set dialog's content field to the dialog tabs
        dialog.registerCloseValidator(() => { // set callback function to be called when dialog is closed
            vscode.window.showInformationMessage('Dialog closed!');
            return true;
        })
        azdata.window.openDialog(dialog); // open dialog
    }));

    //----------------------------- Populating Dialog Tabs ------------------------------//

    // This functions registers sample content for the first dialog tab
    function registerTab1Content(tab : azdata.window.DialogTab) {
        tab.registerContent(async (view : azdata.ModelView) => {
            // Initialize a text component. Note the use of the builder pattern via modelBuilder.
            //  This means the text component is not created until component()
            //  method is called.
            let textComponent : azdata.TextComponent = view.modelBuilder.text()
            .withProperties({ // Use withProperties() method to customize components
                value: 'Type in the box and press \'Register Input\'!'
            }).component();

            // Intialize an input box that the user can type in
            let inputBoxComponent : azdata.InputBoxComponent = view.modelBuilder.inputBox()
            .component();
            // Initialize a button component
            let buttonComponent : azdata.ButtonComponent = view.modelBuilder.button()
            .withProperties({
                width: 120,
                height: 30,
                label: 'Register Input'
            }).component();

            // To add actions to components, use "on" methods, such as "onDidClick"
            buttonComponent.onDidClick(() => {
                // Display a message indicating the current contents of the inputBox
                //  at the time the button is clicked
                vscode.window.showInformationMessage(String(inputBoxComponent.value));
            })

            // Tab components are organized in a tree structure. There must be a single
            //  "root" component at the top, encompassing all others
            let groupContainer : azdata.GroupContainer = view.modelBuilder.groupContainer()
            .withItems([textComponent, inputBoxComponent, buttonComponent]).component();

            // Creates the tab by passing the root component to the initializeModel method
            await view.initializeModel(groupContainer);
        });
    }

    // This functions registers sample content for the second dialog tab
    function registerTab2Content(tab : azdata.window.DialogTab) {
        tab.registerContent(async (view : azdata.ModelView) => {
            // There are many group components that contain other components, including
            //  groupContainers, flexContainers, formContainers, divContainers. This tab
            //  uses a formContainer

            // Create the components inside the form:
            let textComponent : azdata.TextComponent = view.modelBuilder.text()
                .withProperties({
            value: 'Forms provide a clean layout to collect user input'}).component();
            let inputBoxComponent : azdata.InputBoxComponent = view.modelBuilder.inputBox()
                .component();
            let dropdownComponent : azdata.DropDownComponent = view.modelBuilder.dropDown()
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
            let formContainer : azdata.FormContainer = view.modelBuilder.formContainer().withFormItems([{
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
            }], {componentWidth: 300}) // defining layout of the form
            .component();

            // Initialize the model with the form container as the root component
            await view.initializeModel(formContainer);
        });

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
}

//------------------------------ Deactivating Your Extension ----------------------------------//

// this method is called when your extension is deactivated
export function deactivate() {
}