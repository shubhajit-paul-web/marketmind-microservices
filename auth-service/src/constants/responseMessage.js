// Most common response messages (object)
export default {
    SUCCESS: "Operation successful",
    CREATED: (entity = "Resource") => `${entity} created successfully`,
    UPDATED: (entity = "Resource") => `${entity} updated successfully`,
    DELETED: (entity = "Resource") => `${entity} deleted successfully`,
    SOMETHING_WENT_WRONG: `Something went wrong!`,
    TOO_MANY_REQUESTS: `Too many requests! Please try again after some time`,
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Access forbidden",
    VALIDATION_ERROR: "Validation failed",
    LOGIN_SUCCESS: "Logged in successfully",
    LOGOUT_SUCCESS: "Logged out successfully",
    TOKEN_EXPIRED: "Token expired, please login again",
    INVALID_TOKEN: "Invalid authentication token",
    PASSWORD_UPDATED: "Password updated successfully",
    NOT_FOUND: (entity = "Resource") => `${entity} not found`,
};
