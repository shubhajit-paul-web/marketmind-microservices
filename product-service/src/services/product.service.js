import { StatusCodes } from "http-status-codes";
import ProductDAO from "../dao/product.dao.js";
import ApiError from "../utils/ApiError.js";
import { uploadFile } from "./storage.service.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";
import formatUploadedImages from "../utils/formatUploadedImages.js";
import { MAX_PRODUCT_IMAGES } from "../constants/constants.js";

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

        return await ProductDAO.createProduct(sellerId, productData);
    }

    /**
     * Update an existing product
     * @param {string} sellerId - ID of the seller making the update request
     * @param {string} productId - ID of the product to update
     * @param {Object} [productData={}] - Partial set of product fields to update
     * @returns {Promise<Object>} The updated product document
     */
    async updateProduct(sellerId, productId, productData = {}) {
        // Verify seller authorization for a product and return it if authorized
        const existingProduct = await this.authorizeProductAccess(sellerId, productId);

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
                amount: price.amount ?? existingProduct.price.amount,
                discountPrice: price.discountPrice ?? existingProduct.price.discountPrice,
                currency: price.currency ?? existingProduct.price.currency,
            };
        }

        // Remove unnecessary fields from productData before updating
        delete productData["images"];
        delete productData["seller"];

        const updatedProduct = await ProductDAO.updateProduct(sellerId, productId, productData);

        if (!updatedProduct) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.PRODUCT_NOT_FOUND,
                errorCodes.PRODUCT_NOT_FOUND
            );
        }

        // Return the updated product
        return updatedProduct;
    }

    /**
     * Add images to an existing product
     * @param {string} sellerId - ID of the seller
     * @param {string} productId - ID of the product
     * @param {Array} [newImages=[]] - Array of image files to upload
     * @returns {Promise<Object>} Updated product with new images
     */
    async addProductImages(sellerId, productId, newImages = []) {
        // Verify seller authorization for a product and return it if authorized
        const existingProduct = await this.authorizeProductAccess(sellerId, productId);

        // Validate that at least one image is provided
        if (newImages?.length === 0) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.IMAGE_REQUIRED,
                errorCodes.IMAGE_REQUIRED
            );
        }

        // Check if product has already reached the maximum image limit
        if (existingProduct?.images?.length === MAX_PRODUCT_IMAGES) {
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
        return await ProductDAO.addProductImages(sellerId, productId, formattedUploadedImages);
    }

    /**
     * Verify seller authorization for a product and return it if authorized.
     * Throws 404 if the product doesn't exist, 403 if the seller lacks access.
     * @param {string} sellerId
     * @param {string} productId
     * @returns {Promise<Object>} The authorized product document
     */
    async authorizeProductAccess(sellerId, productId) {
        const hasProduct = await ProductDAO.findProductById(productId);

        if (!hasProduct) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.PRODUCT_NOT_FOUND,
                errorCodes.PRODUCT_NOT_FOUND
            );
        }

        const hasAccess = await ProductDAO.findProductByIdAndSeller(sellerId, productId);

        if (!hasAccess) {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                responseMessages.INSUFFICIENT_PERMISSIONS,
                errorCodes.INSUFFICIENT_PERMISSIONS
            );
        }

        // Return product after access check succeeds
        return hasAccess;
    }
}

export default new ProductService();
