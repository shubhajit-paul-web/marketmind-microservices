import { StatusCodes } from "http-status-codes";
import ProductDAO from "../dao/product.dao.js";
import ApiError from "../utils/ApiError.js";
import { uploadFile } from "./storage.service.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";

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
            const uploadedImages = await Promise.all(
                productData.images.map((image) => uploadFile(image))
            );

            // Map uploaded images to required format with url, thumbnail, and id
            productData.images = uploadedImages?.map((image) => ({
                url: image?.url,
                thumbnail: image?.thumbnailUrl,
                id: image?.fileId,
            }));
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

        // Retrieve the existing product from the database
        const existingProduct = await ProductDAO.findProductById(productId);

        if (!existingProduct) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.PRODUCT_NOT_FOUND,
                errorCodes.PRODUCT_NOT_FOUND
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
}

export default new ProductService();
