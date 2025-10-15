import { Router } from "express";
import authUser from "../middlewares/auth.middleware.js";
import UserController from "../controllers/user.controller.js";
import { addUserAddressValidator } from "../validators/user.validators.js";

const router = Router();

// GET /api/v1/users/me
router.get("/me", authUser, UserController.getCurrentUserProfile);

// POST /api/v1/users/me/addresses
router.post("/me/addresses", authUser, addUserAddressValidator, UserController.addUserAddress);

export default router;
