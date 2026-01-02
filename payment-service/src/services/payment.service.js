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

const razorpay = new Razorpay({
    key_id: _config.RAZORPAY.API_KEY,
    key_secret: _config.RAZORPAY.KEY_SECRET,
});

class PaymentService {
    async createPayment(accessToken, userId, orderId) {
        let order;

        try {
            // Fetch order details
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
            const razorpayOrder = await razorpay.orders.create(price);

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

    async verifyPayment(userId, requestBody) {
        const { razorpayOrderId, paymentId, signature } = requestBody;

        const isValid = await validatePaymentVerification(
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

        return payment;
    }
}

export default new PaymentService();
