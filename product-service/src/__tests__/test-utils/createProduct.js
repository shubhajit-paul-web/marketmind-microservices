import path from "path";
import { fileURLToPath } from "url";
import loginUser from "./loginUser.js";
import request from "supertest";
import app from "../../app.js";
import productPayload from "./productPayload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createProduct() {
    const token = await loginUser();

    return await request(app)
        .post("/api/v1/products")
        .field("name", productPayload.name)
        .field("description", productPayload.description)
        .field("category", productPayload.category)
        .field("stock", productPayload.stock)
        .field("price.amount", productPayload["price.amount"])
        .field("price.discountPrice", productPayload["price.discountPrice"])
        .field("price.currency", productPayload["price.currency"])
        .attach("images", path.join(__dirname, "images/product-img1.jpg"))
        .attach("images", path.join(__dirname, "images/product-img2.jpg"))
        .set("Authorization", `Bearer ${token}`)
        .expect(201);
}

export default createProduct;
