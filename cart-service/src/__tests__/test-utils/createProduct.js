import loginUser from "./loginUser.js";
import mongoose from "mongoose";

// Creates a new product
async function createProduct() {
    const token = await loginUser();

    const createdProduct = new mongoose.Types.ObjectId().toString();

    return { createdProduct, token };
}

export default createProduct;
