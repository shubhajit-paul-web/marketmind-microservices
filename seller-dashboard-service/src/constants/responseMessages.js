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

    // Order specific
    ORDER_NOT_FOUND: "Order not found",

    // Payment specific
    PAYMENT_CREATION_FAILED: "Failed to create payment order, try again later.",
    PAYMENT_INITIATED_SUCCESS: "Payment initiated successfully",
    INVALID_SIGNATURE: "Invalid signature",
    PAYMENT_NOT_FOUND: "Payment not found",
    PAYMENT_INFO_FETCHED_SUCCESS: "Payment info fetched successfully",
    PAYMENT_SUCCESS: "Payment verified successfully",
};
