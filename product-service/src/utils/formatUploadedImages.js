// Normalize uploaded file results into the product image shape expected by the API/DB.
function formatUploadedImages(imagesArray = []) {
    return imagesArray?.map((image) => ({
        url: image?.url,
        thumbnail: image?.thumbnailUrl,
        id: image?.fileId,
    }));
}

export default formatUploadedImages;
