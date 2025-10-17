/* eslint-disable no-undef */
import request from "supertest";
import registerUser from "./test-utils/registerUser.js";
import app from "../app.js";
import registerUserPayload from "./test-utils/registerUserPayload.js";
import hasCookies from "./test-utils/hasCookies.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";

describe("PATCH /api/v1/auth/password", () => {
    // Test Case 1: Successful password change for an authenticated user
    // Given an authenticated user provides the correct old password
    // When PATCH /api/v1/auth/password is called with the old and a new password
    // Then respond with 200, a success message, and new auth tokens in cookies
    it("should successfully change the password and issue new auth tokens", async () => {
        const registerUserResponse = await registerUser();
        const registerUserCookies = registerUserResponse.headers["set-cookie"];

        const res = await request(app)
            .patch("/api/v1/auth/password")
            .send({
                oldPassword: registerUserPayload.password,
                newPassword: "DEV123#***",
            })
            .set("Cookie", registerUserCookies);

        const resCookies = hasCookies(res);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe(responseMessages.UPDATED("Password"));
        expect(resCookies).toBeDefined();
        expect(resCookies.accessToken).toBe(true);
        expect(resCookies.refreshToken).toBe(true);
    });

    // Test Case 2: Failed password change due to incorrect credentials
    // Given an authenticated user provides an incorrect old password
    // When PATCH /api/v1/auth/password is called
    // Then respond with 401 Unauthorized and a specific error message
    it("should return a 401 Unauthorized error when the old password is incorrect", async () => {
        const registerUserResponse = await registerUser();
        const registerUserCookies = registerUserResponse.headers["set-cookie"];

        const res = await request(app)
            .patch("/api/v1/auth/password")
            .send({
                oldPassword: "ABCDabcd4654#*", // wrong old password
                newPassword: "DEV123#***",
            })
            .set("Cookie", registerUserCookies);

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(401);
        expect(res.body.errorCode).toBe(errorCodes.PASSWORDS_DO_NOT_MATCH);
        expect(res.body.message).toBe(responseMessages.INVALID("Old password"));
    });
});
