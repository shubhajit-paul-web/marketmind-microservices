import { addColors, createLogger, format, transports } from "winston";
import config from "../config/config.js";
import path from "path";
import fs from "fs";

const logDir = path.join(process.cwd(), "logs");

// Create logs folder if not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Define different log level based on environment
function getLevel() {
    const ENV = config.NODE_ENV;

    switch (ENV) {
        case "production":
            return "info";
        case "testing":
            return "warn";
        default:
            return "debug";
    }
}

// Define colors for each level
const colors = {
    error: "red",
    warn: "yellow",
    info: "blue",
    http: "white",
    debug: "white",
};

// Add colors to winston
addColors(colors);

// Custom log format with meta
const logFormat = format.printf(({ timestamp, level, message, meta }) => {
    const metaString = meta ? JSON.stringify(meta) : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`;
});

// Create the logger
const logger = createLogger({
    level: getLevel(),
    format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    transports: [
        // Info log file
        new transports.File({
            filename: path.join(logDir, "info.log"),
            level: "info",
        }),

        // Error log file
        new transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
        }),
    ],
    // Don't exit on uncaught exceptions
    exitOnError: false,
});

if (config.NODE_ENV !== "production") {
    logger.add(
        new transports.Console({
            format: format.combine(format.colorize({ all: true })),
        })
    );
}

export default logger;
