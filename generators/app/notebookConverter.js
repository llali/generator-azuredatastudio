/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

var path = require('path');
var fs = require('fs');

exports.processNotebookFolder = (folderPath, generator) => {
    let errors = [];
    let count = findNotebookFiles(folderPath, errors, generator);

    if (count <= 0) {
        generator.log("No valid notebooks found in " + folderPath + (errors.length > 0 ? '.\n' + errors.join('\n'): ''));
        return count;
    }

    generator.log(count + " notebook(s) found." + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n'): ''));
    return count;
}

const findNotebookFiles = (folderPath, errors, generator) => {
    let notebookPaths = [], notebookNames = [];
    let notebookCount = 0;
    let files = getFolderContent(folderPath, errors);

    if (errors.length > 0) {
        return -1;
    }

    files.forEach(fileName => {
        var extension = path.extname(fileName).toLowerCase();
        if (extension === '.ipynb') {
            notebookCount++;
            var filePath = path.join(folderPath, fileName);
            notebookNames.push(fileName);
            notebookPaths.push(filePath);
        }
    });

    generator.extensionConfig.notebookPaths = notebookPaths;
    generator.extensionConfig.notebookNames = notebookNames;
    return notebookCount;
}


exports.processBookFolder = (folderPath, generator) => {
    let errors = [];

    let count = findBookFiles(folderPath, errors, generator);
    if (count < 0) {
        generator.log("No valid Jupyter Book found in " + folderPath + (errors.length > 0 ? '.\n' + errors.join('\n'): ''));
        return count;
    }

    generator.log("Jupyter Book found!" + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n'): ''));
    return count;
}


const findBookFiles = (folderPath, errors, generator) => {
    let files = getFolderContent(folderPath, errors);
    if (errors.length > 0) {
        return -1;
    }

    files.forEach(fileName => {
        let file = path.basename(fileName).toLowerCase();
        if (file.indexOf('toc.yml') > -1){
            generator.extensionConfig.bookPath = folderPath;
            return 1;
        }
    });
    return -1;
}

const getFolderContent = (folderPath, errors) => {
    try {
        return fs.readdirSync(folderPath);
    } catch (e) {
        errors.push("Unable to access " + folderPath + ": " + e.message);
        return [];
    }
}
