import DotenvFlow from "dotenv-flow";

DotenvFlow.config();

const _config = {
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || "development",
    SERVER_URL: process.env.SERVER_URL,
    CROSS_ORIGIN: process.env.CROSS_ORIGIN || "http://localhost:5173",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017",
};

export default Object.freeze(_config);
