#!/usr/bin/env node

import { getRouterManager } from "../router/manager";
import { createProgram } from "./commands";

async function main() {
  try {
    const program = await createProgram();

    // Parse command line arguments
    program.parse(process.argv);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

async function cleanupAndExit(signal: string) {
  console.log(`\nReceived ${signal}. Cleaning up...`);
  const routerManager = getRouterManager();
  try {
    await routerManager.cleanup();
    console.log("Cleanup complete. Exiting.");
    process.exit(0);
  } catch (error) {
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

export { main };
