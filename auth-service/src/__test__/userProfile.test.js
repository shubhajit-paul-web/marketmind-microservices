/* eslint-disable no-undef */
import request from "supertest";
import app from "../app.js";
import registerUser from "./test-utils/registerUser.js";
import responseMessages from "../constants/responseMessages.js";
import registerUserPayload from "./test-utils/registerUserPayload.js";
import errorCodes from "../constants/errorCodes.js";

describe("GET /api/v1/users/me", () => {
    // Test Case 1: Successful retrieval of user profile
    // Given an authenticated user with valid access token
    // When GET /api/v1/users/me is called with valid cookies
    // Then respond 200 and return the user profile data without the password field
    it("should successfully retrieve user profile with valid authentication and return 200 with user data", async () => {
        const registerUserResponse = await registerUser();

        const registerUserCookies = registerUserResponse.headers["set-cookie"];

        const res = await request(app).get("/api/v1/users/me").set("Cookie", registerUserCookies);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe(responseMessages.PROFILE_FETCHED_SUCCESS);
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
});

describe("PATCH /api/v1/users/me", () => {
    // Test Case 1: Successful profile update
    // Given an authenticated user
    // When a PATCH request is made to /api/v1/users/me with valid profile data and cookies
    // Then it should respond with 200 and the updated user profile
    it("should successfully update user profile and return 200 with updated user data", async () => {
        const registerUserResponse = await registerUser();
        const registerUserCookies = registerUserResponse.headers["set-cookie"];

        const res = await request(app)
            .patch("/api/v1/users/me")
            .field("email", "updated123@gmail.com")
            .field("firstName", "Sadhu")
            .attach("profilePicture", registerUserPayload.profilePicture)
            .set("Cookie", registerUserCookies);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe(responseMessages.UPDATED("User profile"));
        expect(res.body.data).toBeDefined();
        expect(res.body.data.username).toBe(registerUserPayload.username);
        expect(res.body.data.email).toBe("updated123@gmail.com"); // updated
        expect(res.body.data.phoneNumber).toBe("+918645789512");
        expect(res.body.data.fullName).toBeDefined();
        expect(res.body.data.fullName.firstName).toBe("Sadhu"); // updated
        expect(res.body.data.fullName.lastName).toBe(registerUserPayload.lastName);
        expect(res.body.data.profilePicture).toBeDefined(); // updated
        expect(res.body.data.addresses).toBeDefined();
        expect(res.body.data.password).toBeUndefined();
    });

    // Test Case 2: Incomplete profile update
    // Given an authenticated user
    // When a PATCH request is made to /api/v1/users/me with an incomplete request body
    // Then it should respond with a 400 error and a "missing required fields" message
    it("should fail to update user if request body is incomplete", async () => {
        const registerUserResponse = await registerUser();
        const registerUserCookies = registerUserResponse.headers["set-cookie"];

        const res = await request(app)
            .patch("/api/v1/users/me")
            .field("email", "updated123")
            .set("Cookie", registerUserCookies);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.errorCode).toBe(errorCodes.MISSING_REQUIRED_FIELDS);
        expect(res.body.isOperational).toBe(true);
        expect(res.body.message).toBe(responseMessages.MISSING_REQUIRED_FIELDS);
        expect(Array.isArray(res.body.errors)).toBe(true);
    });
});
