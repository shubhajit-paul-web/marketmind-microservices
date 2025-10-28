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
        ).lean();
    }

    /**
     * Adds new images to an existing product
     * @param {string} sellerId - ID of the seller who owns the product
     * @param {string} productId - ID of the product to add images to
     * @param {Array<Object>} newImages - Array of image objects to add to the product
     * @returns {Promise<Object|null>} Updated product document with new images or null if not found
     */
    async addProductImages(sellerId, productId, newImages) {
        return await Product.findOneAndUpdate(
            {
                _id: productId,
                seller: sellerId,
            },
            {
                $push: {
                    images: { $each: newImages },
                },
            },
            {
                new: true,
                runValidators: true,
            }
        ).lean();
    }

    /**
     * Updates a specific image in an existing product
     * @param {string} sellerId - ID of the seller who owns the product
     * @param {string} productId - ID of the product to update
     * @param {number} imageIndex - Index of the image to update in the images array
     * @param {Object} newImage - New image object to replace the existing image
     * @returns {Promise<Object>} Updated product document with the modified image
     */
    async updateProductImage(sellerId, productId, imageIndex, newImage) {
        const product = await Product.findOne({
            _id: productId,
            seller: sellerId,
        });

        product.images[imageIndex] = newImage;

        return await product.save({ validateModifiedOnly: true });
    }

    /**
     * Deletes a specific image from an existing product
     * @param {string} sellerId - ID of the seller who owns the product
     * @param {string} productId - ID of the product to delete the image from
     * @param {string} imageId - ID of the image to delete from the images array
     * @returns {Promise<Object|null>} Updated product document without the deleted image or null if not found
     */
    async deleteProductImage(sellerId, productId, imageId) {
        return await Product.findOneAndUpdate(
            {
                _id: productId,
                seller: sellerId,
            },
            {
                $pull: {
                    images: { id: imageId },
                },
            },
            { new: true }
        ).lean();
    }

    async replaceAllProductImages(sellerId, productId, newImages = []) {
        return await Product.findOneAndUpdate(
            {
                _id: productId,
                seller: sellerId,
            },
            {
                images: newImages,
            },
            { new: true }
        ).lean();
    }

    /**
     * Finds a product by its ID
     * @param {string} productId - ID of the product to find
     * @returns {Promise<Object|null>} Product document or null if not found
     */
    async findProductById(productId) {
        return await Product.findById(productId).lean();
    }

    /**
     * Finds a product by its ID and seller
     * @param {string} sellerId - ID of the seller who owns the product
     * @param {string} productId - ID of the product to find
     * @returns {Promise<Object|null>} Product document or null if not found or doesn't belong to seller
     */
    async findProductByIdAndSeller(sellerId, productId) {
        return await Product.findOne({
            _id: productId,
            seller: sellerId,
        }).lean();
    }
}

export default new ProductDAO();
