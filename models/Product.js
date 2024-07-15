const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    review: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    ratings: {
      star5: { type: Number, default: 0 },
      star4: { type: Number, default: 0 },
      star3: { type: Number, default: 0 },
      star2: { type: Number, default: 0 },
      star1: { type: Number, default: 0 },
    },
    gender: {
      type: String,
      enum: ["male", "female", "both"],
    },
    fabric: {
      type: String,
    },
    color: {
      type: String,
    },
    size: {
      type: String,
    },
    brand: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
