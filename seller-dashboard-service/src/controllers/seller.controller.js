import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import SellerService from "../services/seller.service.js";
import responseMessages from "../constants/responseMessages.js";

class SellerController {
    getMetrics = asyncHandler(async (req, res) => {
        const metrics = await SellerService.getMetrics(req.user?._id);

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.METRICS_FETCHED_SUCCESS, metrics));
    });

    getOrders = asyncHandler(async (req, res) => {
        const orders = await SellerService.getOrders(req.user?._id);

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.ORDERS_FETCHED_SUCCESS, orders));
    });
}

export default new SellerController();
