// Response messages for standardized API responses in Product Service
export default {
    // Generic
    SUCCESS: "Operation successful",
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
    PRODUCT_CREATED_SUCCESS: "Product created successfully",
    PRODUCT_FETCHED_SUCCESS: "Product fetched successfully",
    PRODUCTS_FETCHED_SUCCESS: "Products fetched successfully",
    PRODUCT_UPDATED_SUCCESS: "Product updated successfully",
    PRODUCT_DELETED_SUCCESS: "Product deleted successfully",
    PRODUCT_NOT_FOUND: "Product not found",
    PRODUCT_ALREADY_EXISTS: "Product already exists",
    SKU_ALREADY_EXISTS: "SKU already exists",
    CATEGORY_NOT_FOUND: "Category not found",
    PRICE_INVALID: "Invalid price",
    DISCOUNT_PRICE_INVALID: "Discount price must be less than the original price",
    STOCK_UPDATED_SUCCESS: "Stock updated successfully",
    OUT_OF_STOCK: "Product is out of stock",
    INVENTORY_ADJUSTED_SUCCESS: "Inventory adjusted successfully",

    // Media / Files
    IMAGE_UPLOAD_SUCCESS: "Image uploaded successfully",
    IMAGE_UPLOAD_FAILED: "Image upload failed",
    IMAGE_REMOVED_SUCCESS: "Image removed successfully",
    INVALID_IMAGE_FILE: "Please upload a valid image file",
    FILE_NOT_FOUND: "File not found",
    FILE_ID_NOT_FOUND: "File ID not found",

    // Bulk operations
    BULK_IMPORT_SUCCESS: "Products imported successfully",
    BULK_IMPORT_FAILED: "Product import failed",

    // Generic helpers (useful when responding with dynamic entity names)
    FETCHED: (entity = "Resource") => `${entity} fetched successfully`,
    CREATED: (entity = "Resource") => `${entity} created successfully`,
    UPDATED: (entity = "Resource") => `${entity} updated successfully`,
    DELETED: (entity = "Resource") => `${entity} deleted successfully`,
    NOT_FOUND: (entity = "Resource") => `${entity} not found`,
    INVALID: (entity = "Resource") => `Invalid ${entity}`,
    ALREADY_EXISTS: (entity = "Resource") => `${entity} already exists`,
};
