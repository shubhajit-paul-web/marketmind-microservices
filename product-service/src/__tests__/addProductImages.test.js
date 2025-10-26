/* eslint-disable no-undef */
import request from "supertest";
import createProduct from "./test-utils/createProduct.js";
import path from "path";
import { fileURLToPath } from "url";
import app from "../app.js";
import responseMessages from "../constants/responseMessages.js";
import productPayload from "./test-utils/productPayload.js";
import errorCodes from "../constants/errorCodes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("POST /api/v1/products/:productId/images", () => {
    // Test Case 1: Successfully add new images to an existing product
    // Given an existing product and valid authentication
    // When POST /api/v1/products/:productId/images is called with image files
    // Then respond 200 and return the updated product with new images added
    it("should successfully add new images to an existing product", async () => {
        const { createdProduct, token } = await createProduct();
        const res = await request(app)
            .post(`/api/v1/products/${createdProduct.body?.data?._id}/images`)
            .attach("images", path.join(__dirname, "test-utils/images/product-img1.jpg"))
            .attach("images", path.join(__dirname, "test-utils/images/product-img2.jpg"))
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe(responseMessages.IMAGE_UPLOAD_SUCCESS);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.name).toBe(productPayload.name);
        expect(res.body.data.description).toBe(productPayload.description);
        expect(res.body.data.category).toBe(productPayload.category);
        expect(res.body.data.stock).toBe(productPayload.stock);
        expect(res.body.data.price).toBeDefined();
        expect(res.body.data.price.amount).toBe(productPayload.priceAmount);
        expect(res.body.data.price.discountPrice).toBe(productPayload.discountPrice);
        expect(res.body.data.price.currency).toBe(productPayload.priceCurrency);
        expect(Array.isArray(res.body.data.images)).toBe(true);
        expect(res.body.data.images?.length).toBe(4);
        expect(res.body.data.isActive).toBeDefined();
    });

    // Test Case 2: Attempt to add images without providing any files
    // Given an existing product and valid authentication
    // When POST /api/v1/products/:productId/images is called without image files
    // Then respond 400 and return an error message
    it("should return error when no images are provided", async () => {
        const { createdProduct, token } = await createProduct();
        const res = await request(app)
            .post(`/api/v1/products/${createdProduct.body?.data?._id}/images`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.errorCode).toBe(errorCodes.IMAGE_REQUIRED);
        expect(res.body.message).toBe(responseMessages.IMAGE_REQUIRED);
    });
});
