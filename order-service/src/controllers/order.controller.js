import asyncHandler from "../utils/asyncHandler.js";
import OrderService from "../services/order.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import responseMessages from "../constants/responseMessages.js";

/**
 * Order Controller
 * @description Handles HTTP requests for order operations
 */
class OrderController {
    /**
     * Create a new order
     * @description Creates an order from user's cart items and clears the cart
     * @route POST /api/v1/orders
     * @access Private
     */
    createOrder = asyncHandler(async (req, res) => {
        const createdOrder = await OrderService.createOrder(
            req.user?._id,
            req.accessToken,
            req.body?.currency,
            req.body?.shippingAddress
        );

        return res
            .status(StatusCodes.CREATED)
            .json(ApiResponse.success(responseMessages.ORDERED_SUCCESS, createdOrder));
    });

    /**
     * Get all orders
     * @description Retrieves all orders for the authenticated user with pagination
     * @route GET /api/v1/orders
     * @access Private
     */
    getAllOrders = asyncHandler(async (req, res) => {
        const { orders, pagination } = await OrderService.getAllOrders(
            req.user?._id,
            req.query || {}
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.ORDERS_FETCHED_SUCCESS, orders, pagination));
    });

    /**
     * Get order by ID
     * @description Retrieves a specific order by its ID
     * @route GET /api/v1/orders/:orderId
     * @access Private
     */
    getOrderById = asyncHandler(async (req, res) => {
        const order = await OrderService.getOrderById(req.user?._id, req.params?.orderId);

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.ORDER_FETCHED_SUCCESS, order));
    });

    /**
     * Cancel order
     * @description Cancels a pending order by its ID
     * @route PATCH /api/v1/orders/:orderId/cancel
     * @access Private
     */
    cancelOrderById = asyncHandler(async (req, res) => {
        const canceledOrder = await OrderService.cancelOrderById(
            req.user?._id,
            req.params?.orderId
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.ORDER_CANCELED_SUCCESS, canceledOrder));
    });

    /**
     * Update order address
     * @description Updates the shipping address of a pending order
     * @route PATCH /api/v1/orders/:orderId/address
     * @access Private
     */
    updateOrderAddress = asyncHandler(async (req, res) => {
        const updatedOrder = await OrderService.updateOrderAddress(
            req.user?._id,
            req.params?.orderId,
            req.body || {}
        );

        return res
            .status(StatusCodes.OK)
            .json(
                ApiResponse.success(responseMessages.ORDER_ADDRESS_UPDATED_SUCCESS, updatedOrder)
            );
    });

    /**
     * Update order status
     * @description Updates the status of an order (admin operation)
     * @route PATCH /api/v1/orders/:orderId/status
     * @access Private/Admin
     */
    updateOrderStatus = asyncHandler(async (req, res) => {
        const updatedOrder = await OrderService.updateOrderStatus(
            req.accessToken,
            req.params?.orderId,
            req.body?.status
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.ORDER_STATUS_UPDATE_SUCCESS, updatedOrder));
    });
}

export default new OrderController();
