import { Router } from "express";
import authUser from "../middlewares/auth.middleware.js";
import UserController from "../controllers/user.controller.js";
import {
    addUserAddressValidator,
    updateUserAddressValidator,
} from "../validators/user.validators.js";

const router = Router();

// GET /api/v1/users/me
router.get("/me", authUser, UserController.getCurrentUserProfile);

// POST /api/v1/users/me/addresses
router.post("/me/addresses", authUser, addUserAddressValidator, UserController.addUserAddress);

// GET /api/v1/users/me/addresses/:id
router.get("/me/addresses/:id", authUser, UserController.getUserAddress);

// DELETE /api/v1/users/me/addresses/:id
router.delete("/me/addresses/:id", authUser, UserController.deleteUserAddress);

// PATCH /api/v1/users/me/addresses/:id
router.patch(
    "/me/addresses/:id",
    authUser,
    updateUserAddressValidator,
    UserController.updateUserAddress
);

export default router;
