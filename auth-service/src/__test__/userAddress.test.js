/* eslint-disable no-undef */
import request from "supertest";
import registerUser from "./test-utils/registerUser.js";
import app from "../app.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";

const dummyAddress = {
    street: "123 MG Road",
    city: "Bangalore",
    state: "Karnataka",
    zip: "5600011",
    country: "india",
    landmark: "Near Metro Station",
    typeOfAddress: "home",
    isDefault: true,
};

const secondAddress = {
    street: "456 Park Avenue",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "4000012",
    country: "india",
    landmark: "Opposite Mall",
    typeOfAddress: "work",
    isDefault: false,
};

describe("POST /api/v1/users/me/addresses", () => {
    // Test Case 1: Successfully add a new address
    // Given an authenticated user with valid address data
    // When POST /api/v1/users/me/addresses is called
    // Then respond 201 with success message and updated user with addresses array
    it("should add a new address to user and return the updated user document", async () => {
        const registerUserResponse = await registerUser();
        const cookies = registerUserResponse.headers["set-cookie"];

        const res = await request(app)
            .post("/api/v1/users/me/addresses")
            .send(dummyAddress)
            .set("Cookie", cookies);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(201);
        expect(res.body.message).toBe(responseMessages.ADDRESS_ADDED_SUCCESS);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.addresses).toBeDefined();
        expect(Array.isArray(res.body.data.addresses)).toBe(true);
        expect(res.body.data.addresses.length).toBe(1);
        expect(res.body.data.addresses[0].street).toBe(dummyAddress.street);
        expect(res.body.data.addresses[0].city).toBe(dummyAddress.city);
        expect(res.body.data.addresses[0].state).toBe(dummyAddress.state);
        expect(res.body.data.addresses[0].zip).toBe(dummyAddress.zip);
        expect(res.body.data.addresses[0].country).toBe(dummyAddress.country);
        expect(res.body.data.addresses[0].landmark).toBe(dummyAddress.landmark);
        expect(res.body.data.addresses[0].typeOfAddress).toBe(dummyAddress.typeOfAddress);
        expect(res.body.data.addresses[0].isDefault).toBe(dummyAddress.isDefault);
        expect(res.body.data.addresses[0]._id).toBeDefined();
    });

    // Test Case 2: Add multiple addresses
    // Given a user already has one address
    // When adding a second address
    // Then respond 201 and addresses array should have 2 addresses
    it("should allow adding multiple addresses to a user", async () => {
        const registerUserResponse = await registerUser();
        const cookies = registerUserResponse.headers["set-cookie"];

        // Add first address
        await request(app)
            .post("/api/v1/users/me/addresses")
            .send(dummyAddress)
            .set("Cookie", cookies);

        // Add second address
        const res = await request(app)
            .post("/api/v1/users/me/addresses")
            .send(secondAddress)
            .set("Cookie", cookies);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.addresses.length).toBe(2);
        expect(res.body.data.addresses[1].street).toBe(secondAddress.street);
        expect(res.body.data.addresses[1].city).toBe(secondAddress.city);
    });

    // Test Case 3: Missing required fields
    // Given an incomplete address payload (missing required fields)
    // When POST /api/v1/users/me/addresses is called
    // Then respond 400 with validation error
    it("should reject address with missing required fields", async () => {
        const registerUserResponse = await registerUser();
        const cookies = registerUserResponse.headers["set-cookie"];

        const incompleteAddress = {
            street: "123 MG Road",
            city: "Bangalore",
            // Missing state, zip
        };

        const res = await request(app)
            .post("/api/v1/users/me/addresses")
            .send(incompleteAddress)
            .set("Cookie", cookies);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errorCode).toBe(errorCodes.MISSING_REQUIRED_FIELDS);
    });

    // Test Case 4: Fetching a specific user address by ID
    // Given a registered user with a created address
    // When GET /api/v1/users/me/addresses/:id is called with a valid address ID
    // Then respond 200 with the address details
    it("should fetch a specific user address successfully", async () => {
        const registerUserResponse = await registerUser();
        const cookies = registerUserResponse.headers["set-cookie"];

        const createdAddressResponse = await request(app)
            .post("/api/v1/users/me/addresses")
            .send(dummyAddress)
            .set("Cookie", cookies)
            .expect(201);

        const addressId = createdAddressResponse.body?.data?.addresses[0]?._id;

        const res = await request(app)
            .get(`/api/v1/users/me/addresses/${addressId}`)
            .set("Cookie", cookies);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe(responseMessages.FETCHED("User address"));
        expect(res.body.data).toBeDefined();
        expect(res.body.data.street).toBe(dummyAddress.street);
        expect(res.body.data.city).toBe(dummyAddress.city);
        expect(res.body.data.state).toBe(dummyAddress.state);
        expect(res.body.data.zip).toBe(dummyAddress.zip);
        expect(res.body.data.country).toBe(dummyAddress.country);
        expect(res.body.data.landmark).toBe(dummyAddress.landmark);
        expect(res.body.data.typeOfAddress).toBe(dummyAddress.typeOfAddress);
        expect(res.body.data.isDefault).toBe(dummyAddress.isDefault);
        expect(res.body.data._id).toBeDefined();
    });
});
