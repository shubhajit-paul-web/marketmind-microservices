import { StatusCodes } from "http-status-codes";
import ProductDAO from "../dao/product.dao.js";
import ApiError from "../utils/ApiError.js";
import { uploadFile, deleteFile } from "./storage.service.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";
import formatUploadedImages from "../utils/formatUploadedImages.js";
import { MAX_PRODUCT_IMAGES } from "../constants/constants.js";
import broker from "../broker/broker.js";

/**
 * Product Service
 * @description Handles business logic for product-related operations
 */
class ProductService {
    /**
     * Create a new product
     * @param {string} sellerId - Seller/User ID
     * @param {Object} productData - Product data object
     * @returns {Promise<Object>} Created product object
     */
    async createProduct(sellerId, productData) {
        const { priceAmount, discountPrice, priceCurrency } = productData;

        // Structure price object with amount, discount, and currency
        productData.price = {
            amount: priceAmount,
            discountPrice,
            currency: priceCurrency,
        };

        delete productData["seller"];

        // Upload product images if provided
        if (productData?.images?.length > 0) {
            if (productData.images.length > MAX_PRODUCT_IMAGES) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    responseMessages.IMAGE_LIMIT_EXCEEDED(MAX_PRODUCT_IMAGES),
                    errorCodes.IMAGE_LIMIT_EXCEEDED
                );
            }

            // Upload all images to storage service concurrently
            const uploadedImages = await Promise.all(
                productData.images.map((image) => uploadFile(image))
            );

