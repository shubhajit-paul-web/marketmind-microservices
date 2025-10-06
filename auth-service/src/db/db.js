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

        return true;
    } catch (error) {
        logger.error("MongoDB connection error", {
            meta: {
                message: error.message,
            },
        });

        setTimeout(() => process.exit(1), 500);
        return false;
    }
}

export default connectDB;
