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
        case "test":
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

const filterOnly = (level) => format((info) => (info.level === level ? info : false))();

// Custom file log format with meta for info, warn, error
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
            format: format.combine(filterOnly("info"), fileLogFormat),
        }),

        // Error log file
        new transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
            format: format.combine(filterOnly("error"), fileLogFormat),
        }),

        // Warn log file
        new transports.File({
            filename: path.join(logDir, "warn.log"),
            level: "warn",
            format: format.combine(filterOnly("warn"), fileLogFormat),
        }),

        // Debug log file
        new transports.File({
            filename: path.join(logDir, "debug.log"),
            level: "debug",
            format: format.combine(filterOnly("debug"), fileLogFormat),
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