            // Format uploaded images with url, thumbnail, and id
            productData.images = formatUploadedImages(uploadedImages);
        }

        const createProduct = await ProductDAO.createProduct(sellerId, productData);

        await broker.publishToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED", createProduct);

        return createProduct;
    }

    /**
     * Update an existing product
     * @param {string} sellerId - ID of the seller
     * @param {string} product - Product object to update
     * @param {Object} [productData={}] - Partial set of product fields to update
     * @returns {Promise<Object>} The updated product document
     */
    async updateProduct(sellerId, product, productData = {}) {
        const allowedFieldsToUpdate = [
            "name",
            "description",
            "category",
            "stock",
            "price",
            "isActive",
        ];

        // Check if any fields to update are provided in the productData
        const isEmptyFields = allowedFieldsToUpdate.some((field) =>
            // eslint-disable-next-line no-prototype-builtins
            productData?.hasOwnProperty(field)
        );

        if (!isEmptyFields) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.MISSING_REQUIRED_FIELDS,
                errorCodes.MISSING_REQUIRED_FIELDS
            );
        }

        // Update the price information if provided
        const { price } = productData;

        if (price) {
            productData.price = {
                amount: price.amount ?? product.price?.amount,
                discountPrice: price.discountPrice ?? product.price?.discountPrice,
                currency: price.currency ?? product.price?.currency,
            };
        }

        // Remove unnecessary fields from productData before updating
        delete productData["images"];
        delete productData["seller"];

        const updatedProduct = await ProductDAO.updateProduct(sellerId, product?._id, productData);

        if (!updatedProduct) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.PRODUCT_NOT_FOUND,
                errorCodes.PRODUCT_NOT_FOUND
            );
        }

        await broker.publishToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_UPDATED", updatedProduct);

        // Return the updated product
        return updatedProduct;
    }

    /**
     * Delete a product and its associated images
     * @param {string} sellerId - ID of the seller
     * @param {string} productId - ID of the product to delete
     * @returns {Promise<Object>} The deleted product document
     */
    async deleteProduct(sellerId, productId) {
        const deletedProduct = await ProductDAO.deleteProduct(sellerId, productId);

        if (deletedProduct?.images?.length !== 0) {
            deletedProduct.images?.forEach((image) => deleteFile(image?.id));
        }

        await broker.publishToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_DELETED", deletedProduct);

        return deletedProduct;
    }

    /**
     * Add images to an existing product
     * @param {string} sellerId - ID of the seller
     * @param {string} product - Product object
     * @param {Array} [newImages=[]] - Array of image files to upload
     * @returns {Promise<Object>} Updated product with new images
     */
    async addProductImages(sellerId, product, newImages = []) {
        // Validate that at least one image is provided
        if (newImages?.length === 0) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.IMAGE_REQUIRED,
                errorCodes.IMAGE_REQUIRED
            );
        }

        // Check if product has already reached the maximum image limit
        if (product?.images?.length === MAX_PRODUCT_IMAGES) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.IMAGE_LIMIT_REACHED,
                errorCodes.IMAGE_LIMIT_EXCEEDED
            );
        }

        // Upload all images to storage service concurrently
        const uploadedImages = await Promise.all(newImages.map((image) => uploadFile(image)));

        // Format uploaded images with url, thumbnail, and id
        const formattedUploadedImages = formatUploadedImages(uploadedImages);

        // Return the updated product with new images
        return await ProductDAO.addProductImages(sellerId, product?._id, formattedUploadedImages);
    }

    /**
     * Update a specific product image
     * @param {string} sellerId - ID of the seller
     * @param {string} product - Product object
     * @param {string} imageId - ID of the image to replace
     * @param {Object} newImage - New image file to upload
     * @returns {Promise<Object>} Updated product with replaced image
     */
    async updateProductImage(sellerId, product, imageId, newImage) {
        if (!newImage?.buffer) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.IMAGE_REQUIRED,
                errorCodes.IMAGE_REQUIRED
            );
        }

        // Find the index of the image to replace
        const oldImageIndex = product.images?.findIndex((img) => img?.id === imageId);

        if (oldImageIndex === -1) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.IMAGE_NOT_FOUND,
                errorCodes.IMAGE_NOT_FOUND
            );
        }

        // Delete old image from storage
        deleteFile(imageId);

        const uploadedImage = await uploadFile(newImage);
        const formattedUploadedImage = formatUploadedImages([uploadedImage])?.[0];

        // Return the updated product with replaced image
        return await ProductDAO.updateProductImage(
            sellerId,
            product?._id,
            oldImageIndex,
            formattedUploadedImage
        );
    }

    /**
     * Replace all existing product images with new ones
     * @param {string} sellerId - ID of the seller
     * @param {Object} product - Product object
     * @param {Array} [newImages=[]] - Array of new image files to upload
     * @returns {Promise<Object>} Updated product with new images
     */
    async replaceAllProductImages(sellerId, product, newImages = []) {
        // Validate that at least one image is provided
        if (newImages?.length === 0) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.IMAGE_REQUIRED,
                errorCodes.IMAGE_REQUIRED
            );
        }

        // Validate that the number of new images does not exceed the maximum limit
        if (newImages?.length > MAX_PRODUCT_IMAGES) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.IMAGE_LIMIT_EXCEEDED(MAX_PRODUCT_IMAGES),
                errorCodes.IMAGE_LIMIT_EXCEEDED
            );
        }

        // Upload all new images to storage service concurrently
        const uploadedImages = await Promise.all(newImages?.map((image) => uploadFile(image)));
        const formattedUploadedImages = formatUploadedImages(uploadedImages);

        // Delete all existing product images from storage to free up space
        if (product?.images?.length !== 0) {
            product.images?.forEach((image) => deleteFile(image?.id));
        }

        // Return updated product with new images
        return await ProductDAO.replaceAllProductImages(
            sellerId,
            product?._id,
            formattedUploadedImages
        );
    }

    /**
     * Delete a specific product image
     * @param {string} sellerId - ID of the seller
     * @param {Object} product - Product object
     * @param {string} imageId - ID of the image to delete
     * @returns {Promise<Object>} Updated product without the deleted image
     */
    async deleteProductImage(sellerId, product, imageId) {
        const hasImage = product?.images?.some((img) => img?.id === imageId);

        if (!hasImage) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.IMAGE_NOT_FOUND,
                errorCodes.IMAGE_NOT_FOUND
            );
        }

        deleteFile(imageId);

        return await ProductDAO.deleteProductImage(sellerId, product?._id, imageId);
    }

    /**
     * Get a list of products with filtering, sorting, and pagination
     * @param {Object} query - Query parameters for filtering and pagination
     * @param {string} [query.q] - Text search query
     * @param {number} [query.minPrice] - Minimum price filter
     * @param {number} [query.maxPrice] - Maximum price filter
     * @param {number} [query.page=1] - Current page number
     * @param {number} [query.limit=20] - Number of products per page
     * @param {string} [query.sortBy] - Field to sort by
     * @param {string} [query.sortType] - Sort order (asc/desc)
     * @param {Object} user - user object (optional)
     * @returns {Promise<Object>} Object containing products array and pagination metadata
     */
    async getProducts(query, user) {
        const { q, minPrice, maxPrice, page = 1, limit = 20, sortType } = query;
        let { sortBy } = query;

        // Map sortBy to nested price fields if needed
        if (["amount", "discountPrice"].includes(sortBy)) {
            sortBy = `price.${sortBy}`;
        }

        // Filter for normal users (default)
        let filter = { isActive: true };

        // Filter for sellers
        if (user?._id && user?.role === "seller") {
            filter = { seller: user?._id };
        }

        if (q) filter.$text = { $search: q };

        // Apply price range filters
        if (minPrice && maxPrice) {
            filter["price.amount"] = { $gte: Number(minPrice), $lte: Number(maxPrice) };
        } else if (minPrice) {
            filter["price.amount"] = { $gte: Number(minPrice) };
        } else if (maxPrice) {
            filter["price.amount"] = { $lte: Number(maxPrice) };
        }

        const skip = (Math.max(page, 1) - 1) * limit;

        const { totalProducts, products } = await ProductDAO.findProducts(
            filter,
            skip,
            limit,
            sortBy,
            sortType
        );

        const totalPages = Math.ceil(totalProducts / limit);

        const pagination = {
            page: parseInt(page),
            limit: parseInt(limit),
            totalProducts: totalProducts || 0,
            totalPages: totalPages || 0,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        };

        return { products, pagination };
    }

    /**
     * Get a single product by ID
     * @param {string} productId - ID of the product to retrieve
     * @returns {Promise<Object>} The product document
     */
    async getProduct(productId) {
        const product = await ProductDAO.findActiveProduct(productId);

        if (!product) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.PRODUCT_NOT_FOUND,
                errorCodes.PRODUCT_NOT_FOUND
            );
        }

        return product;
    }

    /**
     * Get a product owned by a specific user (seller)
     * @param {string} userId - ID of the user/seller who owns the product
     * @param {string} productId - ID of the product to retrieve
     * @returns {Promise<Object>} The product document belonging to the user
     */
    async getOwnProduct(userId, productId) {
        const product = await ProductDAO.findProductByIdAndSeller(userId, productId);

        if (!product) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.PRODUCT_NOT_FOUND,
                errorCodes.PRODUCT_NOT_FOUND
            );
        }

        return product;
    }

    /**
     * Decrease product stock by specified amount
     * @param {string} productId - ID of the product to decrease stock for
     * @param {number} stock - Amount to decrease from current stock
     * @returns {Promise<Object>} Updated product with decreased stock
     */
    async decreaseProductStocks(productId, stock) {
        const product = await this.getProduct(productId);

        const updatedProduct = await ProductDAO.decreaseProductStocks(
            productId,
            product.stock - stock
        );

        await broker.publishToQueue("PRODUCT_SELLER_DASHBOARD.DECREASE_STOCKS", updatedProduct);

        return updatedProduct;
    }
}

export default new ProductService();
