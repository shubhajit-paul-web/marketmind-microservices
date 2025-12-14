import asyncHandler from "../utils/asyncHandler.js";
import CartService from "../services/cart.service.js";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "../utils/ApiResponse.js";
import responseMessages from "../constants/responseMessages.js";

/**
 * Cart Controller
 * @description Handles HTTP requests for cart operations
 */
class CartController {
    /**
     * Get user's cart
     * @description Retrieves the shopping cart for the authenticated user
     * @route GET /api/v1/cart
     * @access Private
     */
    getCart = asyncHandler(async (req, res) => {
        const cart = await CartService.getCart(req.user?._id);

        return res.status(StatusCodes.OK).json(
            ApiResponse.success(responseMessages.CART_FETCHED_SUCCESS, {
                cart,
                totals: {
                    itemCount: cart?.items?.length ?? 0,
                    totalQuantity: cart?.items?.reduce((total, item) => total + item?.qty, 0) ?? 0,
                },
            })
        );
    });

    /**
     * Add item to cart
     * @description Adds a product to the authenticated user's cart or updates its quantity.
     * @route POST /api/v1/cart/items
     * @access Private
     */
    addItemToCart = asyncHandler(async (req, res) => {
        const { productId, qty } = req.body ?? {};
        const cart = await CartService.addItemToCart(req.user?._id, productId, qty);

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.ITEM_ADDED_SUCCESS, cart));
    });

    /**
     * Update item quantity in cart
     * @description Updates the quantity of a specific product in the authenticated user's cart
     * @route PATCH /api/v1/cart/items/:productId
     * @access Private
     */
    updateItemQuantity = asyncHandler(async (req, res) => {
        const cart = await CartService.updateItemQuantity(
            req.user?._id,
            req.params?.productId,
            req.body?.qty
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.ITEM_UPDATED_SUCCESS, cart));
    });
}

export default new CartController();
