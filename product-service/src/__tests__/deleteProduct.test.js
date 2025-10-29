/* eslint-disable no-undef */
import request from "supertest";
import createProduct from "./test-utils/createProduct.js";
import app from "../app.js";
import responseMessages from "../constants/responseMessages.js";

describe("DELETE /api/v1/products/:productId", () => {
    // Test Case 1: Delete existing product
    // Given an authenticated user and an existing product
    // When DELETE /api/v1/products/:productId is called with a valid token
    // Then respond 200 with PRODUCT_DELETED_SUCCESS and data: null
    it("deletes an existing product", async () => {
        const { createdProduct, token } = await createProduct();

        const productId = createdProduct.body?.data?._id;

        const res = await request(app)
            .delete(`/api/v1/products/${productId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe(responseMessages.PRODUCT_DELETED_SUCCESS);
        expect(res.body.data).toBe(null);
    });
});
