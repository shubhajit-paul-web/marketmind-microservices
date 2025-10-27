import { StatusCodes } from "http-status-codes";
import ProductDAO from "../dao/product.dao.js";
import ApiError from "../utils/ApiError.js";
import { uploadFile, deleteFile } from "./storage.service.js";
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

        // Return the updated product
        return updatedProduct;
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
}

export default new ProductService();
