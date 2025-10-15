import { Router } from "express";
import authUser from "../middlewares/auth.middleware.js";
import UserController from "../controllers/user.controller.js";

const router = Router();

// GET /api/v1/users/me
router.get("/me", authUser, UserController.getCurrentUserProfile);

export default router;
