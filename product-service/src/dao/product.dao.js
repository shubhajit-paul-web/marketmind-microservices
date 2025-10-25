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

    /**
     * Updates an existing product in the database
     * @param {string} sellerId - ID of the seller who owns the product
     * @param {string} productId - ID of the product to update
     * @param {Object} productData - Updated product information
     * @returns {Promise<Object|null>} Updated product document or null if not found
     */
    async updateProduct(sellerId, productId, productData) {
        return await Product.findOneAndUpdate(
            {
                _id: productId,
                seller: sellerId,
            },
            productData,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    /**
     * Finds a product by its ID
     * @param {string} productId - ID of the product to find
     * @returns {Promise<Object|null>} Product document or null if not found
     */
    async findProductById(productId) {
        return await Product.findById(productId);
    }
}

export default new ProductDAO();
