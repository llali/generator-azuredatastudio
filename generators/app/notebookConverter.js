/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

var path = require('path');
var os = require('os')
var fs = require('fs');

function processNotebookFolder(folderPath, generator) {
    var errors = [], notebooks = [];
    var notebookCount = 0;

    var count = convert(folderPath);
    if (count <= 0) {
        generator.log("No valid notebooks found in " + folderPath + (errors.length > 0 ? '.\n' + errors.join('\n'): ''));
        return count;
    }

    generator.log(count + " notebook(s) found." + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n'): ''));
    return count;

    function convert(folderPath) {
        var files = getFolderContent(folderPath, errors);
        if (errors.length > 0) {
            return -1;
        }

        files.forEach(function (fileName) {
            var extension = path.extname(fileName).toLowerCase();
            if (extension === '.md' || extension === '.ipynb') {
                notebookCount++;
                var filePath = path.join(folderPath, fileName);
                notebooks.push(filePath);
            }
        });
        generator.extensionConfig.notebooks = notebooks;
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

exports.processNotebookFolder = processNotebookFolder;