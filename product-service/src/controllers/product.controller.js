import asyncHandler from "../utils/asyncHandler.js";
import ProductService from "../services/product.service.js";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "../utils/ApiResponse.js";
import responseMessages from "../constants/responseMessages.js";

/**
 * Product Controller
 * @description Handles HTTP requests for product operations
 */
class ProductController {
    /**
     * Create a new product
     * @description Creates a new product with provided details and optional images
     * @route POST /api/v1/products
     * @access Private
     */
    createProduct = asyncHandler(async (req, res) => {
        const createdProduct = await ProductService.createProduct(req.user?._id, {
            ...req.body,
            images: req.files,
        });

        return res
            .status(StatusCodes.CREATED)
            .json(ApiResponse.created(responseMessages.PRODUCT_CREATED_SUCCESS, createdProduct));
    });

    /**
     * Update an existing product
     * @description Updates product fields such as name, description, category, stock, and price
     * @route PATCH /api/v1/products/:productId
     * @access Private
     */
    updateProduct = asyncHandler(async (req, res) => {
        const updatedProduct = await ProductService.updateProduct(
            req.user?._id,
            req.product,
            req.body
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.PRODUCT_UPDATED_SUCCESS, updatedProduct));
    });

    /**
     * Delete an existing product
     * @description Deletes a product and removes all associated images from storage
     * @route DELETE /api/v1/products/:productId
     * @access Private
     */
    deleteProduct = asyncHandler(async (req, res) => {
        await ProductService.deleteProduct(req.user?._id, req.product?._id);

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.PRODUCT_DELETED_SUCCESS));
    });

    /**
     * Add images to an existing product
     * @description Adds new images to a product without removing existing ones
     * @route POST /api/v1/products/:productId/images
     * @access Private
     */
    addProductImages = asyncHandler(async (req, res) => {
        const updatedProduct = await ProductService.addProductImages(
            req.user?._id,
            req.product,
            req.files
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.IMAGE_UPLOAD_SUCCESS, updatedProduct));
    });

    /**
     * Update a specific image of an existing product
     * @description Replaces a single product image identified by imageId with a new one
     * @route PATCH /api/v1/products/:productId/images/:imageId
     * @access Private
     */
    updateProductImage = asyncHandler(async (req, res) => {
        const updatedProduct = await ProductService.updateProductImage(
            req.user?._id,
            req.product,
            req?.params?.imageId,
            req.file
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.IMAGE_UPDATED_SUCCESS, updatedProduct));
    });

    /**
     * Replace all product images
     * @description Removes all existing product images and replaces them with new ones
     * @route PUT /api/v1/products/:productId/images
     * @access Private
     */
    replaceAllProductImages = asyncHandler(async (req, res) => {
        const updatedProduct = await ProductService.replaceAllProductImages(
            req.user?._id,
            req.product,
            req.files
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.IMAGES_REPLACED_SUCCESS, updatedProduct));
    });

    /**
     * Delete a specific image of an existing product
     * @description Removes a single product image identified by imageId from storage and database
     * @route DELETE /api/v1/products/:productId/images/:imageId
     * @access Private
     */
    deleteProductImage = asyncHandler(async (req, res) => {
        const updatedProduct = await ProductService.deleteProductImage(
            req.user?._id,
            req.product,
            req.params?.imageId
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.IMAGE_REMOVED_SUCCESS, updatedProduct));
    });

    /**
     * Get all products
     * @description Retrieves a list of products based on query parameters
     * @route GET /api/v1/products
     * @access Public
     */
    getProducts = asyncHandler(async (req, res) => {
        const { products, pagination } = await ProductService.getProducts(req.query || {});

        return res
            .status(StatusCodes.OK)
            .json(
                ApiResponse.success(responseMessages.PRODUCTS_FETCHED_SUCCESS, products, pagination)
            );
    });
}

export default new ProductController();
