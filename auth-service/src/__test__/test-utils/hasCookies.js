/**
 * Checks if response contains authentication cookies
 * @param {Object} response - HTTP response object
 * @returns {Object|undefined} Object with accessToken and refreshToken boolean flags, or undefined if no cookies
 */
function hasCookies(response) {
    const cookies = response.headers["set-cookie"];

    if (!cookies) return cookies;

    const accessToken = cookies?.some((cookie) => cookie?.startsWith("accessToken="));
    const refreshToken = cookies?.some((cookie) => cookie?.startsWith("refreshToken="));

    return { accessToken, refreshToken };
}

export default hasCookies;
