import healthMetrics from "../utils/healthMetrics.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { StatusCodes } from "http-status-codes";

/**
 * Check the application's and system's health status
 * @route GET /api/v1/health
 */
export const healthCheck = asyncHandler(async (req, res) => {
    res.status(StatusCodes.OK).json({
        application: healthMetrics.getApplicationHealth(),
        system: healthMetrics.getSystemHealth(),
        timestamp: Date.now(),
    });
});
