"use strict";

class OldColoredKeycards {
    // Load configuration file
    CFG = require("../config/config.json");

    constructor() {
        this.keycardIDs = {
            "5c1d0c5f86f7744bb2683cf0": "Blue Keycard",
            "5c1d0efb86f7744baf2e7b7b": "Red Keycard",
            "5c1d0dc586f7744baf2e7b79": "Green Keycard",
            "5c1d0f4986f7744bb01837fa": "Black Keycard",
            "5c1e495a86f7743109743dfb": "Violet Keycard",
            "5c1d0d6d86f7744bb2683e1f": "Yellow Keycard"
        };
    }

    postDBLoad(container) {
        const logger = container.resolve("WinstonLogger");
        const database = container.resolve("DatabaseServer").getTables();
        const items = database.templates.items;
        const config = this.CFG;

        // Log configuration info
        logger.log(`[OldColoredKeycards] Configuration: ${JSON.stringify(config)}`, "cyan");

        let successfulChanges = 0; // Counter for successful changes

        // Apply customizations to each keycard
        Object.entries(this.keycardIDs).forEach(([id, name]) => {
            if (items[id]) {
                if (config.infiniteUse) {
                    // Set infinite use by modifying MaximumNumberOfUsage
                    items[id]._props.MaximumNumberOfUsage = 0; // makes it infinite
                    successfulChanges++;
                } else {
                    // Set custom maximum number of uses
                    items[id]._props.MaximumNumberOfUsage = config.customUses || 100;
                    successfulChanges++;
                }
            } else {
                logger.log(`[OldColoredKeycards] Keycard ${name} with ID ${id} not found in the database`, "yellow");
            }
        });

        // Log a single message for successful changes
        if (successfulChanges > 0) {
            logger.log(`[OldColoredKeycards] Successfully modified ${successfulChanges} keycards.`, "green");
        }

        logger.log("[OldColoredKeycards] Keycard customization complete!", "cyan");
    }
}

module.exports = { mod: new OldColoredKeycards() };
