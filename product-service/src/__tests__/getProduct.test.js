/* eslint-disable no-undef */
import request from "supertest";
import createProduct from "./test-utils/createProduct.js";
import app from "../app.js";
import responseMessages from "../constants/responseMessages.js";
import productPayload from "./test-utils/productPayload.js";

describe("GET /api/v1/products/:productId", () => {
    // Test Case: Successful single product fetch
    // Given: A valid product exists and a valid authentication token is provided
    // When: GET /api/v1/products/:productId is called with the product's ID and Authorization header
    // Then: Responds 200 and returns the correct product object with all expected fields populated
    it("should fetch a single product", async () => {
        const { createdProduct } = await createProduct();

        const res = await request(app).get(`/api/v1/products/${createdProduct.body?.data?._id}`);

        expect(res.body.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe(responseMessages.PRODUCT_FETCHED_SUCCESS);
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
        expect(res.body.data.images?.length).toBe(2);
        expect(res.body.data.isActive).toBeDefined();
    });
});
