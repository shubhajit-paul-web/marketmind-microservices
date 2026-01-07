import express from "express";
import healthMetrics from "./utils/healthMetrics.js";

const app = express();

/**
 * Check the application's and system's health status
 * @route GET /api/health
 * @access Public
 */
app.get("/api/health", async (req, res) => {
    return res.status(200).json({
        application: healthMetrics.getApplicationHealth(),
        system: healthMetrics.getSystemHealth(),
        timestamp: Date.now(),
    });
});

export default app;
