/* eslint-disable no-prototype-builtins */
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
                    amount:
                        product.price?.discountPrice?.toFixed(2) ??
                        product.price?.amount?.toFixed(2),
                    currency: product.price?.currency,
                },
            };
        });

        // Save the validated order (items, total, and shipping details) to the database
        const createdOrder = await OrderDAO.createOrder({
            userId,
            items: orderItems,
            totalPrice: {
                amount: totalPriceAmount.toFixed(2),
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

    async getAllOrders(userId, query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const sortType = query.sortType ?? "desc";
        let sortBy = query.sortBy ?? "createdAt";

        const skip = (page - 1) * limit;

        if (sortBy === "totalAmount") sortBy = "totalPrice.amount";

        // Parallel fetch: Get paginated orders and total count simultaneously to reduce response time
        const [orders, totalOrders] = await Promise.all([
            OrderDAO.getAllOrders(userId, skip, limit, sortBy, sortType),
            OrderDAO.countOrders({ userId }),
        ]);

        const totalPages = Math.ceil(totalOrders / limit);

        return {
            orders,
            pagination: {
                page: page,
                limit,
                totalOrders,
                totalPages,
                ordersPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
        };
    }

    async getOrderById(userId, orderId) {
        const order = await OrderDAO.getOrderById(orderId);

        if (!order) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.ORDER_NOT_FOUND,
                errorCodes.NOT_FOUND
            );
        }

        if (order.userId?.toString() !== userId) {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                responseMessages.ORDER_ACCESS_FORBIDDEN,
                errorCodes.INSUFFICIENT_PERMISSIONS
            );
        }

        return order;
    }

    async cancelOrderById(userId, orderId) {
        const order = await OrderDAO.getOrderById(orderId);

        if (!order) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.ORDER_NOT_FOUND,
                errorCodes.NOT_FOUND
            );
        }

        if (order.userId?.toString() !== userId) {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                responseMessages.ORDER_ACCESS_FORBIDDEN,
                errorCodes.INSUFFICIENT_PERMISSIONS
            );
        }

        if (order.status !== "PENDING") {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.ORDER_CANCELLATION_NOT_ALLOWED,
                errorCodes.ORDER_CANCELLATION_NOT_ALLOWED
            );
        }

        return await OrderDAO.updateOrderStatusById(orderId, "CANCELLED");
    }

    async updateOrderAddress(userId, orderId, newAddress) {
        const order = await this.getOrderById(userId, orderId);

        if (order.status !== "PENDING") {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.ORDER_ADDRESS_UPDATE_NOT_ALLOWED,
                errorCodes.ORDER_ADDRESS_UPDATE_NOT_ALLOWED
            );
        }

        const addressFields = ["street", "city", "state", "zip", "country", "typeOfAddress"];

        // Check if new address contains at least one valid field
        let hasNewAddressFields;
        addressFields.forEach((field) => {
            if (newAddress.hasOwnProperty(field)) {
                hasNewAddressFields = true;
            }
        });

        if (!hasNewAddressFields) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.NO_VALID_ADDRESS_FIELDS,
                errorCodes.NO_VALID_ADDRESS_FIELDS
            );
        }

        // Return the updated order
        return await OrderDAO.updateOrderAddress(orderId, {
            ...order.shippingAddress,
            ...newAddress,
        });
    }
}

export default new OrderService();
