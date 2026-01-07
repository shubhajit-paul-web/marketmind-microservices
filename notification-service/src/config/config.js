import DotenvFlow from "dotenv-flow";

DotenvFlow.config();

const _config = {
    PORT: process.env.PORT || 3006,
    NODE_ENV: process.env.NODE_ENV || "development",
    SERVER_URL: process.env.SERVER_URL,
    CROSS_ORIGIN: process.env.CROSS_ORIGIN || "http://localhost:5173",
};

export default Object.freeze(_config);
