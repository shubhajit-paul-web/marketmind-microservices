import Product from "../models/product.model.js";

/**
 * Data Access Object for Product operations.
 * @description Handles all database interactions for product-related data.
 */
class ProductDAO {
    /**
     * Creates a new product in the database
     * @param {string} sellerId - ID of the seller creating the product
     * @param {Object} productData - Product information to store
     * @returns {Promise<Object>} Created product document
     */
    async createProduct(sellerId, productData) {
        return await Product.create({ ...productData, seller: sellerId });
    }
}

export default new ProductDAO();
