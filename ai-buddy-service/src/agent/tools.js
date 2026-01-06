import { tool } from "@langchain/core/tools";
import axios from "axios";
import _config from "../config/config.js";
import { z } from "zod";
import logger from "../loggers/winston.logger.js";

// Tool: Search for products based on a query
const searchProducts = tool(
    async ({ query = "", accessToken }) => {
        try {
            const products = await axios.get(
                `${_config.API.PRODUCT_SERVICE}?search=${query.trim()}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            return JSON.stringify(products.data?.data || []);
        } catch (error) {
            logger.error(`Search products Error: ${error.message}`, {
                meta: error,
            });

            return "Something went wrong. Please try again.";
        }
    },
    {
        name: "searchProducts",
        description: "Search for products based on a query",
        schema: z.object({
            query: z.string().describe("The search query for products").trim(),
        }),
    }
);

// Tool: Add a product to the shopping cart
const addProductToCart = tool(
    async ({ productId, quantity = 1, accessToken }) => {
        try {
            await axios.post(
                `${_config.API.CART_SERVICE}/items`,
                {
                    productId,
                    qty: quantity,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            return `Added product with id ${productId} (qty: ${quantity}) to cart.`;
        } catch (error) {
            logger.error(`Add product to cart Error: ${error.message}`, {
                meta: error,
            });

            return "Something went wrong. Please try again.";
        }
    },
    {
        name: "addProductToCart",
        description: "Add a product to the shopping cart",
        schema: z.object({
            productId: z.string().describe("The id of the product to add to the cart").trim(),
            quantity: z
                .number()
                .describe("The quantity of the product to add to the cart")
                .default(1),
        }),
    }
);

export default { searchProducts, addProductToCart };
