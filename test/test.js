"use strict";
var path = require('path');
var assert = require('yeoman-assert')
var helpers = require('yeoman-test');

var env = require('../generators/app/env');

var fs = require('fs');

function stripComments(content) {
    /**
    * First capturing group matches double quoted string
    * Second matches single quotes string
    * Third matches block comments
    * Fourth matches line comments
    */
    var regexp = /("(?:[^\\\"]*(?:\\.)?)*")|('(?:[^\\\']*(?:\\.)?)*')|(\/\*(?:\r?\n|.)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))/g;
    var result = content.replace(regexp, (match, m1, m2, m3, m4) => {
        // Only one of m1, m2, m3, m4 matches
        if (m3) {
            // A block comment. Replace with nothing
            return '';
        } else if (m4) {
            // A line comment. If it ends in \r?\n then keep it.
            var length = m4.length;
            if (length > 2 && m4[length - 1] === '\n') {
                return m4[length - 2] === '\r' ? '\r\n' : '\n';
            } else {
                return '';
            }
        } else {
            // We match a string
            return match;
        }
    });
    return result;
}


describe('test code generator', function () {
    this.timeout(10000);

    var engineVersion;
    before(function () {
        return env.getLatestVSCodeVersion().then(function (version) {
            console.info('    expecting engine version ' + version);
            engineVersion = version;
        });
    });

    it('theme import', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-colortheme',
                themeImportType: 'import-keep',
                themeURL: 'http://www.monokai.nl/blog/wp-content/asdev/Monokai.tmTheme',
                name: 'testTheme',
                displayName: 'Test Theme',
                description: 'My TestTheme',
                publisherName: 'test',
                themeName: 'Green',
                themeBase: 'vs-dark',
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expectedPackageJSON = {
                    "name": "testTheme",
                    "displayName": "Test Theme",
                    "description": "My TestTheme",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Themes"
                    ],
                    "contributes": {
                        "themes": [{
                            "label": "Green",
                            "uiTheme": "vs-dark",
                            "path": "./themes/Green-color-theme.json"
                        }]
                    }
                };
                var expectedColorTheme = {
                    "name": "Green",
                    "colors": {
                        "editor.background": "#272822",
                        "editorCursor.foreground": "#F8F8F0",
                        "editor.foreground": "#F8F8F2",
                        "editor.lineHighlightBackground": "#3E3D32",
                        "editor.selectionBackground": "#49483E",
                        "editorWhitespace.foreground": "#3B3A32"
                    },
                    "tokenColors": "./Monokai.tmTheme"
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'themes/Green-color-theme.json', 'themes/Monokai.tmTheme', 'vsc-extension-quickstart.md', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(actual, expectedPackageJSON);

                    body = fs.readFileSync('themes/Green-color-theme.json', 'utf8');

                    actual = JSON.parse(body);
                    assert.deepEqual(actual, expectedColorTheme);

                    done();
                } catch (e) {
                    done(e);
                }

            }, done);
    });

    it('theme import from file', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-colortheme',
                themeImportType: 'import-keep',
                themeURL: path.join(__dirname, 'fixtures/themes/new theme.tmTheme'),
                name: 'testTheme',
                displayName: 'Test Theme',
                description: 'My TestTheme',
                publisherName: 'test',
                themeName: 'Green',
                themeBase: 'vs-dark',
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expectedPackageJSON = {
                    "name": "testTheme",
                    "displayName": "Test Theme",
                    "description": "My TestTheme",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Themes"
                    ],
                    "contributes": {
                        "themes": [{
                            "label": "Green",
                            "uiTheme": "vs-dark",
                            "path": "./themes/Green-color-theme.json"
                        }]
                    }
                };
                var expectedColorTheme = {
                    "name": "Green",
                    "colors": {
                        "editor.background": "#002B36",
                        "editor.foreground": "#839496",
                        "editor.lineHighlightBackground": "#073642",
                        "editor.selectionBackground": "#073642",
                        "editorCursor.foreground": "#819090",
                        "editorWhitespace.foreground": "#073642"
                    },
                    "tokenColors": "./new theme.tmTheme"
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'themes/Green-color-theme.json', 'themes/new theme.tmTheme', 'vsc-extension-quickstart.md', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(actual, expectedPackageJSON);

                    body = fs.readFileSync('themes/Green-color-theme.json', 'utf8');

                    actual = JSON.parse(body);
                    assert.deepEqual(actual, expectedColorTheme);

                    done();
                } catch (e) {
                    done(e);
                }

            }, done);
    });

    it('theme import from file - issue 74', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-colortheme',
                themeImportType: 'import-inline',
                themeURL: path.join(__dirname, 'fixtures/themes/theme-74.tmTheme'),
                name: 'theme74',
                displayName: 'Theme 74',
                description: 'Theme SeventyFour',
                publisherName: 'test',
                themeName: 'Theme 74',
                themeBase: 'vs-dark',
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expectedPackageJSON = {
                    "name": "theme74",
                    "displayName": "Theme 74",
                    "description": "Theme SeventyFour",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Themes"
                    ],
                    "contributes": {
                        "themes": [{
                            "label": "Theme 74",
                            "uiTheme": "vs-dark",
                            "path": "./themes/Theme 74-color-theme.json"
                        }]
                    }
                };
                var expectedColorTheme = {
                    "name": "Theme 74",
                    "colors": {
                        "editor.background": "#002B36",
                        "editor.foreground": "#839496",
                        "editor.lineHighlightBackground": "#073642",
                        "editor.selectionBackground": "#073642",
                        "editorCursor.foreground": "#819090",
                        "editorWhitespace.foreground": "#073642"
                    },
                    "tokenColors": [
                        {
                            "settings": {
                                "foreground": "#839496",
                                "background": "#002B36"
                            }
                        },
                        {
                            "name": "Classes",
                            "scope": [
                                "support.class",
                                "entity.name.class",
                                "entity.name.type.class",
                                "meta.class"
                            ],
                            "settings": {
                                "foreground": "#C7AF3F"
                            }
                        }]
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'themes/Theme 74-color-theme.json', 'vsc-extension-quickstart.md', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(actual, expectedPackageJSON);

                    body = fs.readFileSync('themes/Theme 74-color-theme.json', 'utf8');

                    actual = JSON.parse(body);
                    assert.deepEqual(actual, expectedColorTheme);

                    done();
                } catch (e) {
                    done(e);
                }

            }, done);
    });


    it('theme new', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-colortheme',
                themeImportType: 'new',
                name: 'testTheme',
                displayName: 'Test Theme',
                description: 'My TestTheme',
                publisherName: 'test',
                themeName: 'Funky',
                themeBase: 'vs',
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expectedPackageJSON = {
                    "name": "testTheme",
                    "displayName": "Test Theme",
                    "description": "My TestTheme",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Themes"
                    ],
                    "contributes": {
                        "themes": [{
                            "label": "Funky",
                            "uiTheme": "vs",
                            "path": "./themes/Funky-color-theme.json"
                        }]
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'themes/Funky-color-theme.json', 'vsc-extension-quickstart.md', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);

                    assert.deepEqual(actual, expectedPackageJSON);

                    body = fs.readFileSync('themes/Funky-color-theme.json', 'utf8');

                    actual = JSON.parse(body);

                    assert.equal(actual.name, "Funky");
                    assert.equal(actual.colors['editor.background'], "#f5f5f5");
                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });

    it('language import', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-language',
                tmLanguageURL: 'http://raw.githubusercontent.com/textmate/ant.tmbundle/master/Syntaxes/Ant.tmLanguage',
                name: 'testLan',
                displayName: 'Test Lan',
                description: 'My TestLan',
                publisherName: 'test',
                languageId: 'ant',
                languageName: 'ANT',
                languageScopeName: 'text.xml.ant',
                languageExtensions: '.ant'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testLan",
                    "displayName": "Test Lan",
                    "description": "My TestLan",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Programming Languages"
                    ],
                    "contributes": {
                        "languages": [{
                            "id": "ant",
                            "aliases": ["ANT", "ant"],
                            "extensions": [".ant"],
                            "configuration": "./language-configuration.json"
                        }],
                        "grammars": [{
                            "language": "ant",
                            "scopeName": "text.xml.ant",
                            "path": "./syntaxes/ant.tmLanguage"
                        }]
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'syntaxes/ant.tmLanguage', 'language-configuration.json', 'vsc-extension-quickstart.md', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);
                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });

    it('language import 2', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-language',
                tmLanguageURL: path.join(__dirname, 'fixtures/grammars/foo.tmLanguage.json'),
                name: 'testFooLan',
                displayName: 'Test Foo Lan',
                description: 'My TestFooLan',
                publisherName: 'test',
                languageId: 'foo',
                languageName: 'FOO',
                languageScopeName: 'source.foo',
                languageExtensions: '.foo'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testFooLan",
                    "displayName": "Test Foo Lan",
                    "description": "My TestFooLan",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Programming Languages"
                    ],
                    "contributes": {
                        "languages": [{
                            "id": "foo",
                            "aliases": ["FOO", "foo"],
                            "extensions": [".foo"],
                            "configuration": "./language-configuration.json"
                        }],
                        "grammars": [{
                            "language": "foo",
                            "scopeName": "source.foo",
                            "path": "./syntaxes/foo.tmLanguage.json"
                        }]
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'syntaxes/foo.tmLanguage.json', 'language-configuration.json', 'vsc-extension-quickstart.md', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);
                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });

    it('language new', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-language',
                tmLanguageURL: '',
                name: 'crusty',
                displayName: 'Crusty',
                description: 'Crusty, the language',
                publisherName: 'test',
                languageId: 'crusty',
                languageName: 'Crusty',
                languageScopeName: 'source.crusty',
                languageExtensions: '.crusty'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "crusty",
                    "displayName": "Crusty",
                    "description": "Crusty, the language",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Programming Languages"
                    ],
                    "contributes": {
                        "languages": [{
                            "id": "crusty",
                            "aliases": ["Crusty", "crusty"],
                            "extensions": [".crusty"],
                            "configuration": "./language-configuration.json"
                        }],
                        "grammars": [{
                            "language": "crusty",
                            "scopeName": "source.crusty",
                            "path": "./syntaxes/crusty.tmLanguage.json"
                        }]
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'syntaxes/crusty.tmLanguage.json', 'language-configuration.json', 'vsc-extension-quickstart.md', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    var grammar = fs.readFileSync('syntaxes/crusty.tmLanguage.json', 'utf8');

                    var actualGrammar = JSON.parse(grammar);
                    assert.equal("Crusty", actualGrammar.name);
                    assert.equal("source.crusty", actualGrammar.scopeName);

                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });

    it('snippet new', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-snippets',
                snippetPath: '',
                name: 'testSnip',
                displayName: 'Test Snip',
                description: 'My TestSnip',
                publisherName: 'test',
                languageId: 'python'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testSnip",
                    "displayName": 'Test Snip',
                    "description": "My TestSnip",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Snippets"
                    ],
                    "contributes": {
                        "snippets": [{
                            "language": "python",
                            "path": "./snippets/snippets.code-snippets"
                        }]
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'snippets/snippets.code-snippets', 'vsc-extension-quickstart.md', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    done();
                } catch (e) {
                    done(e);
                }

            });
    });

    it('snippet import', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-snippets',
                snippetPath: path.join(__dirname, 'fixtures/tmsnippets'),
                name: 'testSnip',
                displayName: 'Test Snip',
                description: 'My TestSnip',
                publisherName: 'test',
                languageId: 'python'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testSnip",
                    "displayName": 'Test Snip',
                    "description": "My TestSnip",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Snippets"
                    ],
                    "contributes": {
                        "snippets": [{
                            "language": "python",
                            "path": "./snippets/snippets.code-snippets"
                        }]
                    }
                };
                var expectedSnippet = {
                    "ase": {
                        "prefix": "ase",
                        "body": "self.assertEqual(${1:expected}, ${2:actual}${3:, '${4:message}'})$0",
                        "description": "Assert Equal",
                        "scope": "source.python"
                    },
                    "asne": {
                        "prefix": "asne",
                        "body": "self.assertNotEqual(${1:expected}, ${2:actual}${3:, '${4:message}'})$0",
                        "description": "Assert Not Equal",
                        "scope": "source.python"
                    },
                    "as": {
                        "prefix": "as",
                        "body": "self.assert_(${1:boolean expression}${2:, '${3:message}'})$0",
                        "description": "Assert",
                        "scope": "source.python"
                    },
                    "tab": {
                        "prefix": "tab",
                        "body": "\ttab()",
                        "description": "Tab In Body",
                        "scope": "source.python"
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'snippets/snippets.code-snippets', 'vsc-extension-quickstart.md', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    var snippet = fs.readFileSync('snippets/snippets.code-snippets', 'utf8');

                    var actualSnippet = JSON.parse(snippet);
                    assert.deepEqual(expectedSnippet, actualSnippet);

                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('keymap new', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-keymap',
                name: 'testKeym',
                displayName: 'Test Keym',
                description: 'My TestKeym',
                publisherName: 'test'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testKeym",
                    "displayName": 'Test Keym',
                    "description": "My TestKeym",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Keymaps"
                    ],
                    "contributes": {
                        "keybindings": [{
                            "key": "ctrl+.",
                            "command": "workbench.action.showCommands"
                        }]
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'vsc-extension-quickstart.md', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    done();
                } catch (e) {
                    done(e);
                }

            });
    });

    it('command-ts', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-command-ts',
                name: 'testCom',
                displayName: 'Test Com',
                description: 'My TestCom',
                publisherName: 'test',
                gitInit: true,
                pkgManager: 'npm'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expectedPackageJSON = {
                    "name": "testCom",
                    "displayName": 'Test Com',
                    "description": "My TestCom",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "activationEvents": [
                        "onCommand:testCom.helloWorld",
                        "onCommand:testCom.showCurrentConnection"
                    ],
                    "devDependencies": {
                        "@types/vscode": engineVersion,
                        "@types/azdata": env.azdataVersion,// {{ADS EDIT}}
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "@typescript-eslint/parser": "^2.30.0",
                        "@typescript-eslint/eslint-plugin": "^2.30.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0"
                    },
                    "main": "./out/extension.js",
                    "scripts": {
                        "vscode:prepublish": "npm run compile",
                        "compile": "tsc -p ./",
                        "lint": "eslint src --ext ts",
                        "watch": "tsc -watch -p ./",
                        "pretest": "npm run compile && npm run lint",
                        "test": "node ./out/test/runTest.js",
                        "proposedapi": "node installTypings.js"
                    },
                    "categories": [
                        "Other"
                    ],
                    "contributes": {
                        "commands": [{
                            "command": "testCom.helloWorld",
                            "title": "Hello World"
                        },
                        {
                            "command": "testCom.showCurrentConnection",
                            "title": "Show Current Connection"
                        }
                        ]
                    }
                };
                try {


                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', '.vscodeignore', 'src/extension.ts', 'src/test/suite/extension.test.ts', 'src/test/suite/index.ts', 'tsconfig.json']);

                    var packageJSONBody = fs.readFileSync('package.json', 'utf8')
                    var actualPackageJSON = JSON.parse(packageJSONBody);
                    assert.deepEqual(expectedPackageJSON, actualPackageJSON);

                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('command-ts with yarn', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-command-ts',
                name: 'testCom',
                displayName: 'Test Com',
                description: 'My TestCom',
                publisherName: 'test',
                gitInit: false,
                pkgManager: 'yarn'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expectedPackageJSON = {
                    "name": "testCom",
                    "displayName": 'Test Com',
                    "description": "My TestCom",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "activationEvents": [
                        "onCommand:testCom.helloWorld",
                        "onCommand:testCom.showCurrentConnection"
                    ],
                    "devDependencies": {
                        "@types/vscode": engineVersion,
                        "@types/azdata": env.azdataVersion,// {{ADS EDIT}}
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "@typescript-eslint/parser": "^2.30.0",
                        "@typescript-eslint/eslint-plugin": "^2.30.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0"
                    },
                    "main": "./out/extension.js",
                    "scripts": {
                        "vscode:prepublish": "yarn run compile",
                        "compile": "tsc -p ./",
                        "lint": "eslint src --ext ts",
                        "watch": "tsc -watch -p ./",
                        "pretest": "yarn run compile && yarn run lint",
                        "test": "node ./out/test/runTest.js",
                        "proposedapi": "node installTypings.js"
                    },
                    "categories": [
                        "Other"
                    ],
                    "contributes": {
                        "commands": [{
                            "command": "testCom.helloWorld",
                            "title": "Hello World"
                        },
                        {
                            "command": "testCom.showCurrentConnection",
                            "title": "Show Current Connection"
                        }
                        ]
                    }
                };
                var expectedTsConfig = {
                    "compilerOptions": {
                        "module": "commonjs",
                        "target": "es6",
                        "outDir": "out",
                        "lib": [
                            "es6"
                        ],
                        "sourceMap": true,
                        "rootDir": "src",
                        "strict": true
                    },
                    "exclude": [
                        "node_modules",
                        ".vscode-test"
                    ]
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', '.vscodeignore', 'src/extension.ts', 'src/test/suite/extension.test.ts', 'src/test/suite/index.ts', 'tsconfig.json', '.eslintrc.json', '.vscode/extensions.json']);

                    var packageJSONBody = fs.readFileSync('package.json', 'utf8')
                    var actualPackageJSON = JSON.parse(packageJSONBody);
                    assert.deepEqual(expectedPackageJSON, actualPackageJSON);

                    var tsconfigBody = fs.readFileSync('tsconfig.json', 'utf8');

                    var actualTsConfig = JSON.parse(stripComments(tsconfigBody));
                    assert.deepEqual(expectedTsConfig, actualTsConfig);

                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('command-js', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-command-js',
                name: 'testCom',
                displayName: 'Test Com',
                description: 'My TestCom',
                publisherName: 'test',
                checkJavaScript: false,
                gitInit: false,
                pkgManager: 'npm'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testCom",
                    "displayName": 'Test Com',
                    "description": "My TestCom",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "activationEvents": [
                        "onCommand:testCom.helloWorld",
                        "onCommand:testCom.showCurrentConnection"
                    ],
                    "devDependencies": {
                        "@types/vscode": engineVersion,
                        "@types/azdata": env.azdataVersion,// {{ADS EDIT}}
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0"
                    },
                    "main": "./extension.js",
                    "scripts": {
                        "lint": "eslint .",
                        "pretest": "npm run lint",
                        "test": "node ./test/runTest.js",
                        "proposedapi": "node installTypings.js"
                    },
                    "categories": [
                        "Other"
                    ],
                    "contributes": {
                        "commands": [{
                            "command": "testCom.helloWorld",
                            "title": "Hello World"
                        },
                        {
                            "command": "testCom.showCurrentConnection",
                            "title": "Show Current Connection"
                        }]
                    }
                };
                try {


                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', '.vscodeignore', 'extension.js', 'test/suite/extension.test.js', 'test/suite/index.js', 'jsconfig.json']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('command-js with check JS', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-command-js',
                name: 'testCom',
                displayName: 'Test Com',
                description: 'My TestCom',
                publisherName: 'test',
                checkJavaScript: true,
                gitInit: false,
                pkgManager: 'yarn'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "compilerOptions": {
                        "module": "commonjs",
                        "target": "es6",
                        "checkJs": true,
                        "lib": [
                            "es6"
                        ]
                    },
                    "exclude": [
                        "node_modules"
                    ]
                };
                try {
                    var body = fs.readFileSync('jsconfig.json', 'utf8');

                    var actual = JSON.parse(stripComments(body));
                    assert.deepEqual(expected, actual);

                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('dashboard', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-dashboard',
                name: 'testCom',
                displayName: 'Test Com',
                publisherName: 'Test Publisher',
                description: 'My TestCom',
                tabGroup: '',
                checkJavaScript: false,
                gitInit: false,
                addDashboardBar: false,
                pkgManager: 'npm'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testCom",
                    "displayName": "Test Com",
                    "description": "My TestCom",
                    "publisher": "Test Publisher",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": "^1.39.0",
                        "azdata": "*"
                    },
                    "categories": [
                        "Other"
                    ],
                    "activationEvents": [
                        "*"
                    ],
                    "main": "./src/extension",
                    "contributes": {
                        "menus": {
                            "dashboard/toolbar": [
                                {
                                    "command": "testCom.getQuery"
                                },
                                {
                                    "command": "testCom.getUrl"
                                },
                                {
                                    "command": "testCom.getConnection"
                                },
                                {
                                    "command": "testCom.getWebview"
                                },
                                {
                                    "command": "testCom.getNotebook"
                                }
                            ]
                        },
                        "commands": [
                            {
                                "command": "testCom.getQuery",
                                "title": "Get Query",
                                "icon": {
                                    "light": "./src/media/icon/insights.svg",
                                    "dark": "./src/media/icon/insight_inverses.svg"
                                }
                            },
                            {
                                "command": "testCom.getUrl",
                                "title": "Get Url",
                                "icon": {
                                    "light": "./src/media/icon/documentation.svg",
                                    "dark": "./src/media/icon/documentation_inverse.svg"
                                }
                            },
                            {
                                "command": "testCom.getConnection",
                                "title": "Get Connection",
                                "icon": {
                                    "light": "./src/media/icon/tempdb.svg",
                                    "dark": "./src/media/icon/tempdb_inverse.svg"
                                }
                            },
                            {
                                "command": "testCom.getWebview",
                                "title": "Get Webview",
                                "icon": {
                                    "light": "./src/media/icon/launch.svg",
                                    "dark": "./src/media/icon/launch_inverse.svg"
                                }
                            },
                            {
                                "command": "testCom.getNotebook",
                                "title": "Get Notebook",
                                "icon": {
                                    "light": "./src/media/icon/book.svg",
                                    "dark": "./src/media/icon/book_inverse.svg"
                                }
                            }
                        ],
                        "dashboard.tabs": [
                            {
                                "id": "testCom.tab",
                                "title": "Test Com",
                                "description": "",
                                "icon": "src/media/icon/tab.svg",
                                "group": "",
                                "container": {
                                    "nav-section": [
                                        {
                                            "id": "monitoring",
                                            "title": "Monitor",
                                            "icon": {
                                                "light": "./src/media/icon/monitor.svg",
                                                "dark": "./src/media/icon/monitor_inverse.svg"
                                            },
                                            "container": {
                                                "insights": {}
                                            }
                                        },
                                        {
                                            "id": "webviewExample",
                                            "title": "Webview",
                                            "icon": {
                                                "light": "./src/media/icon/performance.svg",
                                                "dark": "./src/media/icon/performance_inverse.svg"
                                            },
                                            "container": {
                                                "webview-container": null
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        "dashboard.insights": [
                            {
                                "id": "testCom.space-usage",
                                "contrib": {
                                    "type": {
                                        "horizontalBar": {
                                            "dataDirection": "vertical",
                                            "dataType": "number",
                                            "legendPosition": "top",
                                            "labelFirstColumn": false,
                                            "columnsAsLabels": true
                                        }
                                    },
                                    "queryFile": "./src/sql/all_db_space_used.sql"
                                }
                            },
                            {
                                "id": "testCom.cpu-utilization",
                                "contrib": {
                                    "type": {
                                        "timeSeries": {
                                            "dataDirection": "horizontal",
                                            "dataType": "point",
                                            "legendPosition": "top",
                                            "labelFirstColumn": false,
                                            "columnsAsLabels": false
                                        }
                                    },
                                    "queryFile": "./src/sql/cpumetric.sql"
                                }
                            },
                            {
                                "id": "testCom.insight",
                                "contrib": {
                                    "queryFile": "./src/sql/query.sql",
                                    "type": {
                                        "bar": {
                                            "dataDirection": "vertical",
                                            "dataType": "number",
                                            "legendPosition": "none",
                                            "labelFirstColumn": false,
                                            "columnsAsLabels": true
                                        }
                                    }
                                }
                            }
                        ],
                        "dashboard.containers": [
                            {
                                "id": "insights",
                                "container": {
                                    "widgets-container": [
                                        {
                                            "name": "Top 10 DB Space Usage",
                                            "gridItemConfig": {
                                                "sizex": 2,
                                                "sizey": 2
                                            },
                                            "widget": {
                                                "testCom.space-usage": {}
                                            }
                                        },
                                        {
                                            "name": "CPU Utilization",
                                            "gridItemConfig": {
                                                "sizex": 2,
                                                "sizey": 1
                                            },
                                            "widget": {
                                                "testCom.cpu-utilization": {}
                                            }
                                        },
                                        {
                                            "name": "Label",
                                            "gridItemConfig": {
                                                "sizex": 2,
                                                "sizey": 1
                                            },
                                            "widget": {
                                                "testCom.insight": {}
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    "scripts": {
                        "build": "gulp build",
                        "compile": "gulp compile",
                        "watch": "gulp watch",
                        "typings": "gulp copytypings",
                        "postinstall": "node ./node_modules/vscode/bin/install && node ./node_modules/azdata/bin/install",
                        "proposedapi": "node installTypings.js"
                    },
                    "dependencies": {
                        "fs-extra": "^5.0.0",
                        "handlebars": "^4.5.3",
                        "openurl": "^1.1.1"
                    },
                    "devDependencies": {
                        "@types/vscode": "^1.39.0",
                        "@types/azdata": "*",
                        "azdata": "^1.0.0",
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0",
                        "vscode": "^1.1.6"
                    }
                };
                try {


                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', '.vscodeignore', 'src/extension.js', 'src/constants.js', 'src/localizedConstants.js', 'src/utils.js', 'src/controllers/controllerBase.js',
                        'src/controllers/mainController.js', 'src/controllers/webviewExample.html', 'src/media/icon', 'src/notebook/sample.ipynb', 'src/sql/all_db_space_used.sql', 'src/sql/cpumetric.sql', 'src/sql/query.sql',
                        'src/test/suite/index.js', 'src/test/suite/extension.test.js', 'jsconfig.json']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('extension-pack', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                addExtensions: false,
                type: 'ext-extensionpack',
                name: 'testExtensionPack',
                displayName: 'Test Extension Pack',
                description: 'My Test Extension Pack',
                publisherName: 'test',
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testExtensionPack",
                    "displayName": "Test Extension Pack",
                    "description": "My Test Extension Pack",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Extension Packs"
                    ],
                    "extensionPack": [
                        "publisher.extensionName"
                    ]
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'vsc-extension-quickstart.md', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });

    it('language pack', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-localization',
                lpLanguageId: 'ru',
                lpLanguageName: 'Russian',
                lpLocalizedLanguageName: 'русский',
                publisherName: 'test',
                pkgManager: 'npm'
            }).toPromise().then(function () {
                var expected = {
                    "name": "vscode-language-pack-ru",
                    "displayName": "Russian Language Pack",
                    "description": "Language pack extension for Russian",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Language Packs"
                    ],
                    "contributes": {
                        "localizations": [{
                            "languageId": "ru",
                            "languageName": "Russian",
                            "localizedLanguageName": "русский"
                        }]
                    },
                    "scripts": {
                        "update": "cd ../vscode && npm run update-localization-extension ru"
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'vsc-extension-quickstart.md', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });

    it('language pack with yarn', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-localization',
                lpLanguageId: 'ru',
                lpLanguageName: 'Russian',
                lpLocalizedLanguageName: 'русский',
                publisherName: 'test',
                pkgManager: 'yarn'
            }).toPromise().then(function () {
                var expected = {
                    "name": "vscode-language-pack-ru",
                    "displayName": "Russian Language Pack",
                    "description": "Language pack extension for Russian",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "categories": [
                        "Language Packs"
                    ],
                    "contributes": {
                        "localizations": [{
                            "languageId": "ru",
                            "languageName": "Russian",
                            "localizedLanguageName": "русский"
                        }]
                    },
                    "scripts": {
                        "update": "cd ../vscode && yarn run update-localization-extension ru"
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'vsc-extension-quickstart.md', '.gitignore', '.gitattributes', '.vscodeignore']);

                    var body = fs.readFileSync('package.json', 'utf8');

                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });

    it('notebook with existing notebook', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                addExtensions: false,
                type: 'ext-notebook',
                name: 'testNotebook',
                displayName: 'Test Notebook',
                description: 'My Test Notebook',
                publisherName: 'test',
                addNotebooks: true,
                notebookPath: path.join(__dirname, '/fixtures/jupyterbook'),
                pkgManager: 'npm'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testNotebook",
                    "displayName": 'Test Notebook',
                    "description": "My Test Notebook",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": "*"
                    },
                    "activationEvents": [
                        "onCommand:launchNotebooks.testNotebook"
                    ],
                    "devDependencies": {
                        "@types/vscode": engineVersion,
                        "@types/azdata": "*",
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "@typescript-eslint/parser": "^2.30.0",
                        "@typescript-eslint/eslint-plugin": "^2.30.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0"
                    },
                    "main": "./out/notebook.js",
                    "scripts": {
                        "vscode:prepublish": "npm run compile",
                        "compile": "tsc -p ./",
                        "lint": "eslint src --ext ts",
                        "watch": "tsc -watch -p ./",
                        "pretest": "npm run compile && npm run lint",
                        "test": "node ./out/test/runTest.js"
                    },
                    "categories": [
                        "Other"
                    ],
                    "contributes": {
                        "commands": [{
                            "command": "launchNotebooks.testNotebook",
                            "title": "Launch Notebooks: Test Notebook"
                        }]
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'vsc-extension-quickstart.md', '.vscodeignore', 'src/notebook.ts', 'pySample.ipynb', 'tsconfig.json']);

                    var body = fs.readFileSync('package.json', 'utf8');
                    var actual = JSON.parse(body);

                    assert.deepEqual(expected, actual);
                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });


    it('notebook with python sample', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                addExtensions: false,
                type: 'ext-notebook',
                name: 'testNotebook',
                displayName: 'Test Notebook',
                description: 'My Test Notebook',
                publisherName: 'test',
                addNotebooks: false,
                selectType: 'notebook-python',
                pkgManager: 'npm'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testNotebook",
                    "displayName": 'Test Notebook',
                    "description": "My Test Notebook",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": "*"
                    },
                    "activationEvents": [
                        "onCommand:launchNotebooks.testNotebook"
                    ],
                    "devDependencies": {
                        "@types/vscode": engineVersion,
                        "@types/azdata": "*",
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "@typescript-eslint/parser": "^2.30.0",
                        "@typescript-eslint/eslint-plugin": "^2.30.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0"
                    },
                    "main": "./out/notebook.js",
                    "scripts": {
                        "vscode:prepublish": "npm run compile",
                        "compile": "tsc -p ./",
                        "lint": "eslint src --ext ts",
                        "watch": "tsc -watch -p ./",
                        "pretest": "npm run compile && npm run lint",
                        "test": "node ./out/test/runTest.js"
                    },
                    "categories": [
                        "Other"
                    ],
                    "contributes": {
                        "commands": [{
                            "command": "launchNotebooks.testNotebook",
                            "title": "Launch Notebooks: Test Notebook"
                        }]
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'vsc-extension-quickstart.md', '.vscodeignore', 'src/notebook.ts', 'pySample.ipynb', 'tsconfig.json']);

                    var body = fs.readFileSync('package.json', 'utf8');
                    var actual = JSON.parse(body);

                    assert.deepEqual(expected, actual);
                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });

    it('notebook with sql sample', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                addExtensions: false,
                type: 'ext-notebook',
                name: 'testNotebook',
                displayName: 'Test Notebook',
                description: 'My Test Notebook',
                publisherName: 'test',
                addNotebooks: false,
                selectType: 'notebook-sql',
                pkgManager: 'npm'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testNotebook",
                    "displayName": 'Test Notebook',
                    "description": "My Test Notebook",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": "*"
                    },
                    "activationEvents": [
                        "onCommand:launchNotebooks.testNotebook"
                    ],
                    "devDependencies": {
                        "@types/vscode": engineVersion,
                        "@types/azdata": "*",
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "@typescript-eslint/parser": "^2.30.0",
                        "@typescript-eslint/eslint-plugin": "^2.30.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0"
                    },
                    "main": "./out/notebook.js",
                    "scripts": {
                        "vscode:prepublish": "npm run compile",
                        "compile": "tsc -p ./",
                        "lint": "eslint src --ext ts",
                        "watch": "tsc -watch -p ./",
                        "pretest": "npm run compile && npm run lint",
                        "test": "node ./out/test/runTest.js"
                    },
                    "categories": [
                        "Other"
                    ],
                    "contributes": {
                        "commands": [{
                            "command": "launchNotebooks.testNotebook",
                            "title": "Launch Notebooks: Test Notebook"
                        }]
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'vsc-extension-quickstart.md', '.vscodeignore', 'sqlSample.ipynb', 'tsconfig.json']);

                    var body = fs.readFileSync('package.json', 'utf8');
                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });

    it('jupyter book with existing book', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                addExtensions: false,
                type: 'ext-jupyterbook',
                name: 'testBook',
                displayName: 'Test Book',
                description: 'My Test Book',
                publisherName: 'test',
                bookLocation: path.join(__dirname, '/fixtures/jupyterbook'),
                addBooks: true,
                pkgManager: 'npm'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testBook",
                    "displayName": 'Test Book',
                    "description": "My Test Book",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": "*"
                    },
                    "activationEvents": [
                        "onCommand:launchBook.testBook"
                    ],
                    "devDependencies": {
                        "@types/vscode": engineVersion,
                        "@types/azdata": "*",
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "@typescript-eslint/parser": "^2.30.0",
                        "@typescript-eslint/eslint-plugin": "^2.30.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0"
                    },
                    "main": "./out/jupyter-book.js",
                    "scripts": {
                        "vscode:prepublish": "npm run compile",
                        "compile": "tsc -p ./",
                        "lint": "eslint src --ext ts",
                        "watch": "tsc -watch -p ./",
                        "pretest": "npm run compile && npm run lint",
                        "test": "node ./out/test/runTest.js"
                    },
                    "categories": [
                        "Other"
                    ],
                    "contributes": {
                        "commands": [{
                            "command": "launchBook.testBook",
                            "title": "Launch Book: Test Book"
                        }]
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'vsc-extension-quickstart.md', '.vscodeignore', 'src/jupyter-book.ts', 'tsconfig.json', '_data/toc.yml', '_config.yml']);

                    var body = fs.readFileSync('package.json', 'utf8');
                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });

    it('jupyter book with notebook converted to book', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                addExtensions: false,
                type: 'ext-jupyterbook',
                name: 'testBook',
                displayName: 'Test Book',
                description: 'My Test Book',
                publisherName: 'test',
                notebookPath: path.join(__dirname, '/fixtures/jupyterbook'),
                addBooks: false,
                complexBook: false,
                pkgManager: 'npm'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testBook",
                    "displayName": 'Test Book',
                    "description": "My Test Book",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": "*"
                    },
                    "activationEvents": [
                        "onCommand:launchBook.testBook"
                    ],
                    "devDependencies": {
                        "@types/vscode": engineVersion,
                        "@types/azdata": "*",
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "@typescript-eslint/parser": "^2.30.0",
                        "@typescript-eslint/eslint-plugin": "^2.30.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0"
                    },
                    "main": "./out/jupyter-book.js",
                    "scripts": {
                        "vscode:prepublish": "npm run compile",
                        "compile": "tsc -p ./",
                        "lint": "eslint src --ext ts",
                        "watch": "tsc -watch -p ./",
                        "pretest": "npm run compile && npm run lint",
                        "test": "node ./out/test/runTest.js"
                    },
                    "categories": [
                        "Other"
                    ],
                    "contributes": {
                        "commands": [{
                            "command": "launchBook.testBook",
                            "title": "Launch Book: Test Book"
                        }]
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'vsc-extension-quickstart.md', '.vscodeignore', 'src/jupyter-book.ts', 'tsconfig.json', '_data/toc.yml', '_config.yml']);

                    var body = fs.readFileSync('package.json', 'utf8');
                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });

    it('jupyter book with sample book', function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                addExtensions: false,
                type: 'ext-jupyterbook',
                name: 'testBook',
                displayName: 'Test Book',
                description: 'My Test Book',
                publisherName: 'test',
                addBooks: false,
                createBook: false,
                pkgManager: 'npm'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expected = {
                    "name": "testBook",
                    "displayName": 'Test Book',
                    "description": "My Test Book",
                    "publisher": "test",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": "*"
                    },
                    "activationEvents": [
                        "onCommand:launchBook.testBook"
                    ],
                    "devDependencies": {
                        "@types/vscode": engineVersion,
                        "@types/azdata": "*",
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "@typescript-eslint/parser": "^2.30.0",
                        "@typescript-eslint/eslint-plugin": "^2.30.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0"
                    },
                    "main": "./out/jupyter-book.js",
                    "scripts": {
                        "vscode:prepublish": "npm run compile",
                        "compile": "tsc -p ./",
                        "lint": "eslint src --ext ts",
                        "watch": "tsc -watch -p ./",
                        "pretest": "npm run compile && npm run lint",
                        "test": "node ./out/test/runTest.js"
                    },
                    "categories": [
                        "Other"
                    ],
                    "contributes": {
                        "commands": [{
                            "command": "launchBook.testBook",
                            "title": "Launch Book: Test Book"
                        }]
                    }
                };
                try {
                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', 'vsc-extension-quickstart.md', '.vscodeignore', 'src/jupyter-book.ts', 'tsconfig.json', '_data/toc.yml', '_config.yml']);

                    var body = fs.readFileSync('package.json', 'utf8');
                    var actual = JSON.parse(body);
                    assert.deepEqual(expected, actual);

                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
    });

    it('wizard file-saving template', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-wizard',
                wizardOrDialog: 'Wizard',
                wizardType: 'file-saving',
                name: 'testWiz',
                displayName: 'Test Wiz',
                publisherName: 'Test Publisher',
                description: 'My TestWiz',
                gitInit: true,
                pkgManager: 'npm'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expectedPackageJSON = {
                    "name": "testWiz",
                    "displayName": "Test Wiz",
                    "description": "My TestWiz",
                    "publisher": "Test Publisher",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "activationEvents": [
                        "onCommand:testWiz.launchWizard"
                    ],
                    "devDependencies": {
                        "@types/vscode": engineVersion,
                        "@types/azdata": env.azdataVersion,// {{ADS EDIT}}
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "@typescript-eslint/parser": "^2.30.0",
                        "@typescript-eslint/eslint-plugin": "^2.30.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0"
                    },
                    "main": "./out/main.js",
                    "scripts": {
                        "vscode:prepublish": "npm run compile",
                        "compile": "tsc -p ./",
                        "lint": "eslint src --ext wizard",
                        "watch": "tsc -watch -p ./",
                        "pretest": "npm run compile && npm run lint",
                        "test": "node ./out/test/runTest.js",
                        "proposedapi": "node installTypings.js"
                    },
                    "categories": [
                        "Other"
                    ],
                    "contributes": {
                        "commands": [{
                            "command": "testWiz.launchWizard",
                            "title": "Launch Wizard"
                        }]
                    }
                };
                try {


                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', '.vscodeignore', 'src/main.ts',
                        'src/wizard/wizard.ts', 'src/wizard/api/models.ts', 'src/test/suite/extension.test.ts', 'src/test/suite/index.ts', 'tsconfig.json']);

                    var packageJSONBody = fs.readFileSync('package.json', 'utf8')
                    var actualPackageJSON = JSON.parse(packageJSONBody);
                    assert.deepEqual(expectedPackageJSON, actualPackageJSON);

                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('wizard standard template', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-wizard',
                wizardOrDialog: 'Wizard',
                wizardType: 'standard',
                name: 'testWiz',
                displayName: 'Test Wiz',
                publisherName: 'Test Publisher',
                description: 'My TestWiz',
                gitInit: true,
                pkgManager: 'npm'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expectedPackageJSON = {
                    "name": "testWiz",
                    "displayName": "Test Wiz",
                    "description": "My TestWiz",
                    "publisher": "Test Publisher",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "activationEvents": [
                        "onCommand:testWiz.launchWizard"
                    ],
                    "devDependencies": {
                        "@types/vscode": engineVersion,
                        "@types/azdata": env.azdataVersion,// {{ADS EDIT}}
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "@typescript-eslint/parser": "^2.30.0",
                        "@typescript-eslint/eslint-plugin": "^2.30.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0"
                    },
                    "main": "./out/main.js",
                    "scripts": {
                        "vscode:prepublish": "npm run compile",
                        "compile": "tsc -p ./",
                        "lint": "eslint src --ext wizard",
                        "watch": "tsc -watch -p ./",
                        "pretest": "npm run compile && npm run lint",
                        "test": "node ./out/test/runTest.js",
                        "proposedapi": "node installTypings.js"
                    },
                    "categories": [
                        "Other"
                    ],
                    "contributes": {
                        "commands": [{
                            "command": "testWiz.launchWizard",
                            "title": "Launch Wizard"
                        }]
                    }
                };
                try {


                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', '.vscodeignore', 'src/main.ts', 'src/test/suite/extension.test.ts', 'src/test/suite/index.ts', 'tsconfig.json']);

                    var packageJSONBody = fs.readFileSync('package.json', 'utf8')
                    var actualPackageJSON = JSON.parse(packageJSONBody);
                    assert.deepEqual(expectedPackageJSON, actualPackageJSON);

                    done();
                } catch (e) {
                    done(e);
                }
            });
    });


    it('dialog standard template', function (done) {
        this.timeout(10000);

        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                type: 'ext-wizard',
                wizardOrDialog: 'Dialog',
                dialogType: 'standard',
                name: 'testDialog',
                displayName: 'Test Dialog',
                publisherName: 'Test Publisher',
                description: 'My TestDialog',
                gitInit: true,
                pkgManager: 'npm'
            }) // Mock the prompt answers
            .toPromise().then(function () {
                var expectedPackageJSON = {
                    "name": "testDialog",
                    "displayName": "Test Dialog",
                    "description": "My TestDialog",
                    "publisher": "Test Publisher",
                    "version": "0.0.1",
                    "engines": {
                        "vscode": engineVersion,
                        "azdata": env.azdataVersion// {{ADS EDIT}}
                    },
                    "activationEvents": [
                        "onCommand:testDialog.launchDialog"
                    ],
                    "devDependencies": {
                        "@types/vscode": engineVersion,
                        "@types/azdata": env.azdataVersion,// {{ADS EDIT}}
                        "@types/glob": "^7.1.1",
                        "@types/mocha": "^7.0.2",
                        "@types/node": "^13.11.0",
                        "eslint": "^6.8.0",
                        "@typescript-eslint/parser": "^2.30.0",
                        "@typescript-eslint/eslint-plugin": "^2.30.0",
                        "glob": "^7.1.6",
                        "mocha": "^7.1.2",
                        "typescript": "^3.8.3",
                        "vscode-test": "^1.3.0"
                    },
                    "main": "./out/main.js",
                    "scripts": {
                        "vscode:prepublish": "npm run compile",
                        "compile": "tsc -p ./",
                        "lint": "eslint src --ext wizard",
                        "watch": "tsc -watch -p ./",
                        "pretest": "npm run compile && npm run lint",
                        "test": "node ./out/test/runTest.js",
                        "proposedapi": "node installTypings.js"
                    },
                    "categories": [
                        "Other"
                    ],
                    "contributes": {
                        "commands": [{
                            "command": "testDialog.launchDialog",
                            "title": "Launch Dialog"
                        }]
                    }
                };
                try {


                    assert.file(['package.json', 'README.md', 'CHANGELOG.md', '.vscodeignore', 'src/main.ts', 'src/test/suite/extension.test.ts', 'src/test/suite/index.ts', 'tsconfig.json']);

                    var packageJSONBody = fs.readFileSync('package.json', 'utf8')
                    var actualPackageJSON = JSON.parse(packageJSONBody);
                    assert.deepEqual(expectedPackageJSON, actualPackageJSON);

                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
});
