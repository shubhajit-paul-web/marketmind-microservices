import request from "supertest";
import app from "../../app.js";
import registerUserPayload from "./registerUserPayload.js";

async function registerUser(expect = 201) {
    return await request(app)
        .post("/api/v1/auth/register")
        .field("username", registerUserPayload.username)
        .field("email", registerUserPayload.email)
        .field("phoneNumber", registerUserPayload.phoneNumber)
        .field("firstName", registerUserPayload.firstName)
        .field("lastName", registerUserPayload.lastName)
        .field("password", registerUserPayload.password)
        .attach("profilePicture", registerUserPayload.profilePicture)
        .expect(expect);
}

export default registerUser;
