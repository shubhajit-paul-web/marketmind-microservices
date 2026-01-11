import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import SellerController from "../controllers/seller.controller.js";

const router = Router();

router.use(createAuthMiddleware(["seller"]));

// (Private) GET /api/v1/seller/dashboard/metrics
router.get("/metrics", SellerController.getMetrics);

// (Private) GET /api/v1/seller/dashboard/orders
router.get("/orders", SellerController.getOrders);

export default router;
