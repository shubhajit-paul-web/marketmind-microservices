/* eslint-disable no-undef */
import path from "path";
import { fileURLToPath } from "url";
import request from "supertest";
import createProduct from "./test-utils/createProduct.js";
import app from "../app.js";
import productPayload from "./test-utils/productPayload.js";
import responseMessages from "../constants/responseMessages.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("PATCH /api/v1/products/:productId/images/:imageId", () => {
    it("should update or replace an existing image from product", async () => {
        const { createdProduct, token } = await createProduct();

        const productId = createdProduct.body?.data?._id;
        const imageId = createdProduct.body?.data?.images?.[1]?.id;

        const res = await request(app)
            .patch(`/api/v1/products/${productId}/images/${imageId}`)
            .attach("image", path.join(__dirname, "test-utils/images/product-img1.jpg"))
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe(responseMessages.IMAGE_UPDATED_SUCCESS);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.name).toBe(productPayload.name);
        expect(res.body.data.description).toBe(productPayload.description);
        expect(res.body.data.category).toBe(productPayload.category);
        expect(res.body.data.stock).toBe(productPayload.stock);
        expect(res.body.data.price).toBeDefined();
        expect(res.body.data.price.amount).toBe(productPayload.priceAmount);
        expect(res.body.data.price.discountPrice).toBe(productPayload.discountPrice);
        expect(res.body.data.price.currency).toBe(productPayload.priceCurrency);
        expect(Array.isArray(res.body.data.images)).toBe(true);
        expect(res.body.data.images?.length).toBe(2);
        expect(res.body.data.isActive).toBeDefined();
    });
});
