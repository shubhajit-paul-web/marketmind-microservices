/**
 * Configures secure cookie options based on environment
 * @param {number} maxAge - Cookie expiration time in milliseconds
 * @returns {Object} Cookie configuration object
 */
function setCookieOptions(maxAge) {
    return {
        httpOnly: true,
        sameSite: "none",
        secure: true, // config.NODE_ENV === "production"
        maxAge,
    };
}

export default setCookieOptions;
