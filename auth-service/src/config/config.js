import DotenvFlow from "dotenv-flow";

DotenvFlow.config({ path: "./" });

const _config = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || "development",
    SERVER_URL: process.env.SERVER_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017",
    JWT: {
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
        ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION,
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
        REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION,
    },
    IMAGEKIT: {
        PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
        PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
        URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
    },
    REDIS: {
        PORT: process.env.REDIS_PORT,
        HOST: process.env.REDIS_HOST,
        PASSWORD: process.env.REDIS_PASSWORD,
    },
};

let config;

if (_config.NODE_ENV === "test") {
    config = _config; // Don't freeze in testing mode
} else {
    config = Object.freeze(_config);
}

export default config;
