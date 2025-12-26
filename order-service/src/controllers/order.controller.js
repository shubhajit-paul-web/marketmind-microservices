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
}

export default new OrderController();
