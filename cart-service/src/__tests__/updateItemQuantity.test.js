/* eslint-disable no-undef */
import createProduct from "./test-utils/createProduct.js";
import request from "supertest";
import app from "../app.js";

describe("POST /api/v1/cart/items/:productId", () => {
    // Test Case: Successfully update an item's quantity in the user's cart
    // Given a valid authenticated user with an item already in their cart
    // When PATCH /api/v1/cart/items/:productId is called with a new quantity
    // Then respond 200 and return the updated cart with the new item quantity
    it("should update an item on user's cart", async () => {
        const { createdProduct: createdProductId, token } = await createProduct();
        // Add an item to user's cart
        await request(app)
            .post("/api/v1/cart/items")
            .send({
                productId: createdProductId,
                qty: 12, // old quantity
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        // Update the cart's item quantity
        const res = await request(app)
            .patch(`/api/v1/cart/items/${createdProductId}`)
            .send({ qty: 30 }) // 12 -> 30 (updated item quantity)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(res.body?.statusCode).toBe(200);
        expect(res.body?.data).toBeDefined();
        expect(res.body.data.userId).toBeDefined();
        expect(Array.isArray(res.body.data.items)).toBe(true);
        expect(res.body.data.items[0]?.productId).toBe(createdProductId);
        expect(res.body.data.items[0]?.quantity).toBe(30); // updated item quantity
    });
});
