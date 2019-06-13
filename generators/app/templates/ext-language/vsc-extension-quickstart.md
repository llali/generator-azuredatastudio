# Welcome to your Azure Data Studio Extension

## What's in the folder
* This folder contains all of the files necessary for your extension.
* `package.json` - this is the manifest file in which you declare your language support and define
the location of the grammar file that has been copied into your extension.
* `syntaxes/<%= languageFileName %>` - this is the Text mate grammar file that is used for tokenization.
* `language-configuration.json` - this the language configuration, defining the tokens that are used for
comments and brackets.

## Get up and running straight away
* Make sure the language configuration settings in `language-configuration.json` are accurate.
* Press `F5` to open a new window with your extension loaded.
* Create a new file with a file name suffix matching your language.
* Verify that syntax highlighting works and that the language configuration settings are working.

## Make changes
* You can relaunch the extension from the debug toolbar after making changes to the files listed above.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the Azure Data Studio window with your extension to load your changes.

## Add more language features
* To add features such as intellisense, hovers and validators check out the Azure Data Studio extenders documentation at
https://code.visualstudio.com/docs

## Install your extension
* To start using your extension with Azure Data Studio copy it into the `<user home>/.azuredatastudio/extensions` folder and restart Azure Data Studio.
* To share your extension with the world, read on https://github.com/microsoft/azuredatastudio/wiki/Getting-started-with-Extensibility about publishing an extension.
