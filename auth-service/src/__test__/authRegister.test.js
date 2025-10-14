/* eslint-disable no-undef */
import request from "supertest";
import app from "../app.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";
import registerUser from "./test-utils/registerUser.js";
import registerUserPayload from "./test-utils/registerUserPayload.js";
import hasCookies from "./test-utils/hasCookies.js";

// Testing Register API
describe("POST /api/v1/auth/register", () => {
    // Test Case 1: Successful registration
    // Given a valid user payload
    // When POST /api/v1/auth/register is called
    // Then respond 201 and return the user without the password field
    it("should creates a user and returns 201 with user (no password)", async () => {
        const res = await registerUser();

        const cookies = hasCookies(res);

        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(201);
        expect(res.body.message).toBe(responseMessages.REGISTERED_SUCCESS);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.username).toBe(registerUserPayload.username);
        expect(res.body.data.email).toBe(registerUserPayload.email);
        expect(res.body.data.phoneNumber).toBe("+918645789512");
        expect(res.body.data.profilePicture).toBeDefined();
        expect(res.body.data.fullName).toBeDefined();
        expect(res.body.data.fullName.firstName).toBe(registerUserPayload.firstName);
        expect(res.body.data.fullName.lastName).toBe(registerUserPayload.lastName);
        expect(res.body.data.password).toBeUndefined();
        expect(cookies).toBeDefined();
        expect(cookies.accessToken).toBe(true);
        expect(cookies.refreshToken).toBe(true);
    });

    // Test Case 2: Duplicate username/email
    // Given a user is already registered
    // When attempting to register again with the same username/email
    // Then respond 409 with errorCode DUPLICATE_USERNAME_EMAIL and proper message
    it("rejects duplicate username/email with 409", async () => {
        await registerUser();

        const res = await registerUser(409);

        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(409);
        expect(res.body.errorCode).toBe(errorCodes.USER_ALREADY_EXISTS);
        expect(res.body.message).toBe(responseMessages.USER_ALREADY_EXISTS);
        expect(res.body.isOperational).toBe(true);
    });

    // Test Case 3: Missing required fields
    // Given an incomplete payload (only username provided)
    // When POST /api/v1/auth/register is called
    // Then respond 400 with errorCode MISSING_REQUIRED_FIELDS, isOperational=true, and details
    it("validates missing fields with 400", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .field("username", registerUserPayload.username);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.errorCode).toBe(errorCodes.MISSING_REQUIRED_FIELDS);
        expect(res.body.isOperational).toBe(true);
        expect(res.body.message).toBe(responseMessages.MISSING_REQUIRED_FIELDS);
    });
});
