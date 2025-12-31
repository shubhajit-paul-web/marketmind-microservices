/* eslint-disable no-prototype-builtins */
import axios from "axios";
import _config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import responseMessages from "../constants/responseMessages.js";
import { StatusCodes } from "http-status-codes";
import errorCodes from "../constants/errorCodes.js";
import OrderDAO from "../dao/order.dao.js";
import logger from "../loggers/winston.logger.js";

/**
 * Order Service
 * @description Handles business logic for order-related operations including creation, retrieval, updates, and cancellations
 */
class OrderService {
    /**
     * Create a new order
     * @param {string} userId - User ID
     * @param {string} accessToken - JWT access token for API authentication
     * @param {string} orderCurrency - Currency code for the order (e.g., USD, INR)
     * @param {Object} shippingAddress - Shipping address details
     * @returns {Promise<Object>} Created order document
     */
    async createOrder(userId, accessToken, orderCurrency, shippingAddress) {
        // Fetch user cart from cart service
        const cartResponse = await axios.get(_config.API.CART_SERVICE, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const cartItems = cartResponse.data?.data?.cart?.items ?? [];

        // Validate cart is not empty before creating order
        if (cartItems?.length === 0) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.EMPTY_CART,
                errorCodes.EMPTY_CART
            );
        }

        // Fetch product details for each cart item concurrently for improved performance
        const productRequests = cartItems.map(async (item) => {
            const res = await axios.get(`${_config.API.PRODUCT_SERVICE}/${item?.productId}`);
            return res.data?.data;
        });

        // Fetch customer profile from auth service
        async function fetchCustomerProfile() {
            const response = await axios.get(`${_config.API.AUTH_SERVICE}/me`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            return response.data?.data;
        }

        // Resolve all product and customer data requests concurrently
        const [products, customerProfile] = await Promise.all([
            Promise.all(productRequests),
            fetchCustomerProfile(),
        ]);

        let totalPriceAmount = 0;

        // Map cart items to order items and validate stock availability
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

            // Verify sufficient stock is available for the requested quantity
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

        // Persist validated order with items, total price, customer details, and shipping address
        const createdOrder = await OrderDAO.createOrder({
            userId,
            items: orderItems,
            totalPrice: {
                amount: totalPriceAmount.toFixed(2),
                currency: orderCurrency,
            },
            customerDetails: {
                fullName: customerProfile.fullName,
                username: customerProfile.username,
                email: customerProfile.email,
                phoneNumber: customerProfile.phoneNumber,
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

    /**
     * Retrieve all orders for a user
     * @param {string} userId - User ID
     * @param {Object} query - Query parameters (page, limit, sortBy, sortType)
     * @returns {Promise<Object>} Orders array with pagination metadata
     */
    async getAllOrders(userId, query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const sortType = query.sortType ?? "desc";
        let sortBy = query.sortBy ?? "createdAt";

        const skip = (page - 1) * limit;

        if (sortBy === "totalAmount") sortBy = "totalPrice.amount";

        // Fetch paginated orders and total count concurrently
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

    /**
     * Retrieve a specific order by ID
     * @param {string} userId - User ID (for authorization)
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} Order document
     * @throws {ApiError} If order not found or user unauthorized
     */
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

    /**
     * Cancel an order by ID
     * @param {string} userId - User ID (for authorization)
     * @param {string} orderId - Order ID to cancel
     * @returns {Promise<Object>} Updated order document with CANCELLED status
     * @throws {ApiError} If order not found, unauthorized, or not in PENDING status
     */
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

        // Only allow cancellation for PENDING orders
        if (order.status !== "PENDING") {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.ORDER_CANCELLATION_NOT_ALLOWED,
                errorCodes.ORDER_CANCELLATION_NOT_ALLOWED
            );
        }

        return await OrderDAO.updateOrderStatusById(orderId, "CANCELLED");
    }

    /**
     * Update shipping address of an order
     * @param {string} userId - User ID (for authorization)
     * @param {string} orderId - Order ID
     * @param {Object} newAddress - New shipping address fields to update
     * @returns {Promise<Object>} Updated order document
     * @throws {ApiError} If order not found, unauthorized, not PENDING, or no valid address fields
     */
    async updateOrderAddress(userId, orderId, newAddress) {
        const order = await this.getOrderById(userId, orderId);

        // Only allow address updates for PENDING orders
        if (order.status !== "PENDING") {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.ORDER_ADDRESS_UPDATE_NOT_ALLOWED,
                errorCodes.ORDER_ADDRESS_UPDATE_NOT_ALLOWED
            );
        }

        const addressFields = ["street", "city", "state", "zip", "country", "typeOfAddress"];

        // Validate that at least one valid address field is provided
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

    /**
     * Update the status of an order
     * @param {string} accessToken - JWT access token for product service calls
     * @param {string} orderId - Order ID
     * @param {string} status - New order status
     * @returns {Promise<Object>} Updated order document
     * @throws {ApiError} If order not found or status update fails
     */
    async updateOrderStatus(accessToken, orderId, status) {
        // Handle CONFIRMED status: decrease product stocks
        if (status === "CONFIRMED") {
            const order = await OrderDAO.getOrderById(orderId);

            if (!order) {
                throw new ApiError(
                    StatusCodes.NOT_FOUND,
                    responseMessages.ORDER_NOT_FOUND,
                    errorCodes.NOT_FOUND
                );
            }

            // Prevent duplicate confirmation status updates
            if (order.status === "CONFIRMED") {
                throw new ApiError(
                    StatusCodes.BAD_REQUEST,
                    responseMessages.ORDER_STATUS_UPDATE_FAILD,
                    errorCodes.ORDER_STATUS_UPDATE_FAILD
                );
            }

            // Decrease product stock in inventory for each ordered item
            order.items?.forEach(async (item) => {
                try {
                    axios.patch(
                        `${_config.API.PRODUCT_SERVICE}/${item.productId}/stock`,
                        {
                            stock: item.quantity,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        }
                    );
                } catch (error) {
                    logger.error(`Decrease products stocks ERROR: ${error.message}`);
                }
            });
        }

        return await OrderDAO.updateOrderStatusById(orderId, status);
    }
}

export default new OrderService();
