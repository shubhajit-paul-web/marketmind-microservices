import { StatusCodes } from "http-status-codes";
import ProductDAO from "../dao/product.dao.js";
import ApiError from "../utils/ApiError.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";

/**
 * Verifies that the authenticated user owns the product before allowing access.
 */
async function authorizeProductAccess(req, res, next) {
    const sellerId = req.user?._id;
    const productId = req.params?.productId;

    const hasProduct = await ProductDAO.findProductById(productId);

    if (!hasProduct) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            responseMessages.PRODUCT_NOT_FOUND,
            errorCodes.PRODUCT_NOT_FOUND
        );
    }

    const hasAccess = await ProductDAO.findProductByIdAndSeller(sellerId, productId);

    if (!hasAccess) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            responseMessages.INSUFFICIENT_PERMISSIONS,
            errorCodes.INSUFFICIENT_PERMISSIONS
        );
    }

    req.product = hasAccess;
    next();
}

export default authorizeProductAccess;
