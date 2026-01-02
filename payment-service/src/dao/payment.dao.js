import Payment from "../models/payment.model.js";

class PaymentDAO {
    async createPayment(data) {
        return await Payment.create(data);
    }

    async updatePayment(filter, dataToUpdate) {
        return await Payment.findOneAndUpdate(filter, dataToUpdate).lean();
    }
}

export default new PaymentDAO();
