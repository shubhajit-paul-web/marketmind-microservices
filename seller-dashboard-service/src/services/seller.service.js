import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import getUnitAmount from "../utils/getUnitAmount.js";

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

    async getOrders(sellerId, query) {
        // Extract pagination and filter options from the query
        const page = parseInt(query.page || 1);
        const limit = parseInt(query.limit || 10);
        const sortType = query.sortType || "desc";
        const sortBy = query.sortBy || "createdAt";
        const status = query.status;

        const skip = (page - 1) * limit;

        // Get this seller's products
        const sellerProducts = await Product.find({ seller: sellerId })
            .select("name category price")
            .lean();

        // Keep product ids as strings for easy matching
        const sellerProductObjectIds = sellerProducts.map((product) => product?._id.toString());

        const orderFilter = {
            "items.productId": sellerProductObjectIds,
        };

        if (status) orderFilter.status = status.toUpperCase();

        // Fetch both the orders and the total count at the same time
        const [orders, totalOrders] = await Promise.all([
            Order.find(orderFilter)
                .select("-_id -totalPrice -userId -__v")
                .skip(skip)
                .limit(limit)
                .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
                .lean(),
            Order.countDocuments(orderFilter),
        ]);

        // If no orders found, return empty result
        if (!orders.length) return [];

        // Map productId -> product details (quick lookup)
        const sellerProductsMap = {};

        for (const product of sellerProducts) {
            sellerProductsMap[product._id] = product;
        }

        // Create a flat list of order items with both product and order details
        const orderItems = [];

        // Loop through each order and each item within the order
        orders.forEach((order) => {
            order.items.forEach((item) => {
                const productId = item.productId.toString();

                // Only include items that belong to this seller
                if (sellerProductObjectIds.includes(productId)) {
                    const product = sellerProductsMap[productId];

                    delete order.items;

                    const totalAmount = getUnitAmount(product.price) * (item.quantity ?? 0);

                    // Add this item with all its details to our results
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

        const totalPages = Math.ceil(totalOrders / limit);

        // TODO: Refactor pagination to be seller-item based instead of order-based.
        // Seller dashboard should paginate only the items belonging to this seller
        // across all orders.

        return {
            orderItems,
            pagination: {
                page,
                limit,
                totalOrders,
                totalPages,
                ordersCount: orderItems.length,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
        };
    }
}

export default new SellerService();
