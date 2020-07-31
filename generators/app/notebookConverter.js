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
        generator.log("No valid notebooks found in " + folderPath + (errors.length > 0 ? '.\n' + errors.join('\n') : ''));
        return count;
    }

    generator.log(count + " notebook(s) found." + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n') : ''));
    return count;
}

const findNotebookFiles = (folderPath, errors, generator) => {
    let notebookCount = 0;
    const files = getFolderContent(folderPath, errors);
    files.forEach(fileName => {
        try {
            let extension = path.extname(fileName).toLowerCase();
            if (extension === '.ipynb' || extension === '.md') {
                notebookCount++;
                let filePath = path.join(folderPath, fileName);
                generator.extensionConfig.notebookNames.push(fileName);
                generator.extensionConfig.notebookPaths.push(filePath);
            }
        }
        catch (e) {
            console.log("Finding notebook files encountered an error: " + e.message);
        }
    });

    return notebookCount;
}


exports.processBookFolder = (folderPath, generator) => {
    let errors = [];
    try {
        const validBook = findBookTOC(folderPath, errors);
        if (validBook < 0) {
            generator.log("No valid Jupyter Book found in " + folderPath + (errors.length > 0 ? '.\n' + errors.join('\n') : ''));
            return validBook;
        }

        generator.log("Jupyter Book found!" + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n') : ''));

        const count = discoverFoldersContainingNotebooks(folderPath, errors, generator);
        generator.log(count + " notebook(s) found! " + (errors.length > 0 ? '\n\nProblems while converting: \n' + errors.join('\n') : ''));
        return count;
    } catch (e) {
        generator.log("An unexpected error occurred: " + e.message);
    }
}

const discoverFoldersContainingNotebooks = (rootFolder, errors, generator) => {
    let totalNotebookCount = 0;
    const subfolders = getFolderContent(rootFolder);
    subfolders.forEach(dir => {
        console.log(dir);
        console.log(totalNotebookCount);
        let dirPath = path.join(rootFolder, dir);
        console.log("Attempting to find notebooks " + dirPath);
        totalNotebookCount += findNotebookFiles(dirPath, errors, generator);
        generator.extensionConfig.notebookFolders.push(dir);
    })
    return totalNotebookCount;
}

const findBookTOC = (folderPath, errors) => {
    if (errors.length > 0) {
        return -1;
    }

    const tocPath = path.join(folderPath, 'toc.yml');
    const tocDataPath = path.join(folderPath, '_data', 'toc.yml');
    if (fs.existsSync(tocPath) || fs.existsSync(tocDataPath)) {
        return 1;
    }
    return -1;
}

const getFolderContent = (folderPath, errors) => {
    try {
        const stats = fs.statSync(folderPath);
        if (stats.isDirectory()) {
            return fs.readdirSync(folderPath);
        }
        return [];
    } catch (e) {
        errors.push("Unable to access " + folderPath + ": " + e.message);
        return [];
    }
}

exports.buildCustomBook = (context) => {
    try {
        console.log("Inside build custom book");
        writeToTOC(context);
    } catch (e) {
        console.log("An unexpected error occurred: " + e.message);
    }
}

const writeToTOC = (context) => {
    const presentDirectory = __dirname.split('generators');
    const tocFilePath = path.join(presentDirectory[0], context.name, '_data', 'toc.yml');
    const bookContentPath = path.join(presentDirectory[0], context.name, 'content');
    const bookContents = fs.readdirSync(bookContentPath);
    bookContents.forEach(file => {
        try {
            console.log("Looking at file: ")
            const dirPath = path.join(bookContentPath, file);
            const stats = fs.statSync(dirPath);
            if (stats.isDirectory()) {
                let section = file;
                console.log(file);
                fs.writeFileSync(tocFilePath, `\n- title: ${section}\n  url: ${section}/readme\n  not_numbered: true\n  expand_sections: true\n  sections: `);
                writeForEachNotebook(dirPath, tocFilePath, true);
            } else {
                writeForEachNotebook(dirPath, tocFilePath, false);
            }
        } catch (e) {
            console.log(e.message);
        }
    });
}

const writeForEachNotebook = (notebookDir, tocFilePath, expandSection) => {
    const notebooks = fs.readdirSync(notebookDir);
    let fileContent = "";
    notebooks.forEach(nb => {
        console.log("Writing to TOC file: " + nb);
        let fileName = path.basename(nb);
        let url = path.join(notebookDir, nb).split('content')[1];
        if (path.extname(fileName) === '.ipynb') {
            fileName = fileName.slice(0, -6);
        } else {
            fileName = fileName.slice(0, -3);
        }
        console.log("For notebook, writing: " + `title: ${fileName} \t url: ${fileName.toLowerCase()}\n`);
        if (expandSection) {
            fileContent += `  - title: ${fileName}\n  url: ${fileName.toLowerCase()}\n`;
        } else {
            fileContent += `- title: ${fileName}\n  url: ${fileName.toLowerCase()}\n`;
        }

    });
    fs.writeFileSync(tocFilePath, fileContent);
}

const writeToReadme = (readmeFilePath, contentFilePath) => {
    let titles = []
    let fileContent = "## Notebooks in this Chapter\n"
    const files = fs.readdirSync(contentFilePath);
    files.forEach(file => {
        if (file.indexOf("readme") === -1) {
            const data = fs.readFileSync(file, 'UTF-8');
            // split the contents by new line
            const lines = data.split(/\r?\n/);
            // print all lines
            console.log(lines[6]);
            let title = lines[6].trim().replace(/"+/g, '').replace(/\\n/, '');
            titles.push(title);
            console.log(title);
            fileContent += `- [${title}](${file})\n`
        }
    })

}