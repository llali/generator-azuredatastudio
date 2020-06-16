/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var request = require('request');

var vscodeFallbackVersion = '^1.19.0';
var vscodePromise = new Promise(function(resolve, reject) {
    request.get('https://raw.githubusercontent.com/microsoft/azuredatastudio/master/product.json', {}, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            try {
                var currentAzureDataStudio = JSON.parse(body);
                if (currentAzureDataStudio.vscodeVersion) {
                    resolve('^'+currentAzureDataStudio.vscodeVersion);
                    return;
                }
            } catch (e) {
                console.log('Problem parsing version: ' + body, e);
            }
        } else {
            console.log('Unable to fetch latest vscode version: ' + (error || ('Status code: ' + response.statusCode + ', ' + body)));
        }
        resolve(vscodeFallbackVersion);
    });
});

module.exports.getLatestVSCodeVersion = function() { return vscodePromise; };

var azdataFallbackVersion = '*';
module.exports.azdataVersion = azdataFallbackVersion;