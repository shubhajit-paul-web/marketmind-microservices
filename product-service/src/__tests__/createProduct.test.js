/* eslint-disable no-undef */
import createProduct from "./test-utils/createProduct.js";
import responseMessages from "../constants/responseMessages.js";
import productPayload from "./test-utils/productPayload.js";
import request from "supertest";
import app from "../app.js";
import errorCodes from "../constants/errorCodes.js";
import loginUser from "./test-utils/loginUser.js";

describe("POST /api/v1/products", () => {
    // Test Case 1: Successful product creation
    // Given valid product data and authentication
    // When POST /api/v1/products is called with all required fields
    // Then respond 201 and return the created product object with correct fields
    it("should create a product and return a success response with 200 status code and created product object", async () => {
        // Create a product
        const { createdProduct: res } = await createProduct();

        expect(res.body.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe(responseMessages.PRODUCT_CREATED_SUCCESS);
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

    // Test Case 2: Product creation with missing fields
    // Given authentication but missing required product fields
    // When POST /api/v1/products is called with incomplete data
    // Then respond 400 and return validation error details
    it("should return 400 and validation errors when required product fields are missing", async () => {
        // Login user as seller
        const token = await loginUser();

        // Send create product request with missing required fields
        const res = await request(app)
            .post("/api/v1/products")
            .field("name", "Product name")
            .field("stock", 100)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.errorCode).toBe(errorCodes.VALIDATION_ERROR);
        expect(res.body.message).toBe(responseMessages.VALIDATION_ERROR);
        expect(Array.isArray(res.body.errors)).toBe(true);
    });
});
