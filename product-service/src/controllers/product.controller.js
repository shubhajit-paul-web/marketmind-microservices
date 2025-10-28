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
     * Add images to an existing product
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

    replaceAllProductImages = asyncHandler(async (req, res) => {
        const updatedProduct = await ProductService.replaceAllProductImages(
            req.user?._id,
            req.product?._id,
            req.files
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.IMAGES_REPLACED_SUCCESS, updatedProduct));
    });

    /**
     * Delete a specific image of an existing product
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
}

export default new ProductController();
