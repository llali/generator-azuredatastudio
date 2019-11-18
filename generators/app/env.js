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
    // request.get('https://vscode-update.azurewebsites.net/api/releases/stable', { headers: { "X-API-Version": "2" } }, function(error, response, body) {
    //     if (!error && response.statusCode === 200) {
    //         try {
    //             var tagsAndCommits = JSON.parse(body);
    //             if (Array.isArray(tagsAndCommits) && tagsAndCommits.length > 0) {
    //                 var segments = tagsAndCommits[0].version.split('.');
    //                 if (tagsAndCommits.length > 3) {
    //                     // Ops Studio is usually a couple of versions behind so
    //                     // should use the correct version
    //                     var segments = tagsAndCommits[2].version.split('.');
    //                 }
    //                 var segments = tagsAndCommits[0].version.split('.');
    //                 if (segments.length === 3) {
    //                     resolve('^' + segments[0] + '.' + segments[1] + '.0');
    //                     return;
    //                 }
    //             }
    //         } catch (e) {
    //             console.log('Problem parsing version: ' + body, e);
    //         }
    //     } else {
    //         console.log('Unable to fetch latest vscode version: ' + (error || ('Status code: ' + response.statusCode + ', ' + body)));
    //     }
    //     resolve(vscodeFallbackVersion);
    // });
});

module.exports.getLatestVSCodeVersion = function() { return vscodePromise; };

var azdataFallbackVersion = '*';
module.exports.azdataVersion = azdataFallbackVersion;
