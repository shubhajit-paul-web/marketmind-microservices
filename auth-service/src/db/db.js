import mongoose from "mongoose";
import config from "../config/config.js";
import { DB_NAME } from "../constants/constants.js";
import logger from "../loggers/winston.logger.js";

async function connectDB() {
    const DB_URI = `${config.MONGODB_URI}/${DB_NAME}`;

    try {
        const connectionInstance = await mongoose.connect(DB_URI);
        logger.info("MongoDB connected", {
            meta: {
                host: connectionInstance.connection.host,
            },
        });
    } catch (error) {
        logger.error("MongoDB connection error", {
            meta: {
                message: error.message,
            },
        });
        process.exit(1);
    }
}

export default connectDB;
