import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import getUnitAmount from "../utils/getUnitAmount.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";

class SellerService {
    /**
     * Get quick dashboard numbers for a seller.
     * - totalSales: how many units were sold
     * - totalRevenue: money earned from those sales
     * - topProducts: seller products ordered by units sold (highest first)
     */
    async getMetrics(sellerId) {
        // 1) Fetch the seller's products (only what the dashboard needs)
        const sellerProducts = await Product.find({ seller: sellerId })
            .select("name category stock price")
            .lean();

        // No products => nothing to calculate
        if (!sellerProducts?.length) {
            return {
                totalSales: 0,
                totalRevenue: 0,
                topProducts: [],
            };
        }

        // We'll use these ids to find matching orders
        const sellerProductObjectIds = sellerProducts.map((product) => product._id);

        // Quick lookups while we loop order items:
        // - productById: id -> product details
        // - isSellerProductId: id -> true (fast membership check)
        const productById = {};
        const isSellerProductId = {};

        for (const product of sellerProducts) {
            const id = product?._id?.toString();
            if (!id) continue;
            productById[id] = product;
            isSellerProductId[id] = true;
        }

        // 2) Fetch orders that contain at least one of the seller's products (ignore cancelled orders)
        const qualifyingStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
        const orders = await Order.find({
            status: { $in: qualifyingStatuses },
            "items.productId": { $in: sellerProductObjectIds },
        })
            .select("items")
            .lean();

        // 3) Walk through every order item and sum up totals
        let totalSales = 0;
        let totalRevenue = 0;

        // productId -> { sold, revenue }
        const statsByProductId = {};

        orders.forEach((order) => {
            for (const item of order?.items ?? []) {
                const productId = item?.productId?.toString();

                // Extra safety: the query should already filter this, but don't trust data blindly
                if (!productId || !isSellerProductId[productId]) continue;

                const quantity = Number(item?.quantity ?? 0);
                if (!Number.isFinite(quantity) || quantity <= 0) continue;

                const lineRevenue = getUnitAmount(item?.price) * quantity;

                totalSales += quantity;
                totalRevenue += lineRevenue;

                const prev = statsByProductId[productId] ?? { sold: 0, revenue: 0 };
                statsByProductId[productId] = {
                    sold: prev.sold + quantity,
                    revenue: prev.revenue + lineRevenue,
                };
            }
        });

        // 4) Build the final response the dashboard expects
        const topProducts = Object.keys(statsByProductId)
            .map((productId) => {
                const stats = statsByProductId[productId];
                const product = productById[productId];

                // If a product got deleted later, still return the numbers
                return {
                    ...(product ?? { _id: productId }),
                    sold: stats?.sold ?? 0,
                    totalRevenue: stats?.revenue ?? 0,
                };
            })
            .sort((a, b) => (b?.sold ?? 0) - (a?.sold ?? 0)) // Highest-selling products first
            .slice(0, 10); // Only send back the top 10

        return { totalSales, totalRevenue, topProducts };
    }

    async getOrders(sellerId) {
        // Get this seller's products
        const sellerProducts = await Product.find({ seller: sellerId })
            .select("name category price")
            .lean();

        // Keep product ids as strings for easy matching
        const sellerProductObjectIds = sellerProducts.map((product) => product?._id.toString());

        // Get orders that contain any of these products
        const orders = await Order.find({
            "items.productId": sellerProductObjectIds,
        })
            .select("-_id -totalPrice -userId -__v")
            .lean();

        if (!orders.length) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.ORDERS_NOT_FOUND,
                errorCodes.NOT_FOUND
            );
        }

        // Map productId -> product details (quick lookup)
        const sellerProductsMap = {};

        for (const product of sellerProducts) {
            sellerProductsMap[product._id] = product;
        }

        // Flatten orders into a list of items (product info + order info)
        const orderItems = [];

        orders.forEach((order) => {
            order.items.forEach((item) => {
                const productId = item.productId.toString();

                if (sellerProductObjectIds.includes(productId)) {
                    const product = sellerProductsMap[productId];

                    // Keep orderDetails clean (we already return the matching item separately)
                    delete order.items;

                    const totalAmount = getUnitAmount(product.price) * (item.quantity ?? 0);

                    orderItems.push({
                        productDetails: {
                            ...product,
                            quantity: item.quantity ?? 0,
                            price: {
                                amount: getUnitAmount(product.price),
                                totalAmount,
                                currency: product.price?.currency ?? "INR",
                            },
                        },
                        orderDetails: order,
                    });
                }
            });
        });

        return orderItems;
    }
}

export default new SellerService();
