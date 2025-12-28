// Response messages for standardized API responses in Cart Service
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

    // Product-specific
    ORDERED_SUCCESS: "Ordered successfully",
    ORDERED_FETCHED_SUCCESS: "Orders fetched successfully",
    PRODUCT_CREATED_SUCCESS: "Product created successfully",
    CART_FETCHED_SUCCESS: "Cart fetched successfully",
    EMPTY_CART: "Cart is empty",
    ITEM_ADDED_SUCCESS: "Item added to cart",
    ITEM_UPDATED_SUCCESS: "Item updated successfully",
    ITEM_NOT_FOUND: "Item not found",
    PRODUCTS_FETCHED_SUCCESS: "Products fetched successfully",
    PRODUCT_DELETED_SUCCESS: "Product deleted successfully",
    PRODUCT_NOT_FOUND: "Product not found",
    STOCK_UPDATED_SUCCESS: "Stock updated successfully",
    OUT_OF_STOCK: "Product is out of stock",

    // Generic helpers (useful when responding with dynamic entity names)
    NOT_FOUND: (entity = "Resource") => `${entity} not found`,
    INVALID: (entity = "Resource") => `Invalid ${entity}`,
    ALREADY_EXISTS: (entity = "Resource") => `${entity} already exists`,
    INSUFFICIENT_STOCK: (entity = "Resource") =>
        `Product ${entity} is out of stock or insufficient stock`,
};
