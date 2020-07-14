/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

let path = require('path');
let fs = require('fs');

exports.processNotebookFolder = (folderPath, generator) => {
    let errors = [];
    const count = findNotebookFiles(folderPath, errors, generator);

    if (count <= 0) {
        generator.log("No valid notebooks found in " + folderPath + (errors.length > 0 ? '.\n' + errors.join('\n'): ''));
        return count;
    }

    generator.log(count + " notebook(s) found." + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n'): ''));
    return count;
}

const findNotebookFiles = (folderPath, errors, generator) => {
    let notebookCount = 0;
    const files = getFolderContent(folderPath, errors);

    if (errors.length > 0) {
        return -1;
    }

    files.forEach(fileName => {
        let extension = path.extname(fileName).toLowerCase();
        if (extension === '.ipynb') {
            notebookCount++;
            let filePath = path.join(folderPath, fileName);
            generator.extensionConfig.notebookNames.push(fileName);
            generator.extensionConfig.notebookPaths.push(filePath);
        }
    });

    return notebookCount;
}


exports.processBookFolder = (folderPath, generator) => {
    let errors = [];
    try {
        const validBook = findBookTOC(folderPath, errors, generator);
        if (validBook < 0) {
            generator.log("No valid Jupyter Book found in " + folderPath + (errors.length > 0 ? '.\n' + errors.join('\n'): ''));
            return validBook;
        }

        generator.log("Jupyter Book found!" + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n'): ''));

        const count = discoverFoldersContainingNotebooks(folderPath, errors, generator);
        generator.log(count + " notebook(s) found! " + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n'): ''));
        return count;
    } catch (e) {
        generator.log("An unexpected error occurred: " + e.message);
    }
}

const discoverFoldersContainingNotebooks = (rootFolder, errors, generator) => {
    let totalNotebookCount = 0;
    const subfolders = getFolderContent(rootFolder);
    subfolders.forEach(dir => {
        totalNotebookCount += findNotebookFiles(dir, errors, generator);
        generator.extensionConfig.notebookFolders.push(dir);
    })
    return totalNotebookCount;
}

const findBookTOC = (folderPath, errors, generator) => {
    const files = getFolderContent(folderPath, errors);
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
