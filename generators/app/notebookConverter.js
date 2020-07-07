/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

var path = require('path');
var os = require('os')
var fs = require('fs');

exports.processNotebookFolder = (folderPath, generator) => {
    var errors = [], notebooksPaths = [], notebookNames = [];
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
                notebookNames.push(fileName);
                notebooksPaths.push(filePath);
            }
        });
        generator.extensionConfig.notebookPaths = notebooksPaths;
        generator.extensionConfig.notebookNames = notebookNames;
       return notebookCount;
    }
}


exports.processBookFolder = (folderPath, generator) => {
    var errors = [];

    var count = convert(folderPath);
    if (count < 0) {
        generator.log("No valid Jupyter Book found in " + folderPath + (errors.length > 0 ? '.\n' + errors.join('\n'): ''));
        return count;
    }

    generator.log("Jupyter Book found!" + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n'): ''));
    return count;

    function convert(folderPath) {
        var files = getFolderContent(folderPath, errors);
        if (errors.length > 0) {
            return -1;
        }

        files.forEach(function (fileName) {
            var file = path.basename(fileName).toLowerCase();
            console.log(file);
            if (file.indexOf('toc.yml') > -1){
                generator.extensionConfig.bookPath = folderPath;
                return 1;
            }
        });
        return -1;
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
