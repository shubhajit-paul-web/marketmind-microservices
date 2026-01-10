import Redis from "ioredis";
import config from "../config/config.js";
import logger from "../loggers/winston.logger.js";

const redis = new Redis({
    port: config.REDIS.PORT,
    host: config.REDIS.HOST,
    password: config.REDIS.PASSWORD,
});

redis.on("connect", () => {
    logger.info("Connected to Redis");
});

redis.on("error", (error) => {
    logger.error("Error while connecting to redis", { meta: error });
});

export default redis;
