/* eslint-disable no-undef */
import request from "supertest";
import app from "../app.js";
import responseMessage from "../constants/responseMessage.js";
import { StatusCodes } from "http-status-codes";
import errorCodes from "../constants/errorCodes.js";

// Testing Register API
describe("POST /api/v1/auth/register", () => {
    // Dummy user data for registration (Payload)
    const payload = {
        username: "shubhajit123",
        email: "shubhajit@example.com",
        phoneNumber: "+91 0123456789",
        profilePicture: "image_url",
        fullName: {
            firstName: "Shubhajit",
            lastName: "Paul",
        },
        password: "abc123##**",
    };

    // Test Case 1: Successful registration
    // Given a valid user payload
    // When POST /api/v1/auth/register is called
    // Then respond 201 and return the user without the password field
    it("should creates a user and returns 201 with user (no password)", async () => {
        const res = await request(app).post("/api/v1/auth/register").send(payload);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(201);
        expect(res.body.message).toBe(responseMessage.REGISTERED_SUCCESS);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.username).toBe("shubhajit123");
        expect(res.body.data.email).toBe("shubhajit@example.com");
        expect(res.body.data.phoneNumber).toBe("+910123456789");
        expect(res.body.data.profilePicture).toBe("image_url");
        expect(res.body.data.fullName).toBeDefined();
        expect(res.body.data.fullName.firstName).toBe("Shubhajit");
        expect(res.body.data.fullName.lastName).toBe("Paul");
        expect(res.body.data.password).toBeUndefined();
    });

    // Test Case 2: Duplicate username/email
    // Given a user is already registered
    // When attempting to register again with the same username/email
    // Then respond 409 with errorCode DUPLICATE_USERNAME_EMAIL and proper message
    it("rejects duplicate username/email with 409", async () => {
        await request(app).post("/api/v1/auth/register").send(payload).expect(201);

        const res = await request(app).post("/api/v1/auth/register").send(payload);

        expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(res.body.errorCode).toBe(errorCodes.USERNAME_ALREADY_EXISTS);
        expect(res.body.message).toBe(responseMessage.DUPLICATE_USERNAME_EMAIL);
    });

    // Test Case 3: Missing required fields
    // Given an incomplete payload (only username provided)
    // When POST /api/v1/auth/register is called
    // Then respond 400 with errorCode MISSING_REQUIRED_FIELDS, isOperational=true, and details
    it("validates missing fields with 400", async () => {
        const res = await request(app).post("/api/v1/auth/register").send({
            username: "shubhajit123",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.errorCode).toBe("MISSING_REQUIRED_FIELDS");
        expect(res.body.isOperational).toBe(true);
        expect(res.body.message).toBe(responseMessage.MISSING_REQUIRED_FIELDS);
        expect(res.body.details).toBeDefined();
    });
});
