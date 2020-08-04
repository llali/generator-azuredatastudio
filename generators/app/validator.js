/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
const fs = require("fs");
const { file } = require("assert");
var nameRegex = /^[a-z0-9][a-z0-9\-]*$/i;
var numberRegex = /^[0-9]*$/

module.exports.validatePublisher = function (publisher) {
    if (!publisher) {
        return "Missing publisher name!";
    }

    if (!nameRegex.test(publisher)) {
        return "Invalid publisher name!";
    }

    return true;
}

module.exports.validateExtensionId = function (id) {
    if (!id) {
        return "Missing extension identifier";
    }

    if (!nameRegex.test(id)) {
        return "Invalid extension identifier";
    }

    return true;
}

module.exports.validateNonEmpty = function (name) {
    if (!(name && name.length > 0)) {
        return "Cannot be blank!";
    }
    return true;
}

module.exports.validateNumber = function (number) {
    if (!numberRegex.test(number)) {
        return "Invalid number";
    }
    return true;
}

module.exports.validateFilePath = function (filePath) {
    if (!fs.existsSync(filePath)) {
        return "Invalid file path!";
    }
    return true;
}