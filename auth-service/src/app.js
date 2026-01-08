import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config/config.js";
import compression from "compression";
import errorHandler from "./middlewares/error.middleware.js";
import { StatusCodes } from "http-status-codes";
import responseMessages from "./constants/responseMessages.js";
import ApiError from "./utils/ApiError.js";
import helmet from "helmet";
import morganLogger from "./loggers/morgan.logger.js";
import { generalLimiter } from "./middlewares/rateLimiter.middleware.js";

const app = express();

// Middlewares
app.use(helmet());
app.use(generalLimiter);
app.use(morganLogger);
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
app.use(compression());

// Routes import
import healthCheckRoutes from "./routes/healthcheck.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

// Routes declaration
app.use("/api/v1/health", healthCheckRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// 404 handler
app.use((req, res, next) => {
    next(
        new ApiError(
            StatusCodes.NOT_FOUND,
            responseMessages.NOT_FOUND(req.originalUrl),
            "NOT_FOUND",
            true
        )
    );
});

// Global error handler
app.use(errorHandler);

export default app;
