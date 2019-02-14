# Yo SQL OPS - Extension and Customization Generator

We have written a Yeoman generator to help get you started. We plan to add templates for most extension/customization types into this.

## Install the Generator

Install Yeoman and the Azure Data Studio Extension generator:

```bash
npm install generator-sqlops
```

## Run Yo SQL OPS
The Yeoman generator will walk you through the steps required to create your customization or extension prompting for the required information.

To launch the generator simply type:

```bash
yo sqlops
```

![The command generator](https://raw.githubusercontent.com/llali/generator-azuredatastudio/master/yoazuredatastudio.PNG)

## Generator Output

These templates will
* Create a base folder structure
* Template out a rough `package.json`
* Import any assets required for your extension e.g. tmBundles or the VS Code Library
* For Extensions: Set-up `launch.json` for running your extension and attaching to a process

## History

* 0.10.x: Generates a Azure Data Studio extension for TypeScript 1.8.10

## License

[MIT](LICENSE)
