/* eslint-disable no-undef */
import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import _config from "../config/config.js";

describe("POST /api/v1/orders - CreateOrder", () => {
    const token = jwt.sign(
        {
            _id: "68fbc422a7decf69519bb708",
            role: "user",
        },
        _config.JWT.ACCESS_TOKEN_SECRET
    );

    // Test case 1: Successfully create an order with valid data and auth token
    it("should create an order successfully with valid shipping address and currency", async () => {
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

        const response = await request(app)
            .post("/api/v1/orders")
            .set("Authorization", `Bearer ${token}`)
            .send(validOrderData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body?.data).toHaveProperty("_id", response.body?.data?._id);
        expect(response.body?.data).toHaveProperty("status");
        expect(response.body?.data).toHaveProperty("customerDetails");
    });

    // Test case 2: Create order without authentication token
    it("should return 401 when creating order without authentication token", async () => {
        const validOrderData = {
            currency: "INR",
            shippingAddress: {
                street: "456 Oak Avenue",
                city: "Los Angeles",
                state: "California",
                zip: "90001",
                country: "United States",
                landmark: "Downtown",
                typeOfAddress: "work",
            },
        };

        const response = await request(app).post("/api/v1/orders").send(validOrderData);

        expect(response.status).toBe(401);
    });

    // Test case 3: Create order with missing required shipping address fields
    it("should return 400 when shipping address is incomplete (missing city)", async () => {
        const invalidOrderData = {
            currency: "USD",
            shippingAddress: {
                street: "789 Pine Road",
                // city is missing
                state: "Texas",
                zip: "75001",
                country: "United States",
                typeOfAddress: "home",
            },
        };

        const response = await request(app)
            .post("/api/v1/orders")
            .set("Authorization", `Bearer ${token}`)
            .send(invalidOrderData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors[0]).toHaveProperty("path");
        expect(response.body.errors[0]).toHaveProperty("message");
    });

    // Test case 4: Create order with invalid currency
    it("should return 400 when currency is not INR or USD", async () => {
        const invalidOrderData = {
            currency: "EUR",
            shippingAddress: {
                street: "321 Elm Street",
                city: "Chicago",
                state: "Illinois",
                zip: "60601",
                country: "United States",
                typeOfAddress: "home",
            },
        };

        const response = await request(app)
            .post("/api/v1/orders")
            .set("Authorization", `Bearer ${token}`)
            .send(invalidOrderData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors[0]).toHaveProperty("path");
        expect(response.body.errors[0]).toHaveProperty("message");
    });

    // Test case 5: Create order with invalid ZIP code format
    it("should return 400 when ZIP code is not 5-7 characters", async () => {
        const invalidOrderData = {
            currency: "INR",
            shippingAddress: {
                street: "555 Maple Lane",
                city: "Boston",
                state: "Massachusetts",
                zip: "123", // Too short
                country: "United States",
                typeOfAddress: "home",
            },
        };

        const response = await request(app)
            .post("/api/v1/orders")
            .set("Authorization", `Bearer ${token}`)
            .send(invalidOrderData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors[0]).toHaveProperty("path");
        expect(response.body.errors[0]).toHaveProperty("message");
    });

    // Test case 6: Create order with default currency (INR)
    it("should create order with default currency (INR) when currency is not provided", async () => {
        const orderDataWithoutCurrency = {
            shippingAddress: {
                street: "999 Birch Court",
                city: "Seattle",
                state: "Washington",
                zip: "98101",
                country: "United States",
                typeOfAddress: "home",
            },
        };

        const response = await request(app)
            .post("/api/v1/orders")
            .set("Authorization", `Bearer ${token}`)
            .send(orderDataWithoutCurrency);

        expect(response.status).toBe(201);
    });
});
