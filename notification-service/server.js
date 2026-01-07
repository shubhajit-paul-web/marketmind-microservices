import app from "./src/app.js";
import _config from "./src/config/config.js";
import logger from "./src/loggers/winston.logger.js";

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception - Shutting down...", {
        meta: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
    });

    setTimeout(() => process.exit(1), 1000);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Promise Rejection - Shutting down...", {
        meta: {
            reason: reason?.message ?? reason,
        },
    });

    logger.on("finish", () => process.exit(1));
    logger.end();
});

// Graceful shutdown
function gracefulShutdown(server, signal) {
    logger.info(`Received ${signal}, shutting down gracefully...`);

    // Close the server
    server.close(async () => {
        logger.info("Graceful shutdown completed");

        setTimeout(() => {
            logger.on("finish", () => process.exit(0));
            logger.end();
        }, 1000).unref();
    });

    // Fallback: force shutdown after timeout (15s)
    setTimeout(() => {
        logger.error("Fore shutdown after timeout (15s)");
        process.exit(1);
    }, 15000).unref();
}

try {
    // Start the server
    const server = app.listen(_config.PORT, () => {
        logger.info("Server is running", {
            meta: {
                PORT: _config.PORT,
                SERVER_URL: _config.SERVER_URL,
                ENVIRONMENT: _config.NODE_ENV,
            },
        });
    });

    // Handle graceful shutdowns
    process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));
} catch (error) {
    logger.error("Error while starting the server", {
        meta: {
            message: error.message,
        },
    });

    setTimeout(() => process.exit(1), 1000);
}
