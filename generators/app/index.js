/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

let Generator = require('yeoman-generator');
let yosay = require('yosay');
let os = require('os');
let fileSys = require('fs');
let path = require('path');
let validator = require('./validator');
let snippetConverter = require('./snippetConverter');
let themeConverter = require('./themeConverter');
let grammarConverter = require('./grammarConverter');
let notebookConverter = require('./notebookConverter');
let env = require('./env');
let childProcess = require('child_process');
let chalk = require('chalk');
let sanitize = require("sanitize-filename");
let localization = require('./localization');
module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.option('extensionType', { type: String });
        this.option('extensionName', { type: String });
        this.option('extensionDescription', { type: String });
        this.option('extensionDisplayName', { type: String });

        this.option('extensionParam', { type: String });
        this.option('extensionParam2', { type: String });

        this.extensionConfig = Object.create(null);
        this.extensionConfig.installDependencies = false;

        this.abort = false;
    }

    initializing() {

        // Welcome
        this.log(yosay('Welcome to the Azure Data Studio Extension Generator!'));// {{ADS EDIT}}

        // evaluateEngineVersion
        let extensionConfig = this.extensionConfig;
        extensionConfig.azdataEngine = env.azdataVersion;// {{ADS EDIT}}
        extensionConfig.vsCodeEngine = '^1.19.0';
        return env.getLatestVSCodeVersion()
            .then(function (version) { extensionConfig.vsCodeEngine = version; });
        // TODO add tool to get latest Azure Data Studio verison on machine and set this too
    }

    prompting() {
        let generator = this;

        let prompts = {
            // Ask for extension type
            askForType: () => {
                let extensionType = generator.options['extensionType'];
                if (extensionType) {
                    let extensionTypes = ['dashboard', 'colortheme', 'language', 'snippets', 'command-ts', 'command-js', 'extensionpack', 'notebook', 'jupyterbook', 'wizards']; // {{ADS EDIT}}
                    if (extensionTypes.indexOf(extensionType) !== -1) {
                        generator.extensionConfig.type = 'ext-' + extensionType;
                    } else {
                        generator.log("Invalid extension type: " + extensionType + '. Possible types are :' + extensionTypes.join(', '));
                    }
                    return Promise.resolve();
                }

                return generator.prompt({
                    type: 'list',
                    name: 'type',
                    message: 'What type of extension do you want to create?',
                    choices: [{
                        name: 'New Extension (TypeScript)',
                        value: 'ext-command-ts'
                    },
                    {
                        name: 'New Extension (JavaScript)',
                        value: 'ext-command-js'
                    },
                    {
                        name: 'New Dashboard',// {{ADS EDIT}}
                        value: 'ext-dashboard'// {{ADS EDIT}}
                    },
                    {
                        name: 'New Color Theme',
                        value: 'ext-colortheme'
                    },
                    {
                        name: 'New Language Support',
                        value: 'ext-language'
                    },
                    {
                        name: 'New Code Snippets',
                        value: 'ext-snippets'
                    },
                    {
                        name: 'New Keymap',
                        value: 'ext-keymap'
                    },
                    {
                        name: 'New Extension Pack',
                        value: 'ext-extensionpack'
                    },
                    {
                        name: 'New Language Pack (Localization)',
                        value: 'ext-localization'
                    },
                    {
                        name: 'New Wizard or Dialog', // {{ADS EDIT}}
                        value: 'ext-wizard'
                    }
                        ,
                    {
                        name: 'New Notebooks (Individual)', // {{ADS EDIT}}
                        value: 'ext-notebook'
                    },
                    {
                        name: 'New Jupyter Book', // {{ADS EDIT}}
                        value: 'ext-jupyterbook'
                    }
                    ]
                }).then(typeAnswer => {
                    generator.extensionConfig.type = typeAnswer.type;
                });
            },

            askForWizardOrDialogType: () => { // {{ADS EDIT}}
                if (generator.extensionConfig.type !== 'ext-wizard') {
                    return Promise.resolve();
                }
                generator.extensionConfig.isCustomization = true;
                return generator.prompt({
                    type: 'list',
                    name: 'wizardOrDialog',
                    message: 'Do you want to create a Wizard or a Dialog Extension?',
                    choices: [
                        {
                            name: 'Wizard',
                            value: 'Wizard'
                        },
                        {
                            name: 'Dialog',
                            value: 'Dialog'
                        }
                    ]
                }).then(answer => {
                    let type = answer.wizardOrDialog;
                    generator.extensionConfig.wizardOrDialog = type;
                    if (type === 'Wizard') {
                        return generator.prompt({
                            type: 'list',
                            name: 'wizardType',
                            message: 'Choose a Wizard Template:',
                            choices: [
                                {
                                    name: 'Getting Started Template',
                                    value: 'standard'
                                },
                                {
                                    name: 'Sample Wizard: File Saving',
                                    value: 'file-saving'
                                },
                                {
                                    name: 'Sample Wizard: Database Operations',
                                    value: 'db-ops'
                                }
                            ]
                        }).then(typeAnswer => {
                            generator.extensionConfig.wizardType = typeAnswer.wizardType;
                        });
                    } else { // type === 'Dialog'
                        generator.extensionConfig.dialogType = 'standard';
                    }
                });
            },

            askForThemeInfo: () => {
                if (generator.extensionConfig.type !== 'ext-colortheme') {
                    return Promise.resolve();
                }
                generator.extensionConfig.isCustomization = true;
                return generator.prompt({
                    type: 'list',
                    name: 'themeImportType',
                    message: 'Do you want to import or convert an existing TextMate color theme?',
                    choices: [
                        {
                            name: 'No, start fresh',
                            value: 'new'
                        },
                        {
                            name: 'Yes, import an existing theme but keep it as tmTheme file.',
                            value: 'import-keep'
                        },
                        {
                            name: 'Yes, import an existing theme and inline it in the Visual Studio Code color theme file.',
                            value: 'import-inline'
                        }
                    ]
                }).then(answer => {
                    let type = answer.themeImportType;
                    if (type === 'import-keep' || type === 'import-inline') {
                        generator.log("Enter the location (URL (http, https) or file name) of the tmTheme file, e.g., http://www.monokai.nl/blog/wp-content/asdev/Monokai.tmTheme.");
                        return generator.prompt({
                            type: 'input',
                            name: 'themeURL',
                            message: 'URL or file name to import:'
                        }).then(urlAnswer => {
                            return themeConverter.convertTheme(urlAnswer.themeURL, generator.extensionConfig, type === 'import-inline', generator);
                        });
                    } else {
                        return themeConverter.convertTheme(null, generator.extensionConfig, false, generator);
                    }
                });
            },

            askForLanguageInfo: () => {
                if (generator.extensionConfig.type !== 'ext-language') {
                    return Promise.resolve();
                }

                generator.extensionConfig.isCustomization = true;
                generator.log("Enter the URL (http, https) or the file path of the tmLanguage grammar or press ENTER to start with a new grammar.");
                return generator.prompt({
                    type: 'input',
                    name: 'tmLanguageURL',
                    message: 'URL or file to import, or none for new:',
                }).then(urlAnswer => {
                    return grammarConverter.convertGrammar(urlAnswer.tmLanguageURL, generator.extensionConfig);
                });
            },

            askForSnippetsInfo: () => {
                if (generator.extensionConfig.type !== 'ext-snippets') {
                    return Promise.resolve();
                }

                generator.extensionConfig.isCustomization = true;
                let extensionParam = generator.options['extensionParam'];

                if (extensionParam) {
                    let count = snippetConverter.processSnippetFolder(extensionParam, generator);
                    if (count <= 0) {
                        generator.log('')
                    }
                    return Promise.resolve();
                }
                generator.log("Folder location that contains Text Mate (.tmSnippet) and Sublime snippets (.sublime-snippet) or press ENTER to start with a new snippet file.");

                let snippetPrompt = () => {
                    return generator.prompt({
                        type: 'input',
                        name: 'snippetPath',
                        message: 'Folder name for import or none for new:'
                    }).then(snippetAnswer => {
                        let count = 0;
                        let snippetPath = snippetAnswer.snippetPath;

                        if (typeof snippetPath === 'string' && snippetPath.length > 0) {
                            const count = snippetConverter.processSnippetFolder(snippetPath, generator);
                            if (count <= 0) {
                                return snippetPrompt();
                            }
                        } else {
                            generator.extensionConfig.snippets = {};
                            generator.extensionConfig.languageId = null;
                        }

                        if (count < 0) {
                            return snippetPrompt();
                        }
                    });
                };
                return snippetPrompt();
            },

            askForLocalizationLanguageId: () => {
                return localization.askForLanguageId(generator);
            },

            askForLocalizationLanguageName: () => {
                return localization.askForLanguageName(generator);
            },

            askForLocalizedLocalizationLanguageName: () => {
                return localization.askForLocalizedLanguageName(generator);
            },

            askForExtensionPackInfo: () => {
                if (generator.extensionConfig.type !== 'ext-extensionpack') {
                    return Promise.resolve();
                }

                generator.extensionConfig.isCustomization = true;
                const defaultExtensionList = ['publisher.extensionName'];

                const getExtensionList = () =>
                    new Promise((resolve, reject) => {
                        childProcess.exec(
                            'code --list-extensions',
                            (error, stdout, stderr) => {
                                if (error) {
                                    generator.env.error(error);
                                } else {
                                    let out = stdout.trim();
                                    if (out.length > 0) {
                                        generator.extensionConfig.extensionList = out.split(/\s/);
                                    }
                                }
                                resolve();
                            }
                        );
                    });

                const extensionParam = generator.options['extensionParam'];
                if (extensionParam) {
                    switch (extensionParam.toString().trim().toLowerCase()) {
                        case 'n':
                            generator.extensionConfig.extensionList = defaultExtensionList;
                            return Promise.resolve();
                        case 'y':
                            return getExtensionList();
                    }
                }

                return generator.prompt({
                    type: 'confirm',
                    name: 'addExtensions',
                    message: 'Add the currently installed extensions to the extension pack?',
                    default: true
                }).then(addExtensionsAnswer => {
                    generator.extensionConfig.extensionList = defaultExtensionList;
                    if (addExtensionsAnswer.addExtensions) {
                        return getExtensionList();
                    }
                });
            },

            askForHomepageAction: () => {// {{ADS EDIT}}
                if (generator.extensionConfig.type !== 'ext-dashboard') {
                    return Promise.resolve();
                }

                generator.extensionConfig.isCustomization = true;

                return generator.prompt({
                    type: 'confirm',
                    name: 'addHomepageAction',
                    message: 'Add a homepage action?',
                    default: true
                }).then(function (answer) {
                    generator.extensionConfig.addHomepageAction = answer.addHomepageAction;
                });
            },

            askForDashboardTab: () => {// {{ADS EDIT}}
                if (generator.extensionConfig.type !== 'ext-dashboard') {
                    return Promise.resolve();
                }

                generator.extensionConfig.isCustomization = true;

                return generator.prompt({
                    type: 'confirm',
                    name: 'addDashboardExtension',
                    message: 'Add a full dashboard tab?',
                    default: true
                }).then(function (answer) {
                    generator.extensionConfig.addDashboardTab = answer.addDashboardExtension;
                    generator.extensionConfig.insightName = generator.extensionConfig.name + '.insight';
                    generator.extensionConfig.tabName = generator.extensionConfig.name + '.tab';
                    if (!generator.extensionConfig.addDashboardTab) {
                        generator.extensionConfig.addDashboardBar = false;
                    }
                });
            },

            askForServerTab: () => {// {{ADS EDIT}}
                if (generator.extensionConfig.type !== 'ext-dashboard' || !generator.extensionConfig.addDashboardTab) {
                    return Promise.resolve();
                }

                generator.extensionConfig.isCustomization = true;

                return generator.prompt({
                    type: 'confirm',
                    name: 'addServerTab',
                    message: 'Add the dashboard tab on server?',
                    default: true
                }).then(function (answer) {
                    generator.extensionConfig.addServerTab = answer.addServerTab;
                });
            },

            askForDatabaseTab: () => {// {{ADS EDIT}}
                if (generator.extensionConfig.type !== 'ext-dashboard' || !generator.extensionConfig.addDashboardTab) {
                    return Promise.resolve();
                }

                generator.extensionConfig.isCustomization = true;

                return generator.prompt({
                    type: 'confirm',
                    name: 'addDatabaseTab',
                    message: 'Add the dashboard tab on database?',
                    default: true
                }).then(function (answer) {
                    generator.extensionConfig.addDatabaseTab = answer.addDatabaseTab;
                    generator.extensionConfig.addDashboardTab = generator.extensionConfig.addDatabaseTab || generator.extensionConfig.addServerTab;
                });
            },

            askForTabGroup: () => {// {{ADS EDIT}}
                if (generator.extensionConfig.type !== 'ext-dashboard' || !generator.extensionConfig.addDashboardTab) {
                    return Promise.resolve();
                }

                generator.extensionConfig.isCustomization = true;

                return generator.prompt({
                    type: 'list',
                    name: 'tabGroup',
                    message: 'Which group to place the tab?',
                    choices: [
                        {
                            name: "General",
                            value: ""
                        },
                        {
                            name: "Administration",
                            value: "administration"
                        },
                        {
                            name: "Monitoring",
                            value: "monitoring"
                        },
                        {
                            name: "Performance",
                            value: "performance"
                        },

                        {
                            name: "Security",
                            value: "security"
                        },

                        {
                            name: "Troubleshooting",
                            value: "troubleshooting"
                        },

                        {
                            name: "Settings",
                            value: "settings"
                        }
                    ]
                }).then(function (answer) {
                    generator.extensionConfig.tabGroup = answer.tabGroup;
                });
            },

            askForDashboardBar: () => {// {{ADS EDIT}}
                if (generator.extensionConfig.type !== 'ext-dashboard' || !generator.extensionConfig.addDashboardTab) {
                    return Promise.resolve();
                }

                generator.extensionConfig.isCustomization = true;

                return generator.prompt({
                    type: 'confirm',
                    name: 'addDashboardBar',
                    message: 'Add a dashboard toolbar?',
                    default: true
                }).then(function (answer) {
                    generator.extensionConfig.addDashboardBar = answer.addDashboardBar;
                    generator.extensionConfig.addNavSection = false;
                });
            },

            askForNavSection: () => {// {{ADS EDIT}}
                if (generator.extensionConfig.type !== 'ext-dashboard' || generator.extensionConfig.addDashboardBar || !generator.extensionConfig.addDashboardTab) {
                    return Promise.resolve();
                }

                generator.extensionConfig.isCustomization = true;

                return generator.prompt({
                    type: 'confirm',
                    name: 'addNavSection',
                    message: 'Add a navigation section?',
                    default: true
                }).then(function (answer) {
                    generator.extensionConfig.addNavSection = answer.addNavSection;
                });
            },

            // Ask for extension display name ("displayName" in package.json)
            askForExtensionDisplayName: () => {
                let extensionDisplayName = generator.options['extensionDisplayName'];
                if (extensionDisplayName) {
                    generator.extensionConfig.displayName = extensionDisplayName;
                    return Promise.resolve();
                }

                return generator.prompt({
                    type: 'input',
                    name: 'displayName',
                    message: 'What\'s the display name of your extension?',
                    default: "My Test Extension"
                }).then(displayNameAnswer => {
                    generator.extensionConfig.displayName = displayNameAnswer.displayName;
                });
            },

            askForPublisherName: () => {
                return generator.prompt({
                    type: 'input',
                    name: 'publisherName',
                    message: 'What\'s the publisher name for your extension?',
                    default: "Microsoft",
                    validate: validator.validateNonEmpty,
                }).then(publisherAnswer => {
                    generator.extensionConfig.publisherName = publisherAnswer.publisherName;
                });
            },

            // Ask for extension id ("name" in package.json)
            askForExtensionId: () => {
                let extensionName = generator.options['extensionName'];
                if (extensionName) {
                    generator.extensionConfig.name = extensionName;
                    return Promise.resolve();
                }
                let def = generator.extensionConfig.name;
                if (!def && generator.extensionConfig.displayName) {
                    def = generator.extensionConfig.displayName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                }
                if (!def) {
                    def == '';
                }

                return generator.prompt({
                    type: 'input',
                    name: 'name',
                    message: `What\'s the unique identifier for your extension? (Appears as ${generator.extensionConfig.publisherName}.your-identifier)`,
                    default: def,
                    validate: validator.validateExtensionId
                }).then(nameAnswer => {
                    generator.extensionConfig.name = nameAnswer.name;
                });
            },

            // Ask for extension description
            askForExtensionDescription: () => {
                let extensionDescription = generator.options['extensionDescription'];
                if (extensionDescription) {
                    generator.extensionConfig.description = extensionDescription;
                    return Promise.resolve();
                }

                return generator.prompt({
                    type: 'input',
                    name: 'description',
                    message: 'What\'s the description of your extension?'
                }).then(descriptionAnswer => {
                    generator.extensionConfig.description = descriptionAnswer.description;
                });
            },

            askForJavaScriptInfo: () => {
                if (generator.extensionConfig.type !== 'ext-command-js' && generator.extensionConfig.type !== 'ext-dashboard') {
                    return Promise.resolve();
                }
                generator.extensionConfig.checkJavaScript = false;
                return generator.prompt({
                    type: 'confirm',
                    name: 'checkJavaScript',
                    message: 'Enable JavaScript type checking in \'jsconfig.json\'?',
                    default: false
                }).then(strictJavaScriptAnswer => {
                    generator.extensionConfig.checkJavaScript = strictJavaScriptAnswer.checkJavaScript;
                });
            },

            askForGit: () => {
                if (['ext-command-ts', 'ext-command-js', 'ext-wizard'].indexOf(generator.extensionConfig.type) === -1) {
                    return Promise.resolve();
                }

                return generator.prompt({
                    type: 'confirm',
                    name: 'gitInit',
                    message: 'Initialize a git repository?',
                    default: true
                }).then(gitAnswer => {
                    generator.extensionConfig.gitInit = gitAnswer.gitInit;
                });
            },

            // {{ADS EDIT}}
            askForExistingNotebooks: () => {
                if (generator.extensionConfig.type !== 'ext-notebook') {
                    return Promise.resolve();
                }

                return generator.prompt({
                    type: 'confirm',
                    name: 'addNotebooks',
                    message: 'Add existing notebooks to be shipped?',
                    default: true
                }).then(existingNotebook => {
                    generator.extensionConfig.addNotebooks = existingNotebook.addNotebooks;
                });
            },

            // {{ADS EDIT}}
            askForNotebooks: async () => {
                if (generator.extensionConfig.type !== 'ext-notebook') {
                    return Promise.resolve();
                }

                if (generator.extensionConfig.addNotebooks) {
                    return generator.prompt({
                        type: 'input',
                        name: 'notebookPath',
                        message: 'Provide the absolute path to the folder containing your notebooks.',
                        default: os.homedir()
                    }).then(pathResponse => {
                        generator.extensionConfig.notebookNames = [];
                        generator.extensionConfig.notebookPaths = [];
                        generator.extensionConfig.notebookLocation = pathResponse.notebookPath;
                        return notebookConverter.processNotebookFolder(pathResponse.notebookPath, generator);
                    })
                }
                else {
                    return generator.prompt({
                        type: 'list',
                        name: 'selectType',
                        message: 'Select a sample notebook to start with:',
                        choices: [{
                            name: 'SQL',
                            value: 'notebook-sql'
                        },
                        {
                            name: 'Python',
                            value: 'notebook-python'
                        }]
                    }).then(notebookType => {
                        generator.extensionConfig.notebookType = notebookType.selectType;
                    });
                }
            },

            askForNotebookFiles: async () => {
                if (generator.extensionConfig.type !== 'ext-notebook') {
                    return Promise.resolve();
                }

                if (generator.extensionConfig.addNotebooks){
                    let availableChoices = generator.extensionConfig.notebookNames;
                    return generator.prompt([{
                        type: 'checkbox',
                        name: 'notebookFiles',
                        message: `Select which notebooks you would like to include:`,
                        choices: availableChoices
                    }]).then(fileAnswer => {
                        generator.extensionConfig.notebookFiles = fileAnswer.notebookFiles;
                    })
                }
            },

            // {{ADS EDIT}}
            askForExistingBook: async () => {
                if (generator.extensionConfig.type !== 'ext-jupyterbook') {
                    return Promise.resolve();
                }

                return generator.prompt({
                    type: 'confirm',
                    name: 'addBooks',
                    message: 'Add an existing Jupyter Book to be shipped?',
                    default: true
                }).then(existingBookAnswer => {
                    generator.extensionConfig.addBooks = existingBookAnswer.addBooks;
                });
            },

            // {{ADS EDIT}}
            askForBookCreation: () => {
                if (generator.extensionConfig.type !== 'ext-jupyterbook') {
                    return Promise.resolve();
                }

                if (!generator.extensionConfig.addBooks) {
                    return generator.prompt({
                        type: 'confirm',
                        name: 'createBook',
                        message: 'Do you have existing notebooks you would like to create a Jupyter Book out of?',
                        default: true
                    }).then(creationAnswer => {
                        generator.extensionConfig.createBook = creationAnswer.createBook;
                    });
                } else {
                    return generator.prompt({
                        type: 'input',
                        name: 'bookLocation',
                        message: 'Provide the absolute path to the folder containing your Jupyter Book:',
                        default: os.homedir(),
                        validate: validator.validateJupyterBook
                    }).then(locationResponse => {
                        let tempPath = path.normalize(locationResponse.bookLocation);
                        generator.extensionConfig.bookLocation = tempPath;
                        generator.extensionConfig.notebookNames = [];
                        generator.extensionConfig.notebookPaths = [];
                        generator.extensionConfig.notebookFolders = [];
                        return notebookConverter.processBookFolder(tempPath, generator);
                    });
                }
            },

            askForBookFiles: async () => {
                if (generator.extensionConfig.type !== 'ext-jupyterbook') {
                    return Promise.resolve();
                }

                if (generator.extensionConfig.addBooks){
                    let availableChoices = fileSys.readdirSync(generator.extensionConfig.bookLocation);
                    return generator.prompt([{
                        type: 'checkbox',
                        name: 'bookFiles',
                        message: `Select which files you would like to include:`,
                        choices: availableChoices
                    }]).then(fileAnswer => {
                        generator.extensionConfig.bookFiles = fileAnswer.bookFiles;
                    })
                }
            },

            // {{ADS EDIT}}
            askForBookConversion: async () => {
                if (generator.extensionConfig.type !== 'ext-jupyterbook') {
                    return;
                }

                if (generator.extensionConfig.createBook) {
                    const answers = await generator.prompt([
                        {
                            type: 'input',
                            name: 'notebookPath',
                            message: 'Provide the absolute path to the folders where your notebooks currently exist.',
                            default: os.homedir(),
                            validate: validator.validateFilePath,
                        }
                    ]);


                    answers.notebookPath = path.normalize(answers.notebookPath);
                    Object.assign(generator.extensionConfig, answers);

                    let tempPath = path.normalize(generator.extensionConfig.notebookPath);
                    generator.extensionConfig.notebookNames = [];
                    generator.extensionConfig.notebookPaths = [];
                    notebookConverter.processNotebookFolder(tempPath, generator);
                }
            },

            // {{ADS EDIT}}
            askForComplexBook: async () => {
                if (generator.extensionConfig.createBook) {
                    const bookSections = await generator.prompt([
                        {
                            type: 'input',
                            name: 'numberSections',
                            message: 'How many chapters would you like in your book?',
                            default: 2,
                            validate: validator.validateNumber,
                        },
                        {
                            type: 'input',
                            name: 'rawChapterNames',
                            message: 'List the name(s) of your chapter(s), separated by a comma for each new chapter. (e.g.:\'1 - Chapter 1, 2 - Chapter 2\')',
                            validate: validator.validateNonEmpty
                        },
                    ]);
                    let folderNames = [];
                    let chapterNames = [];
                    bookSections.rawChapterNames = bookSections.rawChapterNames.split(',');
                    bookSections.rawChapterNames.forEach(name => {
                        let trimmedStr = name.trim();
                        chapterNames.push(name.trim())
                        let regexSection = trimmedStr.replace(/[^a-zA-Z0-9]/g, '-');
                        folderNames.push(regexSection);
                    })
                    Object.assign(generator.extensionConfig, bookSections);
                    generator.extensionConfig.folderNames = folderNames;
                    generator.extensionConfig.chapterNames = chapterNames;
                }
            },

            askForNotebooksinSections: async () => {
                if (generator.extensionConfig.createBook) {
                    let availableSectionNames = generator.extensionConfig.notebookNames;
                    let chapterNames = generator.extensionConfig.chapterNames;
                    let folderNames = generator.extensionConfig.folderNames;
                    let availableChoices = [], organizedNotebooks = [];
                    availableSectionNames.forEach(name => {
                        availableChoices.push({ "name": name });
                    });

                    for (let i = 0; i < chapterNames.length; i++) {
                        const response = await generator.prompt([{
                            type: 'checkbox',
                            name: folderNames[i],
                            message: `Select notebooks for your chapter, ${chapterNames[i]}:`,
                            choices: availableChoices
                        }]);

                        organizedNotebooks.push(response);
                        availableSectionNames = availableSectionNames.filter(element => !response[folderNames[i]].includes(element));
                        availableChoices = [];
                        availableSectionNames.forEach(name => {
                            availableChoices.push({ "name": name });
                        });

                    }
                    generator.extensionConfig.organizedNotebooks = organizedNotebooks;
                }
            },

            askForThemeName: () => {
                if (generator.extensionConfig.type !== 'ext-colortheme') {
                    return Promise.resolve();
                }

                return generator.prompt({
                    type: 'input',
                    name: 'themeName',
                    message: 'What\'s the name of your theme shown to the user?',
                    default: generator.extensionConfig.themeName,
                    validate: validator.validateNonEmpty
                }).then(nameAnswer => {
                    generator.extensionConfig.themeName = nameAnswer.themeName;
                });
            },

            askForBaseTheme: () => {
                if (generator.extensionConfig.type !== 'ext-colortheme') {
                    return Promise.resolve();
                }

                return generator.prompt({
                    type: 'list',
                    name: 'themeBase',
                    message: 'Select a base theme:',
                    choices: [{
                        name: "Dark",
                        value: "vs-dark"
                    },
                    {
                        name: "Light",
                        value: "vs"
                    },
                    {
                        name: "High Contrast",
                        value: "hc-black"
                    }
                    ]
                }).then(themeBase => {
                    generator.extensionConfig.themeBase = themeBase.themeBase;
                });
            },

            askForLanguageId: () => {
                if (generator.extensionConfig.type !== 'ext-language') {
                    return Promise.resolve();
                }

                generator.log('Enter the id of the language. The id is an identifier and is single, lower-case name such as \'php\', \'javascript\'');
                return generator.prompt({
                    type: 'input',
                    name: 'languageId',
                    message: 'Language id:',
                    default: generator.extensionConfig.languageId,
                }).then(idAnswer => {
                    generator.extensionConfig.languageId = idAnswer.languageId;
                });
            },

            askForLanguageName: () => {
                if (generator.extensionConfig.type !== 'ext-language') {
                    return Promise.resolve();
                }

                generator.log('Enter the name of the language. The name will be shown in the VS Code editor mode selector.');
                return generator.prompt({
                    type: 'input',
                    name: 'languageName',
                    message: 'Language name:',
                    default: generator.extensionConfig.languageName,
                }).then(nameAnswer => {
                    generator.extensionConfig.languageName = nameAnswer.languageName;
                });
            },

            askForLanguageExtensions: () => {
                if (generator.extensionConfig.type !== 'ext-language') {
                    return Promise.resolve();
                }

                generator.log('Enter the file extensions of the language. Use commas to separate multiple entries (e.g. .ruby, .rb)');
                return generator.prompt({
                    type: 'input',
                    name: 'languageExtensions',
                    message: 'File extensions:',
                    default: generator.extensionConfig.languageExtensions.join(', '),
                }).then(extAnswer => {
                    generator.extensionConfig.languageExtensions = extAnswer.languageExtensions.split(',').map(e => { return e.trim(); });
                });
            },

            askForLanguageScopeName: () => {
                if (generator.extensionConfig.type !== 'ext-language') {
                    return Promise.resolve();
                }
                generator.log('Enter the root scope name of the grammar (e.g. source.ruby)');
                return generator.prompt({
                    type: 'input',
                    name: 'languageScopeName',
                    message: 'Scope names:',
                    default: generator.extensionConfig.languageScopeName,
                }).then(extAnswer => {
                    generator.extensionConfig.languageScopeName = extAnswer.languageScopeName;
                });
            },

            askForSnippetLanguage: () => {
                if (generator.extensionConfig.type !== 'ext-snippets') {
                    return Promise.resolve();
                }
                let extensionParam2 = generator.options['extensionParam2'];

                if (extensionParam2) {
                    generator.extensionConfig.languageId = extensionParam2;
                    return Promise.resolve();
                }

                generator.log('Enter the language for which the snippets should appear. The id is an identifier and is single, lower-case name such as \'php\', \'javascript\'');
                return generator.prompt({
                    type: 'input',
                    name: 'languageId',
                    message: 'Language id:',
                    default: generator.extensionConfig.languageId
                }).then(idAnswer => {
                    generator.extensionConfig.languageId = idAnswer.languageId;
                });
            },

            askForPackageManager: () => {
                if (['ext-command-ts', 'ext-command-js', 'ext-localization', 'ext-dashboard', 'ext-wizard', 'ext-dashboard']
                    .indexOf(generator.extensionConfig.type) === -1) {
                    if (generator.extensionConfig.type === 'ext-jupyterbook' || generator.extensionConfig.type === 'ext-notebook') {
                        generator.extensionConfig.pkgManager = 'npm';
                    }
                    return Promise.resolve();
                }

                generator.extensionConfig.pkgManager = 'npm';
                return generator.prompt({
                    type: 'list',
                    name: 'pkgManager',
                    message: 'Which package manager to use?',
                    choices: [
                        {
                            name: 'npm',
                            value: 'npm'
                        },
                        {
                            name: 'yarn',
                            value: 'yarn'
                        }
                    ]
                }).then(pckgManagerAnswer => {
                    generator.extensionConfig.pkgManager = pckgManagerAnswer.pkgManager;
                });
            },
        };

        // run all prompts in sequence. Results can be ignored.
        let result = Promise.resolve();
        for (let taskName in prompts) {
            let prompt = prompts[taskName];
            result = result.then(_ => {
                if (!this.abort) {
                    return new Promise((s, r) => {
                        setTimeout(_ => prompt().then(s, r), 0); // set timeout is required, otherwise node hangs
                    });
                }
            }, error => {
                generator.log(error.toString());
                this.abort = true;
            })
        }
        return result;
    }
    // Write files
    writing() {
        if (this.abort) {
            return;
        }
        this.sourceRoot(path.join(__dirname, './templates/' + this.extensionConfig.type));

        switch (this.extensionConfig.type) {
            case 'ext-colortheme':
                this._writingColorTheme();
                break;
            case 'ext-language':
                this._writingLanguage();
                break;
            case 'ext-snippets':
                this._writingSnippets();
                break;
            case 'ext-keymap':
                this._writingKeymaps();
                break;
            case 'ext-command-ts':
                this._writingCommandTs();
                break;
            case 'ext-command-js':
                this._writingCommandJs();
                break;
            case 'ext-extensionpack':
                this._writingExtensionPack();
                break;
            case 'ext-dashboard':// {{ADS EDIT}}
                this._writingDashboard();// {{ADS EDIT}}
                break;// {{ADS EDIT}}
            case 'ext-localization':
                localization.writingLocalizationExtension(this);
                break;
            case 'ext-notebook': // {{ADS EDIT}}
                this._writingNotebook();
                break;
            case 'ext-jupyterbook': // {{ADS EDIT}}
                this._writingJupyterBook();
                break;
            case 'ext-wizard': // {{ADS EDIT}}
                this._writingWizard();
                break;
            default:
                //unknown project type
                break;
        }
    }

    // {{ADS EDIT}}
    _writingNotebook() {

        let context = this.extensionConfig;

        if (context.addNotebooks) {
            for (let i = 0; i < context.notebookFiles.length; i++){
                let src = path.join(context.notebookLocation, context.notebookFiles[i]);
                let dest = path.join(context.name, 'content', context.notebookFiles[i]);
                this.fs.copy(src, dest);
            }
        } else {
            if (context.notebookType === 'notebook-python') {
                this.fs.copy(this.sourceRoot() + '/optional/pySample.ipynb', context.name + '/content/pySample.ipynb');
            } else {
                this.fs.copy(this.sourceRoot() + '/optional/sqlSample.ipynb', context.name + '/content/sqlSample.ipynb');
            }
        }

        this.fs.copy(this.sourceRoot() + '/vscode', context.name + '/.vscode');
        this.fs.copy(this.sourceRoot() + '/vscodeignore', context.name + '/.vscodeignore');
        this.fs.copyTpl(this.sourceRoot() + '/README.md', context.name + '/README.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/CHANGELOG.md', context.name + '/CHANGELOG.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/vsc-extension-quickstart.md', context.name + '/vsc-extension-quickstart.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/tsconfig.json', context.name + '/tsconfig.json', context);
        this.fs.copyTpl(this.sourceRoot() + '/src/notebook.ts', context.name + '/src/notebook.ts', context);
        this.fs.copyTpl(this.sourceRoot() + '/package.json', context.name + '/package.json', context);
        this.fs.copy(this.sourceRoot() + '/.eslintrc.json', context.name + '/.eslintrc.json');
        if (this.extensionConfig.gitInit) {
            this.fs.copy(this.sourceRoot() + '/gitignore', context.name + '/.gitignore');
        }
        this.extensionConfig.installDependencies = true;
    }

    // {{ADS EDIT}}
    _writingJupyterBook() {
        let context = this.extensionConfig;
        this.extensionConfig.installDependencies = true;

        if (context.addBooks) {
            for (let i = 0; i < context.bookFiles.length; i++){
                let src = path.join(context.bookLocation, context.bookFiles[i]);
                let dest = path.join(context.name, context.bookFiles[i]);
                this.fs.copy(src, dest);
            }
        } else {
            if (context.createBook && context.chapterNames) {
                try {
                    let idx = 0;
                    context.folderNames.forEach(chapter => {
                        context.organizedNotebooks[idx][chapter].forEach(item => {
                            let srcPath = path.join(context.notebookPath, item);
                            let destPath = path.join(context.name, 'content', chapter, item);
                            this.fs.copy(srcPath, destPath);
                        });
                        idx += 1;
                        this.fs.copy(this.sourceRoot() + '/optional/readme.md', context.name + '/content/' + chapter + '/readme.md')
                    });

                } catch (e) {
                    console.log("Cannot copy: " + e.message);
                }
            } else if (context.createBook) {
                const files = fileSys.readdirSync(context.notebookPath);
                files.forEach(file => {
                    let srcPath = path.join(context.notebookPath, file);
                    let dstPath = path.join(context.name, 'content', file);
                    this.fs.copy(srcPath, dstPath);
                });
            }
            else {
                this.fs.copy(this.sourceRoot() + '/content', context.name + '/content');
                this.fs.copyTpl(this.sourceRoot() + '/requirements.txt', context.name + '/requirements.txt', context);
                this.fs.copyTpl(this.sourceRoot() + '/references.bib', context.name + '/references.bib', context);
                this.fs.copyTpl(this.sourceRoot() + '/logo.png', context.name + '/logo.png', context);
            }

            this.fs.copy(this.sourceRoot() + '/_data/toc.yml', context.name + '/_data/toc.yml', context);
            this.fs.copyTpl(this.sourceRoot() + '/_config.yml', context.name + '/_config.yml', context);
        }

        this.fs.copy(this.sourceRoot() + '/vscode', context.name + '/.vscode');
        this.fs.copy(this.sourceRoot() + '/vscodeignore', context.name + '/.vscodeignore');
        this.fs.copyTpl(this.sourceRoot() + '/tsconfig.json', context.name + '/tsconfig.json', context);
        this.fs.copyTpl(this.sourceRoot() + '/src/jupyter-book.ts', context.name + '/src/jupyter-book.ts', context);
        this.fs.copyTpl(this.sourceRoot() + '/package.json', context.name + '/package.json', context);
        this.fs.copy(this.sourceRoot() + '/.eslintrc.json', context.name + '/.eslintrc.json');
        this.fs.copyTpl(this.sourceRoot() + '/vsc-extension-quickstart.md', context.name + '/vsc-extension-quickstart.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/README.md', context.name + '/README.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/CHANGELOG.md', context.name + '/CHANGELOG.md', context);

        if (this.extensionConfig.gitInit) {
            this.fs.copy(this.sourceRoot() + '/gitignore', context.name + '/.gitignore');
            this.fs.copy(this.sourceRoot() + '/gitattributes', context.name + '/.gitattributes');
        }
    }

    // Write Color Theme Extension
    _writingExtensionPack() {
        let context = this.extensionConfig;

        this.fs.copy(this.sourceRoot() + '/vscode', context.name + '/.vscode');
        this.fs.copyTpl(this.sourceRoot() + '/package.json', context.name + '/package.json', context);
        this.fs.copyTpl(this.sourceRoot() + '/vsc-extension-quickstart.md', context.name + '/vsc-extension-quickstart.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/README.md', context.name + '/README.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/CHANGELOG.md', context.name + '/CHANGELOG.md', context);
        this.fs.copy(this.sourceRoot() + '/vscodeignore', context.name + '/.vscodeignore');
        if (this.extensionConfig.gitInit) {
            this.fs.copy(this.sourceRoot() + '/gitignore', context.name + '/.gitignore');
            this.fs.copy(this.sourceRoot() + '/gitattributes', context.name + '/.gitattributes');
        }
    }

    // Write Color Theme Extension
    _writingColorTheme() {

        let context = this.extensionConfig;
        if (context.tmThemeFileName) {
            this.fs.copyTpl(this.sourceRoot() + '/themes/theme.tmTheme', context.name + '/themes/' + context.tmThemeFileName, context);
        }
        context.themeFileName = sanitize(context.themeName + '-color-theme.json');
        if (context.themeContent) {
            context.themeContent.name = context.themeName;
            this.fs.copyTpl(this.sourceRoot() + '/themes/color-theme.json', context.name + '/themes/' + context.themeFileName, context);
        } else {
            if (context.themeBase === 'vs') {
                this.fs.copyTpl(this.sourceRoot() + '/themes/new-light-color-theme.json', context.name + '/themes/' + context.themeFileName, context);
            } else if (context.themeBase === 'hc') {
                this.fs.copyTpl(this.sourceRoot() + '/themes/new-hc-color-theme.json', context.name + '/themes/' + context.themeFileName, context);
            } else {
                this.fs.copyTpl(this.sourceRoot() + '/themes/new-dark-color-theme.json', context.name + '/themes/' + context.themeFileName, context);
            }
        }

        this.fs.copy(this.sourceRoot() + '/vscode', context.name + '/.vscode');
        this.fs.copyTpl(this.sourceRoot() + '/package.json', context.name + '/package.json', context);
        this.fs.copyTpl(this.sourceRoot() + '/vsc-extension-quickstart.md', context.name + '/vsc-extension-quickstart.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/README.md', context.name + '/README.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/CHANGELOG.md', context.name + '/CHANGELOG.md', context);
        this.fs.copy(this.sourceRoot() + '/vscodeignore', context.name + '/.vscodeignore');
        if (this.extensionConfig.gitInit) {
            this.fs.copy(this.sourceRoot() + '/gitignore', context.name + '/.gitignore');
            this.fs.copy(this.sourceRoot() + '/gitattributes', context.name + '/.gitattributes');
        }
    }

    // Write Language Extension
    _writingLanguage() {
        let context = this.extensionConfig;
        if (!context.languageContent) {
            context.languageFileName = sanitize(context.languageId + '.tmLanguage.json');

            this.fs.copyTpl(this.sourceRoot() + '/syntaxes/new.tmLanguage.json', context.name + '/syntaxes/' + context.languageFileName, context);
        } else {
            this.fs.copyTpl(this.sourceRoot() + '/syntaxes/language.tmLanguage', context.name + '/syntaxes/' + sanitize(context.languageFileName), context);
        }

        this.fs.copy(this.sourceRoot() + '/vscode', context.name + '/.vscode');
        this.fs.copyTpl(this.sourceRoot() + '/package.json', context.name + '/package.json', context);
        this.fs.copyTpl(this.sourceRoot() + '/README.md', context.name + '/README.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/CHANGELOG.md', context.name + '/CHANGELOG.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/vsc-extension-quickstart.md', context.name + '/vsc-extension-quickstart.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/language-configuration.json', context.name + '/language-configuration.json', context);
        this.fs.copy(this.sourceRoot() + '/vscodeignore', context.name + '/.vscodeignore');
        if (this.extensionConfig.gitInit) {
            this.fs.copy(this.sourceRoot() + '/gitignore', context.name + '/.gitignore');
            this.fs.copy(this.sourceRoot() + '/gitattributes', context.name + '/.gitattributes');
        }
    }

    // Write Snippets Extension
    _writingSnippets() {
        let context = this.extensionConfig;

        this.fs.copy(this.sourceRoot() + '/vscode', context.name + '/.vscode');
        this.fs.copyTpl(this.sourceRoot() + '/package.json', context.name + '/package.json', context);
        this.fs.copyTpl(this.sourceRoot() + '/vsc-extension-quickstart.md', context.name + '/vsc-extension-quickstart.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/README.md', context.name + '/README.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/CHANGELOG.md', context.name + '/CHANGELOG.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/snippets/snippets.code-snippets', context.name + '/snippets/snippets.code-snippets', context);
        this.fs.copy(this.sourceRoot() + '/vscodeignore', context.name + '/.vscodeignore');
        if (this.extensionConfig.gitInit) {
            this.fs.copy(this.sourceRoot() + '/gitignore', context.name + '/.gitignore');
            this.fs.copy(this.sourceRoot() + '/gitattributes', context.name + '/.gitattributes');
        }
    }

    // Write Snippets Extension
    _writingKeymaps() {
        let context = this.extensionConfig;

        this.fs.copy(this.sourceRoot() + '/vscode', context.name + '/.vscode');
        this.fs.copyTpl(this.sourceRoot() + '/package.json', context.name + '/package.json', context);
        this.fs.copyTpl(this.sourceRoot() + '/vsc-extension-quickstart.md', context.name + '/vsc-extension-quickstart.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/README.md', context.name + '/README.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/CHANGELOG.md', context.name + '/CHANGELOG.md', context);
        this.fs.copy(this.sourceRoot() + '/vscodeignore', context.name + '/.vscodeignore');
        if (this.extensionConfig.gitInit) {
            this.fs.copy(this.sourceRoot() + '/gitignore', context.name + '/.gitignore');
            this.fs.copy(this.sourceRoot() + '/gitattributes', context.name + '/.gitattributes');
        }
    }

    // Write Dashboard Extension
    _writingDashboard() {// {{ADS EDIT}}
        let context = this.extensionConfig;

        this.fs.copy(this.sourceRoot() + '/vscode', context.name + '/.vscode');
        this.fs.copy(this.sourceRoot() + '/src/test', context.name + '/src/test');
        this.fs.copy(this.sourceRoot() + '/src/sql', context.name + '/src/sql');
        this.fs.copy(this.sourceRoot() + '/src/notebook', context.name + '/src/notebook');
        this.fs.copy(this.sourceRoot() + '/typings', context.name + '/typings');

        this.fs.copyTpl(this.sourceRoot() + '/package.json', context.name + '/package.json', context);
        if (this.extensionConfig.addDashboardBar || this.extensionConfig.addHomepageAction || this.extensionConfig.addNavSection) {
            this.fs.copyTpl(this.sourceRoot() + '/jsconfig.json', context.name + '/jsconfig.json', context);
            this.fs.copyTpl(this.sourceRoot() + '/.eslintrc.json', context.name + '/.eslintrc.json', context);
            this.fs.copyTpl(this.sourceRoot() + '/src/extension.js', context.name + '/src/extension.js', context);
            this.fs.copyTpl(this.sourceRoot() + '/src/controllers/controllerBase.js', context.name + '/src/controllers/controllerBase.js', context);
            this.fs.copyTpl(this.sourceRoot() + '/src/controllers/mainController.js', context.name + '/src/controllers/mainController.js', context);
            this.fs.copyTpl(this.sourceRoot() + '/src/controllers/webviewExample.html', context.name + '/src/controllers/webviewExample.html', context);
            this.fs.copyTpl(this.sourceRoot() + '/src/constants.js', context.name + '/src/constants.js', context);
            this.fs.copyTpl(this.sourceRoot() + '/src/localizedConstants.js', context.name + '/src/localizedConstants.js', context);
            this.fs.copyTpl(this.sourceRoot() + '/src/utils.js', context.name + '/src/utils.js', context);
            this.fs.copy(this.sourceRoot() + '/src/media/icon', context.name + '/src/media/icon');
            this.extensionConfig.installDependencies = true;
        }
        else {
            this.fs.copyTpl(this.sourceRoot() + '/src/media/icon/tab.svg', context.name + '/src/media/icon/tab.svg', context);
        }
        this.fs.copyTpl(this.sourceRoot() + '/vsc-extension-quickstart.md', context.name + '/vsc-extension-quickstart.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/README.md', context.name + '/README.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/CHANGELOG.md', context.name + '/CHANGELOG.md', context);
        this.fs.copy(this.sourceRoot() + '/vscodeignore', context.name + '/.vscodeignore');
        this.fs.copy(this.sourceRoot() + '/gitignore', context.name + '/.gitignore');
        if (this.extensionConfig.gitInit) {
            this.fs.copy(this.sourceRoot() + '/gitattributes', context.name + '/.gitattributes');
        }
        this.fs.copyTpl(this.sourceRoot() + '/installTypings.js', context.name + '/installTypings.js', context);

    }

    // Write Command Extension (TypeScript)
    _writingCommandTs() {
        let context = this.extensionConfig;

        this.fs.copy(this.sourceRoot() + '/vscode', context.name + '/.vscode');
        this.fs.copy(this.sourceRoot() + '/src/test', context.name + '/src/test');
        this.fs.copy(this.sourceRoot() + '/typings', context.name + '/typings');
        this.fs.copy(this.sourceRoot() + '/vscodeignore', context.name + '/.vscodeignore');

        if (this.extensionConfig.gitInit) {
            this.fs.copy(this.sourceRoot() + '/gitignore', context.name + '/.gitignore');
        }
        this.fs.copyTpl(this.sourceRoot() + '/README.md', context.name + '/README.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/CHANGELOG.md', context.name + '/CHANGELOG.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/vsc-extension-quickstart.md', context.name + '/vsc-extension-quickstart.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/tsconfig.json', context.name + '/tsconfig.json', context);

        this.fs.copyTpl(this.sourceRoot() + '/src/extension.ts', context.name + '/src/extension.ts', context);
        this.fs.copyTpl(this.sourceRoot() + '/package.json', context.name + '/package.json', context);
        this.fs.copy(this.sourceRoot() + '/.eslintrc.json', context.name + '/.eslintrc.json');
        this.fs.copyTpl(this.sourceRoot() + '/installTypings.js', context.name + '/installTypings.js', context);

        this.extensionConfig.installDependencies = true;
    }

    // Write Command Extension (JavaScript)
    _writingCommandJs() {
        let context = this.extensionConfig;

        this.fs.copy(this.sourceRoot() + '/vscode', context.name + '/.vscode');
        this.fs.copy(this.sourceRoot() + '/test', context.name + '/test');
        this.fs.copy(this.sourceRoot() + '/typings', context.name + '/typings');
        this.fs.copy(this.sourceRoot() + '/vscodeignore', context.name + '/.vscodeignore');

        if (this.extensionConfig.gitInit) {
            this.fs.copy(this.sourceRoot() + '/gitignore', context.name + '/.gitignore');
        }

        this.fs.copyTpl(this.sourceRoot() + '/README.md', context.name + '/README.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/CHANGELOG.md', context.name + '/CHANGELOG.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/vsc-extension-quickstart.md', context.name + '/vsc-extension-quickstart.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/jsconfig.json', context.name + '/jsconfig.json', context);

        this.fs.copyTpl(this.sourceRoot() + '/extension.js', context.name + '/extension.js', context);
        this.fs.copyTpl(this.sourceRoot() + '/package.json', context.name + '/package.json', context);
        this.fs.copyTpl(this.sourceRoot() + '/.eslintrc.json', context.name + '/.eslintrc.json', context);
        this.fs.copyTpl(this.sourceRoot() + '/installTypings.js', context.name + '/installTypings.js', context);

        this.extensionConfig.installDependencies = true;
    }

    _writingWizard() { // {{ADS EDIT}}
        let context = this.extensionConfig;

        this.fs.copy(this.sourceRoot() + '/vscode', context.name + '/.vscode');
        this.fs.copy(this.sourceRoot() + '/src/test', context.name + '/src/test');
        this.fs.copy(this.sourceRoot() + '/typings', context.name + '/typings');

        this.fs.copy(this.sourceRoot() + '/vscodeignore', context.name + '/.vscodeignore');
        if (this.extensionConfig.gitInit) {
            this.fs.copy(this.sourceRoot() + '/gitignore', context.name + '/.gitignore');
        }
        this.fs.copyTpl(this.sourceRoot() + '/README.md', context.name + '/README.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/CHANGELOG.md', context.name + '/CHANGELOG.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/vsc-extension-quickstart.md', context.name + '/vsc-extension-quickstart.md', context);
        this.fs.copyTpl(this.sourceRoot() + '/tsconfig.json', context.name + '/tsconfig.json', context);

        if (context.wizardOrDialog === 'Wizard') {
            this.fs.copyTpl(this.sourceRoot() + '/src/wizards/' + context.wizardType, context.name + '/src', context);
        } else { // context.wizardOrDialog === 'Dialog'
            this.fs.copyTpl(this.sourceRoot() + '/src/dialogs/' + context.dialogType, context.name + '/src', context);
        }
        this.fs.copyTpl(this.sourceRoot() + '/package.json', context.name + '/package.json', context);
        this.fs.copyTpl(this.sourceRoot() + '/.eslintrc.json', context.name + '/.eslintrc.json', context);
        this.fs.copyTpl(this.sourceRoot() + '/installTypings.js', context.name + '/installTypings.js', context);

        this.extensionConfig.installDependencies = true;
    }

    // Installation
    install() {
        if (this.abort) {
            return;
        }
        process.chdir(this.extensionConfig.name);

         // {{ADS EDIT}}
        if (this.extensionConfig.type === 'ext-jupyterbook' && this.extensionConfig.addBooks === false) {
            notebookConverter.buildCustomBook(this.extensionConfig);
        }

        if (this.extensionConfig.installDependencies) {
            this.installDependencies({
                yarn: this.extensionConfig.pkgManager === 'yarn',
                npm: this.extensionConfig.pkgManager === 'npm',
                bower: false
            });
        }
    }

    // End
    end() {
        if (this.abort) {
            return;
        }

        // Git init
        if (this.extensionConfig.gitInit) {
            this.spawnCommand('git', ['init', '--quiet']);
        }

        this.log('');
        this.log('Your extension ' + this.extensionConfig.name + ' has been created!');
        this.log('');
        this.log('To start editing with Visual Studio Code, navigate to your new extension folder or use the following commands:');
        this.log('');
        this.log('     cd ' + this.extensionConfig.name);
        this.log('     code .');
        this.log('');
        this.log(chalk.cyanBright('Open vsc-extension-quickstart.md inside the new extension for further instructions'));
        this.log(chalk.cyanBright('on how to modify, test and publish your extension.'));
        this.log('');

        // {{ADS EDIT}}
        if (this.extensionConfig.type === 'ext-jupyterbook') {
            this.log(chalk.yellow('Please review the "toc.yml" in the "_data" folder and edit as appropriate before publishing the Jupyter Book.'));
            this.log('');
        }

        if (this.extensionConfig.type === 'ext-extensionpack') {
            this.log(chalk.yellow('Please review the "extensionPack" in the "package.json" before publishing the extension pack.'));
            this.log('');
        }

        if (this.extensionConfig.type === 'ext-command-ts' || this.extensionConfig.type === 'ext-command-js'
            || this.extensionConfig.type === 'ext-dashboard' || this.extensionConfig.type === 'ext-wizard') {
            this.log('To include proposed Azure Data Studio APIs in your extension, run the following after opening the directory:');// {{ADS EDIT}}
            this.log('');
            this.log(chalk.blue('npm run proposedapi'));// {{ADS EDIT}}
            this.log('');
        }

        this.log('For more information, also visit aka.ms/azuredatastudio and follow us @azuredatastudio.');
        this.log('\r\n');
    }
}
