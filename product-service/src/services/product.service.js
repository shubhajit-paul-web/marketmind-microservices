import ProductDAO from "../dao/product.dao.js";
import { uploadFile } from "./storage.service.js";

class ProductService {
    async createProduct(sellerId, productData) {
        const finalProductData = { ...productData };

        if (Array.isArray(productData?.images)) {
            const uploadedProductImages = await Promise.all(
                (productData?.images || [])?.map((image) => uploadFile(image))
            );

            if (uploadedProductImages?.length) {
                finalProductData.images = uploadedProductImages?.map((image) => ({
                    url: image?.url,
                    thumbnail: image?.thumbnail,
                    id: image?.fileId,
                }));
            }
        }

        const createdProduct = await ProductDAO.createProduct(sellerId, finalProductData);

        return createdProduct;
    }
}

export default new ProductService();
