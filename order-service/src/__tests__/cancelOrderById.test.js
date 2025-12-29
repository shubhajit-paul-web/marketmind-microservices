/* eslint-disable no-undef */
import request from "supertest";
import app from "../app.js";
import token from "./test-utils/accessToken.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";
import createOrder from "./test-utils/createOrder.js";
import { Types } from "mongoose";

let createdOrderId;

beforeEach(async () => {
    createdOrderId = await createOrder(token);
});

describe("PATCH /api/v1/orders/:orderId/cancel - cancelOrderById", () => {
    test("should return 401 when no access token is provided", async () => {
        const res = await request(app).patch(`/api/v1/orders/${createdOrderId}/cancel`);

        expect(res.status).toBe(401);
        expect(res.body).toMatchObject({
            success: false,
            statusCode: 401,
            errorCode: errorCodes.MISSING_TOKEN,
            message: responseMessages.MISSING_ACCESS_TOKEN,
        });
        expect(res.body.isOperational).toBe(true);
    });

    test("should return 404 when order does not exist", async () => {
        const sampleOrderId = new Types.ObjectId();

        const res = await request(app)
            .patch(`/api/v1/orders/${sampleOrderId}/cancel`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({
            success: false,
            statusCode: 404,
            errorCode: errorCodes.NOT_FOUND,
            message: responseMessages.ORDER_NOT_FOUND,
        });
        expect(res.body.isOperational).toBe(true);
    });
});
