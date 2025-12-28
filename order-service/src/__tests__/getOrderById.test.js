/* eslint-disable no-undef */
import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import _config from "../config/config.js";

describe("GET /api/v1/orders/:orderId - getOrderById", () => {
    const token = jwt.sign(
        {
            _id: "68fbc422a7decf69519bb708",
            role: "user",
        },
        _config.JWT.ACCESS_TOKEN_SECRET
    );

    let createdOrderId;

    beforeEach(async () => {
        // Create an order first to have a valid orderId for retrieval
        const validOrderData = {
            currency: "INR",
            shippingAddress: {
                street: "123 Main Street",
                city: "New York",
                state: "New York",
                zip: "10001",
                country: "United States",
                landmark: "Near Central Park",
                typeOfAddress: "home",
            },
        };

        const createRes = await request(app)
            .post("/api/v1/orders")
            .set("Authorization", `Bearer ${token}`)
            .send(validOrderData);

        // Capture the created order id if creation succeeded
        createdOrderId = createRes?.body?.data?._id;
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
