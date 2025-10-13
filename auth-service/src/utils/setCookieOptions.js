import config from "../config/config.js";

/**
 * Configures secure cookie options based on environment
 * @param {number} maxAge - Cookie expiration time in milliseconds
 * @returns {Object} Cookie configuration object
 */
function setCookieOptions(maxAge) {
    return {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        maxAge,
    };
}

export default setCookieOptions;
