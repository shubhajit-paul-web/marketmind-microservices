import Payment from "../models/payment.model.js";

/**
 * Data Access Object for Payment operations.
 * @description Handles all database interactions for payment-related data.
 */
class PaymentDAO {
    /**
     * Creates a new payment record in the database
     * @param {Object} data - Payment information to store
     * @returns {Promise<Object>} Created payment document
     */
    async createPayment(data) {
        return await Payment.create(data);
    }

    /**
     * Updates an existing payment record
     * @param {Object} filter - Criteria to find the payment to update
     * @param {Object} dataToUpdate - New payment data to apply
     * @returns {Promise<Object>} Updated payment document
     */
    async updatePayment(filter, dataToUpdate) {
        return await Payment.findOneAndUpdate(filter, dataToUpdate, { new: true }).lean();
    }

    /**
     * Retrieves payment information from the database
     * @param {Object} filter - Criteria to find the payment
     * @returns {Promise<Object>} Payment document (without signature and version fields)
     */
    async getPaymentInfo(filter) {
        return await Payment.findOne(filter).select("-signature -__v").lean();
    }
}

export default new PaymentDAO();
