#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const manager_1 = require("../router/manager");
const commands_1 = require("./commands");
async function main() {
    try {
        const program = await (0, commands_1.createProgram)();
        // Parse command line arguments
        program.parse(process.argv);
    }
    catch (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    }
}
async function cleanupAndExit(signal) {
    console.log(`\nReceived ${signal}. Cleaning up...`);
    const routerManager = (0, manager_1.getRouterManager)();
    try {
        await routerManager.cleanup();
        console.log("Cleanup complete. Exiting.");
        process.exit(0);
    }
    catch (error) {
        console.error("Error during cleanup:", error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on("SIGINT", () => cleanupAndExit("SIGINT"));
process.on("SIGTERM", () => cleanupAndExit("SIGTERM"));
// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});
// Run main function
if (require.main === module) {
    main();
}
//# sourceMappingURL=index.js.map