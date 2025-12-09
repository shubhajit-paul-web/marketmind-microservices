import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import config from "../../config/config.js";

async function loginUser(role = "user") {
    return jwt.sign(
        {
            _id: new mongoose.Types.ObjectId().toHexString(),
            username: "shubhajit_store",
            role: role,
        },
        config.JWT.ACCESS_TOKEN_SECRET
    );
}

export default loginUser;
