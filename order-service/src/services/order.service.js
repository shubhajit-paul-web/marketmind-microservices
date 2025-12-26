import axios from "axios";
import _config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import responseMessages from "../constants/responseMessages.js";
import { StatusCodes } from "http-status-codes";
import errorCodes from "../constants/errorCodes.js";
import OrderDAO from "../dao/order.dao.js";

class OrderService {
    async createOrder(userId, accessToken, orderCurrency, shippingAddress) {
        // fetch user cart from cart service
        const cartResponse = await axios.get(_config.API.CART_SERVICE, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const cartItems = cartResponse.data?.data?.cart?.items ?? [];

        if (cartItems?.length === 0) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.EMPTY_CART,
                errorCodes.EMPTY_CART
            );
        }

        // Fetch product details for each cart item
        const products = await Promise.all(
            cartItems.map(async (item) => {
                const res = await axios.get(`${_config.API.PRODUCT_SERVICE}/${item?.productId}`);
                return res.data?.data;
            })
        );

        let totalPriceAmount = 0;

        // Create order items and check stock
        const orderItems = products.map((product) => {
            // Find the matching cart entry for this product (to get quantity)
            const cartItem = cartItems.find((item) => item?.productId === product?._id);

            if (!cartItem) {
                throw new ApiError(
                    StatusCodes.NOT_FOUND,
                    responseMessages.PRODUCT_NOT_FOUND,
                    errorCodes.NOT_FOUND
                );
            }

            // if not in stock, does not allow order creation
            if (cartItem?.quantity > product?.stock) {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    responseMessages.INSUFFICIENT_STOCK(product?.name),
                    errorCodes.INSUFFICIENT_STOCK
                );
            }

            totalPriceAmount += product?.price?.amount * cartItem?.quantity;

            return {
                productId: product._id,
                quantity: cartItem?.quantity,
                price: {
                    amount: product.price?.discountPrice ?? product.price?.amount,
                    currency: product.price?.currency,
                },
            };
        });

        // Save the validated order (items, total, and shipping details) to the database
        const createdOrder = await OrderDAO.createOrder({
            userId,
            items: orderItems,
            totalPrice: {
                amount: totalPriceAmount,
                currency: orderCurrency,
            },
            shippingAddress: {
                street: shippingAddress.street,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zip: shippingAddress.zip,
                country: shippingAddress.country,
                landmark: shippingAddress.landmark,
                typeOfAddress: shippingAddress.typeOfAddress,
            },
        });

        return createdOrder;
    }
}

export default new OrderService();
