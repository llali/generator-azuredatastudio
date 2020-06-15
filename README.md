# Yo Azure Data Studio - Extension and Customization Generator

We have written a Yeoman generator to help get you started. We plan to add templates for most extension/customization types into this.

## Install the Generator

Install Yeoman and the Azure Data Studio Extension generator:

```bash
npm install generator-azuredatastudio
```

## Run Yo Azure Data Studio
The Yeoman generator will walk you through the steps required to create your customization or extension prompting for the required information.

To launch the generator simply type:

```bash
yo azuredatastudio
```

![The command generator](https://raw.githubusercontent.com/llali/generator-azuredatastudio/master/yoazuredatastudio.png)

## Generator Output

These templates will
* Create a base folder structure
* Template out a rough `package.json`
* Import any assets required for your extension e.g. tmBundles or the VS Code Library
* For Extensions: Set-up `launch.json` for running your extension and attaching to a process

## History

* 1.0.0: Generates a VS Code extension for TypeScript 2.0.3
* 0.10.x: Generates a VS Code extension for TypeScript 1.8.10

## License

[MIT](LICENSE)
