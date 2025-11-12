/**
 * @class ApiResponse
 * @description
 * A standardized API response wrapper for successful HTTP responses.
 *
 * Ensures all responses from the server have a consistent format
 * with fields like `success`, `statusCode`, `message`, `data`, and `meta`.
 *
 * Use this for all **2xx success responses** (e.g., 200, 201, 204).
 */
class ApiResponse {
    /**
     * @constructor
     * @param {number} [statusCode=200] - HTTP status code for the response.
     * @param {string} message - A human-readable message describing the response.
     * @param {any} [data=null] - Optional payload (object, array, etc.) returned to the client.
     * @param {object|null} [meta=null] - Optional metadata (e.g., pagination info).
     */
    constructor(statusCode = 200, message, data = null, meta = null) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;

        if (meta) this.meta = meta;
    }

    /**
     * Creates a 200 OK success response.
     * @param {string} message - Message describing the success.
     * @param {any} [data=null] - Response data.
     * @param {object|null} [meta=null] - Optional metadata.
     * @param {number} [statusCode=200] - Custom success code (defaults to 200).
     * @returns {ApiResponse}
     */
    static success(message, data = null, meta = null, statusCode = 200) {
        return new ApiResponse(statusCode, message, data, meta);
    }

    /**
     * Creates a 201 Created response.
     * @param {string} message - Message describing the creation.
     * @param {any} [data=null] - Created resource data.
     * @param {object|null} [meta=null] - Optional metadata.
     * @returns {ApiResponse}
     */
    static created(message, data = null, meta = null) {
        return new ApiResponse(201, message, data, meta);
    }

    /**
     * Creates a 204 No Content response.
     * Used when the action was successful but there is no data to return.
     * @param {string} message - Message describing the outcome.
     * @returns {ApiResponse}
     */
    static noContent(message) {
        return new ApiResponse(204, message);
    }

    /**
     * Creates a custom response with any HTTP status code.
     * @param {number} statusCode - HTTP status code.
     * @param {string} message - Message describing the outcome.
     * @param {any} [data=null] - Response data.
     * @param {object|null} [meta=null] - Optional metadata.
     * @returns {ApiResponse}
     */
    static custom(statusCode, message, data = null, meta = null) {
        return new ApiResponse(statusCode, message, data, meta);
    }
}

export default ApiResponse;
