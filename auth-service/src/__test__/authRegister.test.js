/* eslint-disable no-undef */
import request from "supertest";
import app from "../app.js";
import responseMessage from "../constants/responseMessage.js";
import { StatusCodes } from "http-status-codes";
import errorCodes from "../constants/errorCodes.js";
import path from "path";
import { fileURLToPath } from "url";

// Testing Register API
describe("POST /api/v1/auth/register", () => {
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

    // Test Case 1: Successful registration
    // Given a valid user payload
    // When POST /api/v1/auth/register is called
    // Then respond 201 and return the user without the password field
    it("should creates a user and returns 201 with user (no password)", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .field("username", payload.username)
            .field("email", payload.email)
            .field("phoneNumber", payload.phoneNumber)
            .field("firstName", payload.firstName)
            .field("lastName", payload.lastName)
            .field("password", payload.password)
            .attach("profilePicture", payload.profilePicture);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(201);
        expect(res.body.message).toBe(responseMessage.REGISTERED_SUCCESS);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.username).toBe(payload.username);
        expect(res.body.data.email).toBe(payload.email);
        expect(res.body.data.phoneNumber).toBe("+918645789512");
        expect(res.body.data.profilePicture).toBeDefined();
        expect(res.body.data.fullName).toBeDefined();
        expect(res.body.data.fullName.firstName).toBe(payload.firstName);
        expect(res.body.data.fullName.lastName).toBe(payload.lastName);
        expect(res.body.data.password).toBeUndefined();
    });

    // Test Case 2: Duplicate username/email
    // Given a user is already registered
    // When attempting to register again with the same username/email
    // Then respond 409 with errorCode DUPLICATE_USERNAME_EMAIL and proper message
    it("rejects duplicate username/email with 409", async () => {
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

        const res = await request(app)
            .post("/api/v1/auth/register")
            .field("username", payload.username)
            .field("email", payload.email)
            .field("phoneNumber", payload.phoneNumber)
            .field("firstName", payload.firstName)
            .field("lastName", payload.lastName)
            .field("password", payload.password)
            .attach("profilePicture", payload.profilePicture);

        expect(res.statusCode).toBe(StatusCodes.CONFLICT);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(StatusCodes.CONFLICT);
        expect(res.body.errorCode).toBe(errorCodes.USER_ALREADY_EXISTS);
        expect(res.body.message).toBe(responseMessage.USER_ALREADY_EXISTS);
    });

    // Test Case 3: Missing required fields
    // Given an incomplete payload (only username provided)
    // When POST /api/v1/auth/register is called
    // Then respond 400 with errorCode MISSING_REQUIRED_FIELDS, isOperational=true, and details
    it("validates missing fields with 400", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .field("username", payload.username);

        expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(res.body.errorCode).toBe(errorCodes.MISSING_REQUIRED_FIELDS);
        expect(res.body.isOperational).toBe(true);
        expect(res.body.message).toBe(responseMessage.MISSING_REQUIRED_FIELDS);
    });
});
