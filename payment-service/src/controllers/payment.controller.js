import asyncHandler from "../utils/asyncHandler.js";
import PaymentService from "../services/payment.service.js";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "../utils/ApiResponse.js";
import responseMessages from "../constants/responseMessages.js";

/**
 * Payment Controller
 * @description Handles HTTP requests for payment operations
 */
class PaymentController {
    /**
     * Create a new payment
     * @description Initiates a payment for an order using Razorpay
     * @route POST /api/v1/payments/create/:orderId
     * @access Private
     */
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

    /**
     * Verify payment
     * @description Verifies the payment signature from Razorpay and updates payment status
     * @route POST /api/v1/payments/verify
     * @access Private
     */
    verifyPayment = asyncHandler(async (req, res) => {
        const updatedPayment = await PaymentService.verifyPayment(req.user?._id, req.body || {});

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.PAYMENT_SUCCESS, updatedPayment));
    });

    /**
     * Get payment information
     * @description Retrieves payment details for a specific payment ID
     * @route GET /api/v1/payments/:paymentId
     * @access Private
     */
    getPaymentInfo = asyncHandler(async (req, res) => {
        const paymentInfo = await PaymentService.getPaymentInfo(
            req.user?._id,
            req.params?.paymentId
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.PAYMENT_INFO_FETCHED_SUCCESS, paymentInfo));
    });
}

export default new PaymentController();
