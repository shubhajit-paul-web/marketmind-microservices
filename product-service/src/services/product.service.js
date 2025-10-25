import ProductDAO from "../dao/product.dao.js";
import { uploadFile } from "./storage.service.js";

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
}

export default new ProductService();
