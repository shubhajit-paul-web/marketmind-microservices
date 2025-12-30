/* eslint-disable no-undef */
import request from "supertest";
import app from "../app.js";
import accessToken from "./test-utils/accessToken.js";
import createOrder from "./test-utils/createOrder.js";

describe("PATCH /api/v1/orders/:orderId/address - updateOrderAddress", () => {
    // Test case 1: Successfully update order address with valid data
    it("should update order address successfully with valid data and auth token", async () => {
        const orderId = await createOrder(accessToken);

        const updatedAddress = {
            street: "456 New Street",
            city: "Los Angeles",
            state: "California",
            zip: "90001",
        };

        const response = await request(app)
            .patch(`/api/v1/orders/${orderId}/address`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(updatedAddress);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty("shippingAddress");
        expect(response.body.data.shippingAddress.street).toBe(updatedAddress.street);
        expect(response.body.data.shippingAddress.city).toBe(updatedAddress.city);
    });

    // Test case 2: Update order address without authentication token
    it("should return 401 when updating address without authentication token", async () => {
        const orderId = await createOrder(accessToken);

        const updatedAddress = {
            city: "Chicago",
            state: "Illinois",
        };

        const response = await request(app)
            .patch(`/api/v1/orders/${orderId}/address`)
            .send(updatedAddress);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body).toHaveProperty("message");
    });

    // Test case 3: Update address with invalid orderId
    it("should return 400 when updating address with invalid orderId", async () => {
        const invalidOrderId = "invalid-order-id";

        const updatedAddress = {
            city: "Boston",
            state: "Massachusetts",
        };

        const response = await request(app)
            .patch(`/api/v1/orders/${invalidOrderId}/address`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(updatedAddress);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body).toHaveProperty("message");
    });

    // Test case 4: Update address with invalid field values
    it("should return 400 when updating address with invalid zip code length", async () => {
        const orderId = await createOrder(accessToken);

        const invalidAddress = {
            zip: "123", // Invalid: too short
        };

        const response = await request(app)
            .patch(`/api/v1/orders/${orderId}/address`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(invalidAddress);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("errors");
        expect(Array.isArray(response.body.errors)).toBe(true);
    });
});
