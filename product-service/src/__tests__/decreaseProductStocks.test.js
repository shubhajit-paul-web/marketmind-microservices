/* eslint-disable no-undef */
import createProduct from "./test-utils/createProduct.js";
import responseMessages from "../constants/responseMessages.js";
import request from "supertest";
import app from "../app.js";
import errorCodes from "../constants/errorCodes.js";
import productPayload from "./test-utils/productPayload.js";

describe("PATCH /api/v1/products/:productId/stock", () => {
    // Test Case 1: Successfully decrease product stock
    // Given a valid product with current stock and valid stock amount to decrease
    // When PATCH /api/v1/products/:productId/stock is called with valid stock amount
    // Then respond with 200 and return the updated product with reduced stock
    it("should decrease product stock and return the updated product with 200 status code", async () => {
        const { createdProduct, token } = await createProduct();
        const productId = createdProduct.body.data._id;
        const initialStock = productPayload.stock;
        const stockToDecrease = 10;
        const expectedStock = initialStock - stockToDecrease;

        const res = await request(app)
            .patch(`/api/v1/products/${productId}/stock`)
            .set("Authorization", `Bearer ${token}`)
            .send({ stock: stockToDecrease })
            .expect(200);

        expect(res.body.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe(responseMessages.PRODUCT_STOCK_UPDATED_SUCCESS);
        expect(res.body.data).toBeDefined();
        expect(res.body.data._id).toBe(productId);
        expect(res.body.data.stock).toBe(expectedStock);
    });

    // Test Case 2: Decrease stock to zero
    // Given a product with stock amount equal to decrease amount
    // When PATCH /api/v1/products/:productId/stock is called with same stock amount
    // Then respond with 200 and return product with zero stock
    it("should decrease product stock to zero and return updated product", async () => {
        const { createdProduct, token } = await createProduct();
        const productId = createdProduct.body.data._id;
        const initialStock = productPayload.stock;

        const res = await request(app)
            .patch(`/api/v1/products/${productId}/stock`)
            .set("Authorization", `Bearer ${token}`)
            .send({ stock: initialStock })
            .expect(200);

        expect(res.body.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.stock).toBe(0);
    });

    // Test Case 3: Product not found
    // Given an invalid/non-existent product ID
    // When PATCH /api/v1/products/:productId/stock is called
    // Then respond with 404 and return product not found error
    it("should return 404 error when product does not exist", async () => {
        const { token } = await createProduct();
        const invalidProductId = "507f1f77bcf86cd799439011";

        const res = await request(app)
            .patch(`/api/v1/products/${invalidProductId}/stock`)
            .set("Authorization", `Bearer ${token}`)
            .send({ stock: 5 })
            .expect(404);

        expect(res.body.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe(responseMessages.PRODUCT_NOT_FOUND);
        expect(res.body.errorCode).toBe(errorCodes.PRODUCT_NOT_FOUND);
    });

    // Test Case 4: Missing stock field in request body
    // Given no stock amount provided in request
    // When PATCH /api/v1/products/:productId/stock is called without stock
    // Then respond with 400 and return validation error
    it("should return 400 error when stock field is missing", async () => {
        const { createdProduct, token } = await createProduct();
        const productId = createdProduct.body.data._id;

        const res = await request(app)
            .patch(`/api/v1/products/${productId}/stock`)
            .set("Authorization", `Bearer ${token}`)
            .send({})
            .expect(400);

        expect(res.body.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    // Test Case 6: Invalid stock value (negative)
    // Given negative stock amount
    // When PATCH /api/v1/products/:productId/stock is called with negative stock
    // Then respond with 400 and return validation error
    it("should return 400 error when stock amount is negative", async () => {
        const { createdProduct, token } = await createProduct();
        const productId = createdProduct.body.data._id;

        const res = await request(app)
            .patch(`/api/v1/products/${productId}/stock`)
            .set("Authorization", `Bearer ${token}`)
            .send({ stock: -5 })
            .expect(400);

        expect(res.body.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});
