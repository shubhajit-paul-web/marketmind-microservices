import DotenvFlow from "dotenv-flow";

DotenvFlow.config();

const _config = {
    PORT: process.env.PORT || 3005,
    NODE_ENV: process.env.NODE_ENV || "development",
    SERVER_URL: process.env.SERVER_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
    JWT: {
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    },
    REDIS: {
        HOST: process.env.REDIS_HOST,
        PORT: process.env.REDIS_PORT,
        PASSWORD: process.env.REDIS_PASSWORD,
    },
    API: {
        CART_SERVICE: process.env.CART_SERVICE_API,
        PRODUCT_SERVICE: process.env.PRODUCT_SERVICE_API,
    },
};

export default Object.freeze(_config);
