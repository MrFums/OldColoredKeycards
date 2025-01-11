const fs = require("node:fs");
const path = require("node:path");

class Mod {
    static container;
    static configPath = path.resolve(__dirname, "../config/config.json");
    static originalPrices;

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

    async postDBLoadAsync(container) {
        Mod.container = container;
        const logger = Mod.container.resolve("WinstonLogger");
        const databaseServer = Mod.container.resolve("DatabaseServer");
        const database = databaseServer.getTables();
        const priceTable = database.templates.prices;
        const items = database.templates.items;

        let successfulChanges = 0;

        // Load configuration
        let config;
        try {
            config = JSON.parse(fs.readFileSync(Mod.configPath, "utf-8"));
        } catch (error) {
            logger.error(`Failed to load configuration: ${error.message}`);
            return;
        }

        // Check if price updates are enabled in config
        if (config.updatePrices) {
            // Apply price updates
            if (config.prices) {
                Mod.originalPrices = structuredClone(priceTable);

                for (const [itemId, newPrice] of Object.entries(config.prices)) {
                    if (!priceTable[itemId]) {
                        logger.warn(`Item ID ${itemId} not found in price table. Skipping.`);
                        continue;
                    }
                    priceTable[itemId] = newPrice;
                    logger.info(`[OldColoredKeycards] Updated price for item ${itemId} to ${newPrice}.`);
                }
            } else {
                logger.warn("No prices specified in the configuration file.");
            }
        } else {
            logger.info("[OldColoredKeycards] Price updates are disabled in the configuration.", "yellow");
        }

        // Customize keycard properties
        Object.entries(this.keycardIDs).forEach(([id, name]) => {
            if (items[id]) {
                const keycardProps = items[id]._props;
                if (config.infiniteUse) {
                    keycardProps.MaximumNumberOfUsage = 0; // Infinite use
                } else {
                    keycardProps.MaximumNumberOfUsage = config.customUses || 40; // Custom use limit
                }
                successfulChanges++;
            } else {
                logger.warn(`[OldColoredKeycards] Keycard ${name} with ID ${id} not found in the database.`);
            }
        });

        if (successfulChanges > 0) {
            logger.log(`[OldColoredKeycards] Successfully customized ${successfulChanges} keycards.`, "green");
        }
    }
}

module.exports = { mod: new Mod() };
