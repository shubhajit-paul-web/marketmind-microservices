/* eslint-disable no-undef */
import request from "supertest";
import path from "path";
import { fileURLToPath } from "url";
import app from "../app.js";
import responseMessages from "../constants/responseMessages.js";

describe("POST /api/v1/auth/login", () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    // Dummy user data for registration (Payload)
    const payload = {
        username: "shubhajit123",
        email: "shubhajit@example.com",
        phoneNumber: "(+91) 8645789512",
        firstName: "Shubhajit",
        lastName: "Paul",
        password: "WAab123##**",
        profilePicture: path.resolve(__dirname, "test-files/profile-img.jpeg"),
    };

    // Test Case 1: Successful login
    // Given a registered user with valid credentials
    // When POST /api/v1/auth/login is called with valid identifier and password
    // Then respond 200 and return the user data without the password field
    it("should successfully login user with valid credentials and return 200 with user data", async () => {
        // Register a user
        await request(app)
            .post("/api/v1/auth/register")
            .field("username", payload.username)
            .field("email", payload.email)
            .field("phoneNumber", payload.phoneNumber)
            .field("firstName", payload.firstName)
            .field("lastName", payload.lastName)
            .field("password", payload.password)
            .attach("profilePicture", payload.profilePicture)
            .expect(201);

        // Login user
        const res = await request(app).post("/api/v1/auth/login").send({
            identifier: payload.username,
            password: payload.password,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe(responseMessages.LOGIN_SUCCESS);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.username).toBe(payload.username);
        expect(res.body.data.email).toBe(payload.email);
        expect(res.body.data.phoneNumber).toBe(payload.phoneNumber);
        expect(res.body.data.fullName).toBeDefined();
        expect(res.body.data.fullName.firstName).toBe(payload.firstName);
        expect(res.body.data.fullName.lastName).toBe(payload.lastName);
        expect(res.body.data.profilePicture).toBeDefined();
        expect(res.body.data.addresses).toBeDefined();
        expect(res.body.data.password).toBeUndefined();
    });
});
