import request from "supertest";
import app from "../../app.js";

async function createOrder(token) {
    // Create an order first to have a valid orderId for retrieval
    const validOrderData = {
        currency: "INR",
        shippingAddress: {
            street: "123 Main Street",
            city: "New York",
            state: "New York",
            zip: "10001",
            country: "United States",
            landmark: "Near Central Park",
            typeOfAddress: "home",
        },
    };

    const createRes = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send(validOrderData)
        .expect(201);

    // return the created order id if creation succeeded
    return createRes?.body?.data?._id;
}

export default createOrder;
