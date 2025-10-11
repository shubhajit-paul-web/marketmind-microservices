import { Router } from "express";
import { registerUserValidator } from "../validators/auth.validators.js";
import upload from "../middlewares/multer.middleware.js";
import AuthController from "../controllers/auth.controller.js";

const router = Router();

// POST /api/v1/auth/register
router.post(
    "/register",
    upload.single("profilePicture"),
    registerUserValidator,
    AuthController.register
);

export default router;
