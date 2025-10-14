/* eslint-disable no-undef */
import request from "supertest";
import registerUser from "./test-utils/registerUser.js";
import registerUserPayload from "./test-utils/registerUserPayload.js";
import app from "../app.js";
import hasCookies from "./test-utils/hasCookies.js";
import responseMessages from "../constants/responseMessages.js";

/**
 * Test suite for user logout functionality
 * Tests the POST /api/v1/auth/logout endpoint to ensure:
 * - Users can successfully logout
 * - Cookies are properly cleared upon logout
 * - Appropriate success response is returned
 */
describe("POST /api/v1/auth/logout", () => {
    it("should successfully logout user and clear authentication cookies", async () => {
        await registerUser();
        const loginRes = await request(app)
            .post("/api/v1/auth/login")
            .send({
                identifier: registerUserPayload.username,
                password: registerUserPayload.password,
            })
            .expect(200);

        const loginCookies = loginRes.headers["set-cookie"];

        const res = await request(app).post("/api/v1/auth/logout").set("Cookie", loginCookies);

        const cookies = await hasCookies(res);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe(responseMessages.LOGOUT_SUCCESS);
        expect(cookies).toBeDefined();
        expect(cookies.accessToken).toBeDefined();
        expect(cookies.refreshToken).toBeDefined();
    });
});
