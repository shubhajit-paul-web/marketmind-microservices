/* eslint-disable no-undef */
import request from "supertest";
import app from "../app.js";
import token from "./test-utils/accessToken.js";
import createOrder from "./test-utils/createOrder.js";

describe("GET /api/v1/orders/:orderId - getOrderById", () => {
    let createdOrderId;

    beforeEach(async () => {
        createdOrderId = await createOrder(token);
    });

    // Test case 1: Successfully fetch order with valid orderId and auth
    it("should fetch an order successfully with a valid orderId and auth", async () => {
        const res = await request(app)
            .get(`/api/v1/orders/${createdOrderId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("data");
        expect(res.body?.data).toHaveProperty("_id", createdOrderId);
        expect(res.body).toHaveProperty("message");
    });

    // Test case 2: Return 400 for invalid orderId format with auth
    it("should return 400 for invalid orderId format with auth", async () => {
        const res = await request(app)
            .get("/api/v1/orders/invalid-id")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message");
        expect(res.body).toHaveProperty("errors");
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors[0]).toHaveProperty("path", "orderId");
    });

    // Test case 3: Return 401 when accessing without authentication token
    it("should return 401 when accessing without authentication token", async () => {
        const res = await request(app).get(`/api/v1/orders/${createdOrderId}`);

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message");
    });
});
