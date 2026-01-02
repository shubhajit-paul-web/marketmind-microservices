import asyncHandler from "../utils/asyncHandler.js";
import PaymentService from "../services/payment.service.js";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "../utils/ApiResponse.js";
import responseMessages from "../constants/responseMessages.js";

class PaymentController {
    createPayment = asyncHandler(async (req, res) => {
        const createdPayment = await PaymentService.createPayment(
            req.accessToken,
            req.user?._id,
            req.params?.orderId
        );

        return res
            .status(StatusCodes.CREATED)
            .json(ApiResponse.created(responseMessages.PAYMENT_INITIATED_SUCCESS, createdPayment));
    });

    verifyPayment = asyncHandler(async (req, res) => {
        const updatedPayment = await PaymentService.verifyPayment(req.user?._id, req.body || {});

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.PAYMENT_SUCCESS, updatedPayment));
    });
}

export default new PaymentController();
