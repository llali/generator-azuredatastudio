/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

let path = require('path');
let fs = require('fs');
let plistParser = require('fast-plist');

function processSnippetFolder(folderPath, generator) {
    let errors = [], snippets = {};
    let snippetCount = 0;
    let languageId = null;

    const count = convert(folderPath);
    if (count <= 0) {
        generator.log("No valid snippets found in " + folderPath + (errors.length > 0 ? '.\n' + errors.join('\n'): ''));
        return count;
    }
    generator.extensionConfig.snippets = snippets;
    generator.extensionConfig.languageId = languageId;
    generator.log(count + " snippet(s) found and converted." + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n'): ''));
    return count;

    function convert(folderPath) {

        const files = getFolderContent(folderPath, errors);
        if (errors.length > 0) {
            return -1;
        }

        files.forEach(function (fileName) {
            const extension = path.extname(fileName).toLowerCase();
            let snippet;
            if (extension === '.tmsnippet') {
                snippet = convertTextMate(path.join(folderPath, fileName));
            } else if (extension === '.sublime-snippet') {
                snippet = convertSublime(path.join(folderPath, fileName));
            }
            if (snippet) {
                if (snippet.prefix && snippet.body) {
                    snippets[getId(snippet.prefix)] = snippet;
                    snippetCount++;
                    guessLanguage(snippet.scope);
                } else {
                    const filePath = path.join(folderPath, fileName);
                    if (!snippet.prefix) {
                        errors.push(filePath + ": Missing property 'tabTrigger'. Snippet skipped.");
                    } else {
                        errors.push(filePath + ": Missing property 'content'. Snippet skipped.");
                    }
                }
            }

        });
        return snippetCount;
    }


    function getId(prefix) {
        if (snippets.hasOwnProperty(prefix)) {
            let counter = 1;
            while (snippets.hasOwnProperty(prefix + counter)) {
                counter++;
            }
            return prefix + counter;
        }
        return prefix;
    }

    function guessLanguage(scopeName) {
        if (!languageId && scopeName) {
            let match;
            if (match = /(source|text)\.(\w+)/.exec(scopeName)) {
                languageId = match[2];
            }
        }
    }

    function convertTextMate(filePath) {
        let body = getFileContent(filePath, errors);
        if (!body) {
            return;
        }
        let value;
        try {
            value = plistParser.parse(body);
        } catch (e) {
            generator.log(filePath + " not be parsed: " + e.toString());
            return undefined;
        }
        if (!value) {
            generator.log(filePath + " not be parsed. Make sure it is a valid plist file. ");
            return undefined;
        }

        return {
            prefix: value.tabTrigger,
            body: value.content,
            description: value.name,
            scope: value.scope
        }
    }

    function convertSublime(filePath) {
        let body = getFileContent(filePath, errors);
        if (!body) {
            return;
        }

        const parsed = plistParser.parse(body);

        const snippet = {
            prefix: parsed['tabtrigger'],
            body: parsed['content'],
            description: parsed['description'],
            scope: parsed['scope']
        };

        return snippet;
    }


}

function getFolderContent(folderPath, errors) {
    try {
        return fs.readdirSync(folderPath);
    } catch (e) {
        errors.push("Unable to access " + folderPath + ": " + e.message);
        return [];
    }
}

function getFileContent(filePath, errors) {
    try {
        const content = fs.readFileSync(filePath).toString();
        if (content === '') {
            errors.push(filePath + ": Empty file content");
        }
        return content;
    } catch (e) {
        errors.push(filePath + ": Problems loading file content: " + e.message);
        return null;
    }
}

function isFile(filePath) {
    try {
        return fs.statSync(filePath).isFile()
    } catch (e) {
        return false;
    }
}

exports.processSnippetFolder = processSnippetFolder;