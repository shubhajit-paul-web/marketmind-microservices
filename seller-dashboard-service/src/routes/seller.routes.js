import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import SellerController from "../controllers/seller.controller.js";

const router = Router();

router.use(createAuthMiddleware(["seller"]));

// (Private) /api/v1/seller/dashboard/metrics
router.get("/metrics", SellerController.getMetrics);

export default router;
