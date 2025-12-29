import jwt from "jsonwebtoken";
import _config from "../../config/config.js";

const accessToken = jwt.sign(
    {
        _id: "68fbc422a7decf69519bb708",
        role: "user",
    },
    _config.JWT.ACCESS_TOKEN_SECRET
);

export default accessToken;
