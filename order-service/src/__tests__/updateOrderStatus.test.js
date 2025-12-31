/* eslint-disable no-undef */
import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import _config from "../config/config.js";
import createOrder from "./test-utils/createOrder.js";
import token from "./test-utils/accessToken.js";

describe("PATCH /api/v1/orders/:orderId/status - updateOrderStatus", () => {
    let createdOrderId;
    const orderManagerToken = jwt.sign(
        {
            _id: "693858d6aeb661e154bebe17",
            role: "order_manager",
        },
        _config.JWT.ACCESS_TOKEN_SECRET
    );

    beforeEach(async () => {
        createdOrderId = await createOrder(token);
    });

    // Test case 1: Successfully update order status with valid data and order_manager role
    it("should update order status successfully with valid status and order_manager token", async () => {
        const res = await request(app)
            .patch(`/api/v1/orders/${createdOrderId}/status`)
            .set("Authorization", `Bearer ${orderManagerToken}`)
            .send({ status: "SHIPPED" });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("data");
        expect(res.body?.data?.status).toBe("SHIPPED");
    });

    // Test case 2: Return 401 when trying to update status with user role instead of order_manager
    it("should return 401 when updating status with user role instead of order_manager", async () => {
        const res = await request(app)
            .patch(`/api/v1/orders/${createdOrderId}/status`)
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "DELIVERED" });

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty("success", false);
    });

    // Test case 3: Return 400 for invalid status value
    it("should return 400 when updating with invalid status value", async () => {
        const res = await request(app)
            .patch(`/api/v1/orders/${createdOrderId}/status`)
            .set("Authorization", `Bearer ${orderManagerToken}`)
            .send({ status: "INVALID_STATUS" });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("errors");
    });

    // Test case 4: Return 401 when updating status without authentication token
    it("should return 401 when updating status without authentication token", async () => {
        const res = await request(app)
            .patch(`/api/v1/orders/${createdOrderId}/status`)
            .send({ status: "CONFIRMED" });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("success", false);
    });
});
