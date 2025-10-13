import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dummy user data for registration (Payload)
export default {
    username: "shubhajit123",
    email: "shubhajit@example.com",
    phoneNumber: "(+91) 8645789512",
    firstName: "Shubhajit",
    lastName: "Paul",
    password: "ABabc123#*",
    profilePicture: path.resolve(__dirname, "test-files/profile-img.jpeg"),
};
