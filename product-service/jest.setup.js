/* eslint-disable no-undef */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import redis from "./src/db/redis.js";
import logger from "./src/loggers/winston.logger.js";

let mongoServer;

// Start an in-memory MongoDB and connect once before all tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);

    logger.debug("🟢 MongoDB connected successfully");
});

// Disconnect and stop the in-memory MongoDB after all tests
afterAll(async () => {
    await mongoose.disconnect();
    redis.disconnect();

    if (mongoServer) {
        await mongoServer.stop();
    }
});

// Clear database between each test
beforeEach(async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});
