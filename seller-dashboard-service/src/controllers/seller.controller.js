import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import SellerService from "../services/seller.service.js";
import responseMessages from "../constants/responseMessages.js";

/**
 * Seller Controller
 * @description Handles HTTP requests for seller dashboard operations
 */
class SellerController {
    /**
     * Get seller dashboard metrics
     * @description Fetches aggregated metrics for the authenticated seller
     * @route GET /api/v1/seller/dashboard/metrics
     * @access Private (Seller)
     */
    getMetrics = asyncHandler(async (req, res) => {
        const metrics = await SellerService.getMetrics(req.user?._id);

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.METRICS_FETCHED_SUCCESS, metrics));
    });

    /**
     * Get seller orders
     * @description Fetches seller orders with pagination, sorting, and optional status filter
     * @route GET /api/v1/seller/dashboard/orders
     * @access Private (Seller)
     * @query {number} [page=1] - Page number (min 1)
     * @query {number} [limit=10] - Items per page (1-100)
     * @query {string} [sortBy=createdAt] - Sort field: createdAt | updatedAt | status
     * @query {string} [sortType=desc] - Sort order: asc | desc
     * @query {string} [status] - Filter by status: PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED
     */
    getOrders = asyncHandler(async (req, res) => {
        const { orderItems, pagination } = await SellerService.getOrders(
            req.user?._id,
            req.query ?? {}
        );

        return res
            .status(StatusCodes.OK)
            .json(
                ApiResponse.success(responseMessages.ORDERS_FETCHED_SUCCESS, orderItems, pagination)
            );
    });
}

export default new SellerController();
