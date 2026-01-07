import DotenvFlow from "dotenv-flow";

DotenvFlow.config({
    default_node_env: "development",
});

const _config = {
    PORT: process.env.PORT || 3006,
    NODE_ENV: process.env.NODE_ENV || "development",
    SERVER_URL: process.env.SERVER_URL,
    CROSS_ORIGIN: process.env.CROSS_ORIGIN || "http://localhost:5173",
    OAUTH: {
        CLIENT_ID: process.env.OAUTH_CLIENT_ID,
        CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
        REFRESH_TOKEN: process.env.OAUTH_REFRESH_TOKEN,
        EMAIL_USER: process.env.EMAIL_USER,
    },
};

export default Object.freeze(_config);
