/* eslint-disable no-undef */
import request from "supertest";
import loginUser from "./test-utils/loginUser.js";
import app from "../app.js";
import responseMessages from "../constants/responseMessages.js";

describe("GET /api/v1/cart", () => {
    // Test Case: Successfully fetch the user's cart
    // Given a valid authenticated user
    // When GET /api/v1/cart is called with valid authorization token
    // Then respond 200 and return the user's cart with userId and items array
    it("should fetch the cart", async () => {
        const token = await loginUser();

        const res = await request(app).get("/api/v1/cart").set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe(responseMessages.CART_FETCHED_SUCCESS);
        expect(res.body.data).toBeDefined();
        expect(res.body.data?.userId).toBeDefined();
        expect(Array.isArray(res.body.data?.items)).toBe(true);
    });
});
