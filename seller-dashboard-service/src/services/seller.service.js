import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

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

        // If the seller has no products, there’s nothing to calculate
        if (!sellerProducts?.length) {
            return {
                totalSales: 0,
                totalRevenue: 0,
                topProducts: [],
            };
        }

        // Keep a list of product ids for the order query
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

        // Small helper: safely read the unit price from an order item (prefer discountPrice if it exists)
        const getUnitAmount = (price) => {
            const amount = price?.discountPrice ?? price?.amount;
            const num = Number(amount ?? 0);
            return Number.isFinite(num) ? num : 0;
        };

        // 3) Walk through every order item and sum up totals
        let totalSales = 0;
        let totalRevenue = 0;

        // Map: productId -> { sold, revenue }
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

                // If a product was deleted after an order was placed, still return the numbers
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
}

export default new SellerService();
