# Welcome to your Azure Data Studio Extension

## What's in the folder
* This folder contains all of the files necessary for your Wizard or Dialog extension.
* `package.json` - this is the manifest file in which you declare your extension and the command to launch a Wizard or Dialog.
The sample plugin registers the command `Launch Wizard` / `Launch Dialog`. With this information, Azure Data Studio can show the command in the command palette. It also defines the `main.js` file as the primary entry point for your extension.
* `src/main.ts` - this is the main file that provides the implementation of the `Launch Wizard` / `Launch Dialog` command. It generates a sample Wizard / Dialog which you can edit.
The file exports two functions, `activate`, which is called the very first time your extension is
activated, and `deactivate`, which is called when your extension is deactivated. Inside the `activate` function we call `registerCommand`, which contains the implementation of your Wizard / Dialog.
* `src/wizard` (optional) - this folder is not included in the Getting Started Template, but is in the more elaborate Sample Wizard templates. It houses the UI and models that back these Wizards.
  * `src/wizard/api` - this folder includes the model that the Wizard uses to communicate accross pages. Also includes base page which all other Wizard pages extend.
  * `src/wizard/pages` - this folder contains all of the individual Wizard pages (page1.ts, page2.ts) that are to be displayed
  * `src/wizard/wizard.ts` - this file creates and exports the Wizard. It defines wizard properties such as the pages and actions to be performed on page change.

## Get up and running straight away
* Press `F5` to open a new window with your extension loaded.
* Run your command from the command palette by pressing (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and typing `Launch Wizard` or `Launch Dialog`, depending on your extension type.
* Read the code and comments in `src/main.ts` for in-depth explanations of how the Wizard / Dialog is generated.

## Make changes
* You can relaunch the extension from the debug toolbar after changing code in `src/main.ts`.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the Azure Data Studio window with your extension to load your changes.

## Explore the API
* You can open the full set of our API when you open the file:
  * SQL specific APIs: `node_modules/azdata/azdata.d.ts`.
  * Other APIs: `node_modules/vscode/vscode.d.ts`.

## Wizards and Dialogs API Overview
* **Creating Wizards and Dialogs:** Wizards include wizard pages, and Dialogs include dialog tabs. To create Wizards, wizard pages, Dialogs, and dialog tabs, use the `azdata.window` namespace. For example: `let wizard = azdata.window.createWizard('Sample Wizard')`.
* **Adding UI:** To add UI components to wizard pages and dialog tabs, call the `registerContent` function on your pages / tabs. For example: `wizardPage.registerContent(async (view) => { <code to create components> });`. Inside this function, you will declare and customize components using the `view` parameter.
* **Declaring UI Components:** The APIs offer a wide range of components, including text, buttons, dropdowns, input boxes, as well as containers that contain components. Create them using the ModelView's modelBuilder. For example, to declare an input box component: `let input = view.modelBuilder.inputBox().component()`
* **Customizing UI Components:** To customize a UI component, call it's `withProperties` method. For example, `let inputBox = view.modelBuilder.inputBox().withProperties({ placeHolder: 'Enter Text'}).component();` declares an inputBox component with the placeholder 'Enter Text'
* **Adding Actions to Components:** To add actions to components, use built-in listener functions, such as `dropdown.onValueChanged((params) => {})` or `button.onClick((params) => {})`.
* **Nesting Components:** The APIs offer container components that house other components, so that components can be organized in a tree structure. These container components include flexContainers, formContainers, and groupContainers. Place all components in a given page or tab under a single encompassing container component, called the `root component`.
* **Initializing the View:** In the `registerContent` function, after you have declared and customized components, initialize the Model View like so: `async view.initializeModel(<root component>);`.
* **Open the Wizard / Dialog:** Call `open()` on your Wizard or Dialog once you are ready for it to display.

## Run tests
* Open the debug viewlet (`Ctrl+Shift+D` or `Cmd+Shift+D` on Mac) and from the launch configuration dropdown pick `Launch Tests`.
* Press `F5` to run the tests in a new window with your extension loaded.
* See the output of the test result in the debug console.
* Make changes to `test/extension.test.ts` or create new test files inside the `test` folder.
    * By convention, the test runner will only consider files matching the name pattern `**.test.ts`.
    * You can create folders inside the `test` folder to structure your tests any way you want.
