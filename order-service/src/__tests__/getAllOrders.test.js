/* eslint-disable no-undef */
import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import _config from "../config/config.js";

describe("GET /api/v1/orders - getAllOrders", () => {
    const token = jwt.sign(
        {
            _id: "68fbc422a7decf69519bb708",
            role: "user",
        },
        _config.JWT.ACCESS_TOKEN_SECRET
    );

    beforeAll(async () => {
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

        await request(app)
            .post("/api/v1/orders")
            .set("Authorization", `Bearer ${token}`)
            .send(validOrderData);
    });

    // Test case 1: Successfully get all orders with valid auth token
    it("should retrieve all orders successfully with valid authentication", async () => {
        const response = await request(app)
            .get("/api/v1/orders")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(Array.isArray(response.body?.data)).toBe(true);
        expect(response.body).toHaveProperty("meta");
        expect(response.body?.meta).toHaveProperty("page");
        expect(response.body?.meta).toHaveProperty("limit");
        expect(response.body?.meta).toHaveProperty("totalOrders");
        expect(response.body?.meta).toHaveProperty("totalPages");
        expect(response.body?.meta).toHaveProperty("ordersPerPage");
        expect(response.body?.meta).toHaveProperty("hasNextPage");
        expect(response.body?.meta).toHaveProperty("hasPrevPage");
        expect(response.body?.meta).toHaveProperty("nextPage");
        expect(response.body?.meta).toHaveProperty("prevPage");
    });

    // Test case 2: Get orders without authentication token
    it("should return 401 when retrieving orders without authentication token", async () => {
        const response = await request(app).get("/api/v1/orders");

        expect(response.status).toBe(401);
    });

    // Test case 3: Get orders with pagination query parameters
    it("should retrieve orders with pagination parameters", async () => {
        const response = await request(app)
            .get("/api/v1/orders?page=1&limit=10")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
        expect(Array.isArray(response.body?.data)).toBe(true);
        expect(response.body).toHaveProperty("meta");
    });

    // Test case 4: Get orders with invalid/expired token
    it("should return 401 when using an invalid authentication token", async () => {
        const invalidToken = "invalid.token.here";

        const response = await request(app)
            .get("/api/v1/orders")
            .set("Authorization", `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
    });
});
