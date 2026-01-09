import Razorpay from "razorpay";
import _config from "../config/config.js";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";
import logger from "../loggers/winston.logger.js";
import PaymentDAO from "../dao/payment.dao.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import broker from "../broker/broker.js";

const razorpay = new Razorpay({
    key_id: _config.RAZORPAY.API_KEY,
    key_secret: _config.RAZORPAY.KEY_SECRET,
});

/**
 * Payment Service
 * @description Handles business logic for payment processing, verification, and retrieval
 */
class PaymentService {
    /**
     * Create a new payment for an order
     * @param {string} accessToken - User authentication token
     * @param {string} userId - User ID making the payment
     * @param {string} orderId - Order ID to create payment for
     * @returns {Promise<Object>} Created payment object with Razorpay order details
     */
    async createPayment(accessToken, userId, orderId) {
        let order;

        try {
            // Fetch order details from order service
            order = await axios.get(`${_config.API.ORDER_SERVICE}/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
        } catch {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.ORDER_NOT_FOUND,
                errorCodes.NOT_FOUND
            );
        }

        const price = order.data?.data?.totalPrice;

        try {
            // Create Razorpay order with amount in smallest currency unit (paise for INR)
            const razorpayOrder = await razorpay.orders.create({
                amount: price.amount * 100,
                currency: price.currency ?? "INR",
            });

            // Save payment record in database with Razorpay order ID
            const payment = await PaymentDAO.createPayment({
                userId,
                orderId,
                razorpayOrderId: razorpayOrder.id,
                price,
            });

            return payment;
        } catch (error) {
            logger.error(`Razorpay order creation Error: ${error.message}`);

            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                responseMessages.PAYMENT_CREATION_FAILED,
                errorCodes.PAYMENT_CREATION_FAILED
            );
        }
    }

    /**
     * Verify payment signature and update payment status
     * @param {string} userId - User ID who made the payment
     * @param {Object} requestBody - Payment verification data from Razorpay (razorpayOrderId, paymentId, signature)
     * @returns {Promise<Object>} Updated payment object with completed status
     */
    async verifyPayment(accessToken, userId, requestBody) {
        const { razorpayOrderId, paymentId, signature } = requestBody;

        // Validate payment signature using Razorpay's verification utility
        const isValid = validatePaymentVerification(
            {
                order_id: razorpayOrderId,
                payment_id: paymentId,
            },
            signature,
            _config.RAZORPAY.KEY_SECRET
        );

        if (!isValid) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.INVALID_SIGNATURE,
                errorCodes.INVALID_SIGNATURE
            );
        }

        // Update payment record with payment ID, signature, and mark as completed
        const payment = await PaymentDAO.updatePayment(
            {
                userId,
                razorpayOrderId,
                status: "PENDING",
            },
            {
                paymentId,
                signature,
                status: "COMPLETED",
            }
        );

        if (!payment) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.PAYMENT_NOT_FOUND,
                errorCodes.NOT_FOUND
            );
        }

        let userProfile = {};

        try {
            // Fetch user details
            userProfile = await axios.get(`${_config.API.AUTH_SERVICE}/me`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            userProfile = userProfile?.data?.data;
        } catch (error) {
            logger.error("User profile fetched faild", { meta: error });
        }

        broker.publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_SUCCESSFUL", {
            orderId: payment?.orderId,
            user: {
                fullName: userProfile?.fullName,
                email: userProfile?.email,
            },
            paymentInfo: {
                price: payment?.price,
                razorpayOrderId,
                paymentId,
            },
            timestamp: payment?.createdAt,
        });

        return payment;
    }

    /**
     * Retrieve payment information for a user
     * @param {string} userId - User ID who owns the payment
     * @param {string} paymentId - Payment ID to retrieve
     * @returns {Promise<Object>} Payment details object
     */
    async getPaymentInfo(userId, paymentId) {
        const payment = await PaymentDAO.getPaymentInfo({
            userId,
            paymentId,
        });

        if (!payment) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.PAYMENT_NOT_FOUND,
                errorCodes.NOT_FOUND
            );
        }

        return payment;
    }
}

export default new PaymentService();
