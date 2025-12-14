/* eslint-disable no-undef */
import createProduct from "./test-utils/createProduct.js";
import request from "supertest";
import app from "../app.js";

describe("POST /api/v1/cart/items", () => {
    // Test Case: Successfully add an item to the user's cart
    // Given a valid authenticated user and a product
    // When POST /api/v1/cart/items is called with productId and quantity
    // Then respond 200 and return the updated cart with the new item
    it("should add an item to user's cart", async () => {
        const { createdProduct: createdProductId, token } = await createProduct();
        const res = await request(app)
            .post("/api/v1/cart/items")
            .send({
                productId: createdProductId,
                qty: 12,
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(res.body?.statusCode).toBe(200);
        expect(res.body?.data).toBeDefined();
        expect(res.body.data.userId).toBeDefined();
        expect(Array.isArray(res.body.data.items)).toBe(true);
        expect(res.body.data.items[0]?.productId).toBe(createdProductId);
        expect(res.body.data.items[0]?.quantity).toBe(12);
    });
});
