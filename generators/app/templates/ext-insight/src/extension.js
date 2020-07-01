/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mainController_1 = require("./controllers/mainController");
let controllers = [];
function activate(context) {
    let activations = [];
    // Start the main controller
    let mainController = new mainController_1.default(context);
    controllers.push(mainController);
    context.subscriptions.push(mainController);
    activations.push(mainController.activate());
    return Promise.all(activations)
        .then((results) => {
        for (let result of results) {
            if (!result) {
                return false;
            }
        }
        return true;
    });
}
exports.activate = activate;
function deactivate() {
    for (let controller of controllers) {
        controller.deactivate();
    }
}
exports.deactivate = deactivate;

//# sourceMappingURL=extension.js.map
