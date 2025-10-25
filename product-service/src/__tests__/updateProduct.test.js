/* eslint-disable no-undef */
import request from "supertest";
import createProduct from "./test-utils/createProduct.js";
import app from "../app.js";
import responseMessages from "../constants/responseMessages.js";
import productPayload from "./test-utils/productPayload.js";
import errorCodes from "../constants/errorCodes.js";

describe("PATCH /api/v1/products/:productId", () => {
    // Test Case 1: Successful product update with partial fields
    // Given an existing product and valid authentication
    // When PATCH /api/v1/products/:productId is called with partial fields
    // Then respond 200 and return updated product with changed and unchanged fields
    it("should successfully update product with partial fields and return updated data", async () => {
        // Create a product
        const { createdProduct, token } = await createProduct();

        // Update the existing product
        const res = await request(app)
            .patch(`/api/v1/products/${createdProduct.body?.data?._id}`)
            .send({
                name: "Updated product title",
                stock: 250,
                price: {
                    discountPrice: 499,
                },
            })
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe(responseMessages.PRODUCT_UPDATED_SUCCESS);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.name).toBe("Updated product title"); // updated field
        expect(res.body.data.description).toBe(productPayload.description);
        expect(res.body.data.category).toBe(productPayload.category);
        expect(res.body.data.stock).toBe(250); // updated field
        expect(res.body.data.price).toBeDefined();
        expect(res.body.data.price.amount).toBe(productPayload.priceAmount);
        expect(res.body.data.price.discountPrice).toBe(499); // updated field
        expect(res.body.data.price.currency).toBe(productPayload.priceCurrency);
        expect(Array.isArray(res.body.data.images)).toBe(true);
        expect(res.body.data.images?.length).toBe(2);
        expect(res.body.data.isActive).toBeDefined();
    });

    // Test Case 2: Update request with empty body validation
    // Given an existing product and valid authentication
    // When PATCH /api/v1/products/:productId is called with empty request body
    // Then respond 400 and return missing required fields error
    it("should return 400 error when updating product with empty request body", async () => {
        // Create a product
        const { createdProduct, token } = await createProduct();

        // Update the existing product
        const res = await request(app)
            .patch(`/api/v1/products/${createdProduct.body?.data?._id}`)
            .send({}) // empty request body
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.message).toBe(responseMessages.MISSING_REQUIRED_FIELDS);
        expect(res.body.errorCode).toBe(errorCodes.MISSING_REQUIRED_FIELDS);
    });
});
