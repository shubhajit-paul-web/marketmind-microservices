import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";

const router = Router();

// GET /api/v1/health
router.get("/", healthCheck);

export default router;
