import asyncHandler from "../utils/asyncHandler.js";
import OrderService from "../services/order.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import responseMessages from "../constants/responseMessages.js";

class OrderController {
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

    getAllOrders = asyncHandler(async (req, res) => {
        const { orders, pagination } = await OrderService.getAllOrders(
            req.user?._id,
            req.query || {}
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.ORDERS_FETCHED_SUCCESS, orders, pagination));
    });

    getOrderById = asyncHandler(async (req, res) => {
        const order = await OrderService.getOrderById(req.user?._id, req.params?.orderId);

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.ORDER_FETCHED_SUCCESS, order));
    });

    cancelOrderById = asyncHandler(async (req, res) => {
        const canceledOrder = await OrderService.cancelOrderById(
            req.user?._id,
            req.params?.orderId
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.ORDER_CANCELED_SUCCESS, canceledOrder));
    });

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
