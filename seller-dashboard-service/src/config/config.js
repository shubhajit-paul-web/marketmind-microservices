import DotenvFlow from "dotenv-flow";

DotenvFlow.config({
    default_node_env: "development",
});

const _config = {
    PORT: process.env.PORT || 3007,
    NODE_ENV: process.env.NODE_ENV || "development",
    SERVER_URL: process.env.SERVER_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
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
        ORDER_SERVICE: process.env.ORDER_SERVICE_API,
        AUTH_SERVICE: process.env.AUTH_SERVICE_API,
    },
    RABBIT_URL: process.env.RABBIT_URL,
};

export default Object.freeze(_config);
