import config from "../config/config.js";

export const DB_NAME = "marketmind-ai";
export const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
};
export const COUNTRIES = [
    "india",
    "united states",
    "china",
    "japan",
    "canada",
    "russia",
    "spain",
    "singapore",
];
export const NAME_REGEX = /^[A-Za-z]+$/;
export const ADDRESS_TYPES = ["home", "work"];
export const USER_ROLE_TYPES = ["user", "seller"];
