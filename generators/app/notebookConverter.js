/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

var path = require('path');
var fs = require('fs');
var plistParser = require('fast-plist');

function processNotebookFolder(folderPath, generator) {
    var errors = [], snippets = {};
    var notebookCount = 0;
    var languageId = null;

    var count = convert(folderPath);
    if (count <= 0) {
        generator.log("No valid notebooks found in " + folderPath + (errors.length > 0 ? '.\n' + errors.join('\n'): ''));
        return count;
    }
    generator.extensionConfig.snippets = snippets;
    generator.extensionConfig.languageId = languageId;
    generator.log(count + " notebook(s) found and converted." + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n'): ''));
    return count;

    function convert(folderPath) {

        var files = getFolderContent(folderPath, errors);
        if (errors.length > 0) {
            return -1;
        }

        files.forEach(function (fileName) {
            var extension = path.extname(fileName).toLowerCase();
            var snippet;
            if (extension === '.md') {
               // snippet = convertMd(path.join(folderPath, fileName));
            } else if (extension === '.ipynb') {
                //snippet = convertIpynb(path.join(folderPath, fileName));
            }
            // if (snippet) {
            //     if (snippet.prefix && snippet.body) {
            //         snippets[getId(snippet.prefix)] = snippet;
            //         snippetCount++;
            //         guessLanguage(snippet.scope);
            //     } else {
            //         var filePath = path.join(folderPath, fileName);
            //         if (!snippet.prefix) {
            //             errors.push(filePath + ": Missing property 'tabTrigger'. Snippet skipped.");
            //         } else {
            //             errors.push(filePath + ": Missing property 'content'. Snippet skipped.");
            //         }
            //     }
            // }
        });
        return notebookCount;
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
        var content = fs.readFileSync(filePath).toString();
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

exports.processNotebookFolder = this.processNotebookFolder;