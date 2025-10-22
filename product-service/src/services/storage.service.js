import ImageKit, { toFile } from "@imagekit/nodejs";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import errorCodes from "../constants/errorCodes.js";
import { v4 as uuidv4 } from "uuid";
import responseMessages from "../constants/responseMessages.js";

const client = new ImageKit({
    publicKey: config.IMAGEKIT.PUBLIC_KEY,
    privateKey: config.IMAGEKIT.PRIVATE_KEY,
    urlEndpoint: config.IMAGEKIT.URL_ENDPOINT,
});

/**
 * Uploads a file to ImageKit storage
 * @param {Object} file - File object with buffer
 * @returns {Promise<Object>} Uploaded file details
 */
export async function uploadFile(file) {
    if (!file?.buffer) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            responseMessages.FILE_NOT_FOUND,
            errorCodes.FILE_NOT_FOUND
        );
    }

    if (!file?.mimetype?.startsWith("image/")) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            responseMessages.INVALID_IMAGE_FILE,
            errorCodes.VALIDATION_ERROR
        );
    }

    try {
        const uploadedFile = await client.files.upload({
            file: await toFile(Buffer.from(file.buffer), "product"),
            fileName: uuidv4(),
            folder: "marketmind/products",
        });

        return uploadedFile;
    } catch (error) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            responseMessages.IMAGE_UPLOAD_FAILED,
            errorCodes.INTERNAL_SERVER_ERROR,
            false,
            error.message,
            error.stack
        );
    }
}

/**
 * Deletes a file from ImageKit storage
 * @param {string} fileId - ID of the file to delete
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFile(fileId) {
    if (!fileId) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "File ID is required",
            errorCodes.FILE_ID_NOT_FOUND
        );
    }

    try {
        return await client.files.delete(fileId);
    } catch (error) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Invalid file ID or file does not exists",
            errorCodes.FILE_NOT_FOUND,
            false,
            error.message,
            error.stack
        );
    }
}
