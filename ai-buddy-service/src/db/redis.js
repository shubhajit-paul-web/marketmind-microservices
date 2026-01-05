import { Redis } from "ioredis";
import _config from "../config/config.js";
import logger from "../loggers/winston.logger.js";

const redis = new Redis({
    host: _config.REDIS.HOST,
    port: _config.REDIS.PORT,
    password: _config.REDIS.PASSWORD,
});

redis.on("connect", () => {
    logger.info("Redis is connected");
});

redis.on("error", (err) => {
    logger.error("Redis connection Error:", err);
});

export default redis;
