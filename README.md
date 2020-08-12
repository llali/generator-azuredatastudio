# Azure Data Studio - Extension and Customization Generator

[![Twitter Follow](https://img.shields.io/twitter/follow/azuredatastudio?style=social)](https://twitter.com/azuredatastudio)

The Azure Data Studio Extension Generator is a Yeoman-based generator to help get you started with authoring extensions. There are 13 different possible templates for you to use.

## Install the Generator

Install Yeoman and the Azure Data Studio Extension generator by using the following command:

```bash
npm install -g yo generator-azuredatastudio
```

## Running the Generator
To launch the generator type:

```bash
yo azuredatastudio
```

The extension generator will walk you through the steps required to create your customized extension with prompting for any required information.

![The command generator](https://raw.githubusercontent.com/llali/generator-azuredatastudio/master/yoazuredatastudio.png)

To learn more about extension authoring, there are a few resources you can view. For an overview on the extension authoring process, see [Extension authoring](https://docs.microsoft.com/en-us/sql/azure-data-studio/extension-authoring?view=sql-server-ver15). For a tutorial using the Extension Generator to create an extension, view [Create an extension](https://docs.microsoft.com/en-us/sql/azure-data-studio/tutorial-create-extension?view=sql-server-ver15).

## Generator Output

These templates will:
* Create a base folder structure with extension-specific files
* Template out a rough `package.json` using your answers from the provided prompts
* Import any assets required for your extension e.g. tmBundles or the VS Code Library
* For Extensions: Set-up `launch.json` for running your extension and attaching to a process

## History

* 0.11.x: Added dashboard, notebook, Jupyter Book, and wizards/dialogues templates.
* 0.10.x: Generates a Azure Data Studio extension for TypeScript 1.8.10

## License

[MIT](LICENSE)
