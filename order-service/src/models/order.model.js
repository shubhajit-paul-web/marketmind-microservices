import { Schema, model } from "mongoose";
import { COUNTRIES } from "../constants/constants.js";

// Address Schema
const addressSchema = new Schema(
    {
        street: {
            type: String,
            trim: true,
            required: true,
        },
        city: {
            type: String,
            trim: true,
            required: true,
        },
        state: {
            type: String,
            trim: true,
            required: true,
        },
        zip: {
            type: String,
            trim: true,
            minLength: 5,
            maxLength: 7,
            required: true,
        },
        country: {
            type: String,
            enum: COUNTRIES,
            required: true,
        },
        landmark: {
            type: String,
            trim: true,
        },
        typeOfAddress: {
            type: String,
            enum: ["work", "home"],
            required: true,
        },
    },
    { _id: false, timestamps: true }
);

// Price Schema
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
            default: "INR",
        },
    },
    { _id: false }
);

// Customer details Schema
const customerDetailsSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        fullName: {
            firstName: String,
            lastName: String,
        },
        email: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    required: true,
                },
                quantity: {
                    type: Number,
                    min: 1,
                    default: 1,
                },
                price: priceSchema,
            },
        ],
        totalPrice: {
            type: priceSchema,
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
            default: "PENDING",
        },
        customerDetails: {
            type: customerDetailsSchema,
            required: true,
        },
        shippingAddress: {
            type: addressSchema,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Order = model("Order", orderSchema);
export default Order;
