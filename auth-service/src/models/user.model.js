import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { COUNTRIES } from "../constants/constants.js";

// Address Schema
const addressSchema = new Schema(
    {
        street: {
            type: String,
            trim: true,
            required: true,
        },
        city: {
            type: String,
            trim: true,
            required: true,
        },
        state: {
            type: String,
            trim: true,
            required: true,
        },
        zip: {
            type: String,
            trim: true,
            minLength: 7,
            maxLength: 7,
            required: true,
        },
        country: {
            type: String,
            enum: COUNTRIES,
            default: "india",
        },
        landmark: {
            type: String,
            trim: true,
        },
        typeOfAddress: {
            type: String,
            enum: ["work", "home"],
            default: "home",
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// User Schema
const userSchema = new Schema(
    {
        username: {
            type: String,
            trim: true,
            minLength: 5,
            maxLength: 20,
            lowercase: true,
            unique: true,
            immutable: true,
            index: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            required: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
            unique: true,
            required: true,
        },
        profilePicture: {
            type: String,
            required: true,
        },
        fullName: {
            firstName: {
                type: String,
                trim: true,
                required: true,
            },
            lastName: {
                type: String,
                trim: true,
            },
        },
        addresses: [addressSchema],
        role: {
            type: String,
            enum: ["user", "seller"],
            default: "user",
        },
        password: {
            type: String,
            select: false,
            required: true,
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);

// Hash the password before saving (only if it was modified)
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Unable to process password at the moment. Please try again.",
            "PASSWORD_HASHING_FAILED",
            true,
            error.message
        );
    }
});

// Generate access token (JWT Token)
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            role: this.role,
        },
        config.JWT.ACCESS_TOKEN_SECRET,
        {
            expiresIn: config.JWT.ACCESS_TOKEN_EXPIRATION,
        }
    );
};

// Generate refresh token (JWT Token)
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({ _id: this._id }, config.JWT.REFRESH_TOKEN_SECRET, {
        expiresIn: config.JWT.REFRESH_TOKEN_EXPIRATION,
    });
};

const User = model("User", userSchema);
export default User;
