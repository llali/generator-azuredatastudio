/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
const request = require('request-light');
const fallbackVersion = '^1.39.0';

const promise = request.xhr({ url: 'https://raw.githubusercontent.com/microsoft/azuredatastudio/master/product.json', headers: { "X-API-Version": "2" } }).then(res => {// {{ADS EDIT}}
    if (res.status === 200) {
        try {
            const tagsAndCommits = JSON.parse(res.responseText);
            if (Array.isArray(tagsAndCommits) && tagsAndCommits.length > 0) {
                const segments = tagsAndCommits[0].version.split('.');
                if (segments.length === 3) {
                    return '^' + segments[0] + '.' + segments[1] + '.0';
                }
            }
        } catch (e) {
            console.log('Problem parsing version: ' + res.responseText, e);
        }
    } else {
        console.log('Unable to fetch latest vscode version: Status code: ' + res.status + ', ' + res.responseText);
    }
    return fallbackVersion;
});

module.exports.getLatestVSCodeVersion = function() { return promise; };
let azdataFallbackVersion = '*';// {{ADS EDIT}}
module.exports.azdataVersion = azdataFallbackVersion;// {{ADS EDIT}}