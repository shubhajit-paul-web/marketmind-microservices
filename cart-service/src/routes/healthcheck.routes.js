import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";

const router = Router();

// (Public) GET /api/v1/health
router.get("/", healthCheck);

export default router;
