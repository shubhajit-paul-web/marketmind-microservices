import { Router } from "express";
import { registerUserValidator, loginUserValidator } from "../validators/auth.validators.js";
import upload from "../middlewares/multer.middleware.js";
import AuthController from "../controllers/auth.controller.js";
import authUser from "../middlewares/auth.middleware.js";

const router = Router();

// POST /api/v1/auth/register
router.post(
    "/register",
    upload.single("profilePicture"),
    registerUserValidator,
    AuthController.register
);

// POST /api/v1/auth/login
router.post("/login", loginUserValidator, AuthController.login);

// POST /api/v1/auth/logout
router.post("/logout", authUser, AuthController.logout);

// PATCH /api/v1/auth/password
router.patch("/password", authUser, AuthController.changePassword);

// GET /api/v1/auth/refresh-token
router.get("/refresh-token", AuthController.refreshAccessToken);

export default router;
