/* eslint-disable no-undef */
import request from "supertest";
import app from "../app.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";
import registerUser from "./test-utils/registerUser.js";
import registerUserPayload from "./test-utils/registerUserPayload.js";

describe("POST /api/v1/auth/login", () => {
    // Test Case 1: Successful login
    // Given a registered user with valid credentials
    // When POST /api/v1/auth/login is called with valid identifier and password
    // Then respond 200 and return the user data without the password field
    it("should successfully login user with valid credentials and return 200 with user data", async () => {
        // Register user
        await registerUser();

        // Login user
        const res = await request(app).post("/api/v1/auth/login").send({
            identifier: registerUserPayload.username,
            password: registerUserPayload.password,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe(responseMessages.LOGIN_SUCCESS);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.username).toBe(registerUserPayload.username);
        expect(res.body.data.email).toBe(registerUserPayload.email);
        expect(res.body.data.phoneNumber).toBe("+918645789512");
        expect(res.body.data.fullName).toBeDefined();
        expect(res.body.data.fullName.firstName).toBe(registerUserPayload.firstName);
        expect(res.body.data.fullName.lastName).toBe(registerUserPayload.lastName);
        expect(res.body.data.profilePicture).toBeDefined();
        expect(res.body.data.addresses).toBeDefined();
        expect(res.body.data.password).toBeUndefined();
    });

    // Test Case 2: Login attempt with non-existent username
    // Given a user that is not registered in the system
    // When POST /api/v1/auth/login is called with a non-existent username
    // Then respond with 404 status code and USER_NOT_FOUND error
    it("should return 404 when attempting to login with a non-existent username", async () => {
        // Register a user
        await registerUser();

        const res = await request(app).post("/api/v1/auth/login").send({
            identifier: "wrong_username", // wrong identifier
            password: "ABabc123#*",
        });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.errorCode).toBe(errorCodes.USER_NOT_FOUND);
        expect(res.body.isOperational).toBe(true);
        expect(res.body.message).toBe(responseMessages.USER_NOT_FOUND);
    });

    // Test Case 3: Login attempt with incorrect password
    // Given a registered user in the system
    // When POST /api/v1/auth/login is called with correct username but incorrect password
    // Then respond with 401 status code and INCORRECT_PASSWORD error
    it("should return 401 when attempting to login with an incorrect password", async () => {
        // Register a user
        await registerUser();

        const res = await request(app).post("/api/v1/auth/login").send({
            identifier: registerUserPayload.username,
            password: "dAk1348*##", // wrong password
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(401);
        expect(res.body.errorCode).toBe(errorCodes.INVALID_CREDENTIALS);
        expect(res.body.isOperational).toBe(true);
        expect(res.body.message).toBe(responseMessages.INVALID_CREDENTIALS);
    });

    // Test Case 4: Login attempt with missing required fields
    // Given a login request with missing password field
    // When POST /api/v1/auth/login is called without all required fields
    // Then respond with 400 status code and MISSING_REQUIRED_FIELDS error
    it("validates missing fields with 400", async () => {
        const res = await request(app).post("/api/v1/auth/login").send({
            identifier: registerUserPayload.username,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.errorCode).toBe(errorCodes.MISSING_REQUIRED_FIELDS);
        expect(res.body.isOperational).toBe(true);
        expect(res.body.message).toBe(responseMessages.MISSING_REQUIRED_FIELDS);
    });
});
