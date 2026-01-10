import asyncHandler from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import healthMetrics from "../utils/healthMetrics.js";

/**
 * Check the application's and system's health status
 * @route GET /api/v1/health
 */
export const healthCheck = asyncHandler(async (req, res) => {
    return res.status(StatusCodes.OK).json({
        application: healthMetrics.getApplicationHealth(),
        system: healthMetrics.getSystemHealth(),
        timestamp: Date.now(),
    });
});
