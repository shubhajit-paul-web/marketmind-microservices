// Response messages for standardized API responses in Payment Service
export default {
    // Generic
    SOMETHING_WENT_WRONG: "Something went wrong!",
    TOO_MANY_REQUESTS: "Too many requests! Please try again after some time",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Access forbidden",
    VALIDATION_ERROR: "Validation failed",
    MISSING_REQUIRED_FIELDS: "Missing required fields",
    TOKEN_EXPIRED: "Token expired, please login again",
    INVALID_TOKEN: "Invalid authentication token",
    MISSING_ACCESS_TOKEN: "Access token not found, please login again",
    TOKEN_BLACKLISTED: "Token has been invalidated, please login again",
    INSUFFICIENT_PERMISSIONS: "You don't have permission to access this resource",

    // Seller Dashboard Specific
    METRICS_FETCHED_SUCCESS: "Metrics fetched successfully",
};
