import { Schema, model } from "mongoose";

// Price schema
const priceSchema = new Schema(
    {
        amount: {
            type: Number,
            required: true,
        },
        discountPrice: {
            type: Number,
            validate: {
                validator: function (discountPrice) {
                    if (!discountPrice) return true; // no discount
                    return discountPrice < this.amount && discountPrice > 0;
                },
                message: "Discount price must be less than the original price",
            },
        },
        currency: {
            type: String,
            enum: ["INR", "USD"],
            default: "INR",
        },
    },
    { _id: false }
);

// Product schema
const productSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            minLength: 10,
            maxLength: 250,
            required: true,
        },
        description: {
            type: String,
            trim: true,
            maxLength: 1500,
        },
        category: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        stock: {
            type: Number,
            default: 0,
        },
        price: priceSchema,
        images: [
            {
                url: String,
                thumbnail: String,
                id: String,
            },
        ],
        seller: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Product = model("Product", productSchema);
export default Product;
