import { createLogger, format, transports } from "winston";
import config from "../config/config.js";
import path from "path";
import fs from "fs";
import { red, blue, yellow, green, magenta, white } from "colorette";

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
function colorizeLevel(level) {
    switch (level) {
        case "ERROR":
            return red(level);
        case "WARN":
            return yellow(level);
        case "INFO":
            return blue(level);
        default:
            return white(level);
    }
}

// Custom log format with meta
const fileLogFormat = format.printf(({ timestamp, level, message, meta }) => {
    const metaString = meta ? JSON.stringify(meta) : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`;
});

// Console log format with meta
const consoleLogFormat = format.printf(({ timestamp, level, message, meta }) => {
    const metaString = meta ? JSON.stringify(meta) : "";
    return `[${green(timestamp)}] ${colorizeLevel(level.toUpperCase())}: ${message} ${magenta(metaString)}`;
});

// Create the logger
const logger = createLogger({
    level: getLevel(),
    format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" })),
    transports: [
        // Info log file
        new transports.File({
            filename: path.join(logDir, "info.log"),
            level: "info",
            format: fileLogFormat,
        }),

        // Error log file
        new transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
            format: fileLogFormat,
        }),
    ],
    // Don't exit on uncaught exceptions
    exitOnError: false,
});

if (config.NODE_ENV !== "production") {
    logger.add(
        new transports.Console({
            format: format.combine(consoleLogFormat),
        })
    );
}

export default logger;
