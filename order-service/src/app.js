import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morganLogger from "./loggers/morgan.logger.js";
import cors from "cors";
import config from "./config/config.js";
import compression from "compression";
import errorHandler from "./middlewares/error.middleware.js";
import ApiError from "./utils/ApiError.js";
import errorCodes from "./constants/errorCodes.js";
import { StatusCodes } from "http-status-codes";

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
app.use(compression());

// Routes import
import healthcheckRoutes from "./routes/healthcheck.routes.js";
import orderRoutes from "./routes/order.routes.js";

// Routes declaration
app.use("/api/v1/health", healthcheckRoutes);
app.use("/api/v1/orders", orderRoutes);

// 404 handler
app.use(async (req, res, next) => {
    return next(
        new ApiError(StatusCodes.NOT_FOUND, `${req.originalUrl} not found`, errorCodes.NOT_FOUND)
    );
});

// Global error handler
app.use(errorHandler);

export default app;
