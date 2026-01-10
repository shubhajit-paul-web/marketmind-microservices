import { model, Schema } from "mongoose";

// Price Schema (Sub-schema)
const priceSchema = new Schema(
    {
        amount: {
            type: Number,
            min: 0,
            required: true,
        },
        currency: {
            type: String,
            enum: ["INR", "USD"],
            required: true,
        },
    },
    { _id: false, versionKey: false }
);

// Payment Schema
const paymentSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        orderId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        paymentId: String,
        razorpayOrderId: {
            type: String,
            required: true,
        },
        signature: String,
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "PENDING",
        },
        price: {
            type: priceSchema,
            required: true,
        },
    },
    { timestamps: true }
);

const Payment = model("Payment", paymentSchema);
export default Payment;
