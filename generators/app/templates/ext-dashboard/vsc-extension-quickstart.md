# Welcome to your Azure Data Studio Extension

## Quick walkthrough of dashboard
![Homepage](/generators/app/templates/ext-dashboard/src/media/homepage.png)
![Tab](/generators/app/templates/ext-dashboard/src/media/tab.png)

## What's in the folder
* This folder contains all of the files necessary for your dashboard insight extension.
* `package.json` - this is the manifest file that defines the list of insights and new dashboard tabs for the extension. Open this in Azure Data Studio and edit the `contributes` section to add new features.
  * `dashboard.insights` section is where your insight definition is added. This is a bar chart insight by default. You can add additional insights here.
  * `dashboard.containers` section is where you can register containers for your dashboard. It accepts an object or an array of the object.
  * `dashboard.tabs` section is where you register a new "tab" or area in the dashboard for your extension, and include your new insight. If you select `No` for the `Add a full dashboard tab?` question this will not be added, and instead you can use the insight in other tabs / in the home tab.
  * `commands` section is where you register your commands. You can add or modify your command in this section. The functionalites of commands are defined in `src/controllers/mainControllers.js`.
  * `dashboard/toolbar` section is where you register a new homepage action according to the command you defined. If you select `No` for the `Add a homepage action?` question this will not be added, and instead you can register these actions in the dashboard toolbar.
  * `tasks-widget` section is where you register a new dashboard toolbar. If you select `No` for the `Add a dashboard toolbar?` question this will not be added, and instead you can register a navigation section.
  * `nav-section` section is where you create a navigation section. The default template comes with a webview.
* `src/controllers/mainController.js` - this is the file that you register commands and define functionalities of them.
* `src/controllers/webviewExample.html` - this is the html file that opened by default from the `Get Webview` command on the toolbar and also the default webview shown on the navigation section.
* `src/notebook/sample.ipynb` - this is the notebook file that opened by default from the `Get Notebook` command on the toolbar.
* `src/media/icon` - this is the folder of all the icons
* `src/sql` - this is the folder of all the query files that compose your first insight widget.



## Get up and running straight away
* Press `F5` to open a new window with your extension loaded.
* Right click your sever or databse and select manage to access your dashboard

## Make changes
* You can relaunch the extension from the debug toolbar after making changes to the files/folders listed above.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the Azure Data Studio window with your extension to load your changes.

## Install your extension
* To start using your extension with Azure Data Studio copy it into the `<user home>/.azuredatastudio/extensions` folder and restart Azure Data Studio.
* To share your extension with the world, read on https://github.com/microsoft/azuredatastudio/wiki/Getting-started-with-Extensibility about publishing an extension.
