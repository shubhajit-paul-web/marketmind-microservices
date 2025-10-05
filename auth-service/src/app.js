import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config/config.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

// Middlewares
app.use(
    express.json({
        limit: "20kb",
    })
);
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());
app.use(
    cors({
        origin: config.CORS_ORIGIN,
        credentials: true,
    })
);

// Global error handler (Middleware)
app.use(errorHandler);

export default app;
