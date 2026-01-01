/**
 * Wraps an async route handler to automatically catch errors
 * and pass them to the next middleware (error handler).
 *
 * @param {Function} requestHandler - The async function to handle the request.
 * @returns {Function} A function that executes the requestHandler and catches errors.
 */
const asyncHandler = (requestHandler) => (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
};

export default asyncHandler;
