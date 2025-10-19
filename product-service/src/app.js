import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import morganLogger from "./loggers/morgan.logger.js";
import cors from "cors";
import config from "./config/config.js";

const app = express();

// Middlewares
app.use(helmet());
if (config.NODE_ENV === "development") {
    app.use(morganLogger);
}
app.use(
    express.json({
        limit: "20kb",
    })
);
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(
    cors({
        origin: config.CROSS_ORIGIN,
        credentials: true,
    })
);

export default app;
