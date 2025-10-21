import DotenvFlow from "dotenv-flow";

DotenvFlow.config();

const _config = {
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || "development",
    SERVER_URL: process.env.SERVER_URL,
    CROSS_ORIGIN: process.env.CROSS_ORIGIN || "http://localhost:5173",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017",
    IMAGEKIT: {
        PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
        PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
        URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
    },
};

export default Object.freeze(_config);
