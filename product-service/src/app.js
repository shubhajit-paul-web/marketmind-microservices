import express from "express";
import helmet from "helmet";
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
app.use(
    cors({
        origin: config.CROSS_ORIGIN,
        credentials: true,
    })
);

// Routes import
import healthcheckRoutes from "./routes/healthcheck.routes.js";

// Routes declaration
app.use("/api/v1/health", healthcheckRoutes);

export default app;
