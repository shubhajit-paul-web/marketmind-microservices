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

    /**
     * Replaces all images of an existing product with new images
     * @param {string} sellerId - ID of the seller who owns the product
     * @param {string} productId - ID of the product to replace images for
     * @param {Array<Object>} newImages - Array of new image objects to replace all existing images
     * @returns {Promise<Object|null>} Updated product document with replaced images or null if not found
     */
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
     * Deletes a product from the database
     * @param {string} sellerId - ID of the seller who owns the product
     * @param {string} productId - ID of the product to delete
     * @returns {Promise<Object|null>} Deleted product document or null if not found
     */
    async deleteProduct(sellerId, productId) {
        return await Product.findOneAndDelete({
            _id: productId,
            seller: sellerId,
        }).lean();
    }

    /**
     * Finds a product by its ID
     * @param {string} productId - ID of the product to find
     * @param {string} [select=""] - Space-separated field names to include or exclude from the result
     * @returns {Promise<Object|null>} Product document or null if not found
     */
    async findProductById(productId, select = "") {
        return await Product.findById(productId).select(select).lean();
    }

    /**
     * Finds a product by its ID and seller
     * @param {string} sellerId - ID of the seller who owns the product
     * @param {string} productId - ID of the product to find
     * @param {string} [select=""] - Space-separated field names to include or exclude from the result
     * @returns {Promise<Object|null>} Product document or null if not found or doesn't belong to seller
     */
    async findProductByIdAndSeller(sellerId, productId, select = "") {
        return await Product.findOne({
            _id: productId,
            seller: sellerId,
        })
            .select(select)
            .lean();
    }

    /**
     * Finds products based on filter criteria with pagination and sorting
     * @param {Object} [filter={}] - MongoDB filter object to match products
     * @param {number} [skip=0] - Number of documents to skip for pagination
     * @param {number} [limit=20] - Maximum number of documents to return (capped at MAX_PRODUCTS_LIMIT)
     * @param {string} [sortBy] - Field name to sort by
     * @param {string} [sortType="asc"] - Sort order, either "asc" for ascending or "desc" for descending
     * @returns {Promise<Array<Object>>} Array of product documents matching the filter criteria
     */
    async findProducts(filter = {}, skip = 0, limit = 20, sortBy, sortType = "asc") {
        const [totalProducts, products] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter)
                .sort(sortBy && { [sortBy]: sortType === "asc" ? 1 : -1 })
                .skip(Number(skip))
                .limit(Number(limit))
                .lean(),
        ]);

        return { totalProducts, products };
    }
}

export default new ProductDAO();
