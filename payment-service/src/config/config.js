import DotenvFlow from "dotenv-flow";

DotenvFlow.config();

const _config = {
    PORT: process.env.PORT || 3004,
    NODE_ENV: process.env.NODE_ENV || "development",
    SERVER_URL: process.env.SERVER_URL,
    CROSS_ORIGIN: process.env.CROSS_ORIGIN || "http://localhost:5173",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017",
    JWT: {
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    },
    REDIS: {
        HOST: process.env.REDIS_HOST,
        PORT: process.env.REDIS_PORT,
        PASSWORD: process.env.REDIS_PASSWORD,
    },
    API: {
        PRODUCT_SERVICE: process.env.PRODUCT_SERVICE_API,
        AUTH_SERVICE: process.env.AUTH_SERVICE_API,
    },
};

export default Object.freeze(_config);
