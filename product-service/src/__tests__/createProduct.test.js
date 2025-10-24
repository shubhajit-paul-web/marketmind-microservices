/* eslint-disable no-undef */
import createProduct from "./test-utils/createProduct.js";
import responseMessages from "../constants/responseMessages.js";
import productPayload from "./test-utils/productPayload.js";

describe("POST /api/v1/products", () => {
    it("should create a product and return a success response with 200 status code and created product object", async () => {
        const res = await createProduct();

        expect(res.body.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe(responseMessages.PRODUCT_CREATED_SUCCESS);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.name).toBe(productPayload.name);
        expect(res.body.data.description).toBe(productPayload.description);
        expect(res.body.data.category).toBe(productPayload.category);
        expect(res.body.data.stock).toBe(productPayload.stock);
        expect(res.body.data.price).toBeDefined();
        expect(res.body.data.price.amount).toBe(productPayload["price.amount"]);
        expect(res.body.data.price.discountPrice).toBe(productPayload["price.discountPrice"]);
        expect(res.body.data.price.currency).toBe(productPayload["price.currency"]);
        expect(Array.isArray(res.body.data.images)).toBe(true);
        expect(res.body.data.images?.length).toBe(2);
        expect(res.body.data.isActive).toBeDefined();
    });
});
