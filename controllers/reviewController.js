// controllers/reviewController.js
const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { validationResult } = require("express-validator");

// controllers/reviewController.js

exports.addReview = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { orderId, productId, rating, comment } = req.body;
  const user = req.userId;
  const imagePath = req.file ? req.file.path : null;

  try {
    const order = await Order.findOne({ _id: orderId, user }).populate(
      "products.product"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const productInOrder = order.products.find(
      (p) => p.product._id.toString() === productId
    );
    if (!productInOrder) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    const newReview = new Review({
      user,
      product: productId,
      order: orderId,
      rating,
      comment,
      image: imagePath,
    });

    const product = await Product.findById(productId);
    // console.log(product);

    // Add new review
    product.review.push(newReview);

    // Keep only the latest 5 reviews
    if (product.review.length > 5) {
      product.review = product.review.slice(-5);
    }

    // Update star ratings
    if (rating == 5) product.ratings.star5 += 1;
    if (rating == 4) product.ratings.star4 += 1;
    if (rating == 3) product.ratings.star3 += 1;
    if (rating == 2) product.ratings.star2 += 1;
    if (rating == 1) product.ratings.star1 += 1;

    await product.save();
    const review = await newReview.save();

    productInOrder.review = review._id;
    await order.save();

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

exports.getReviewsByOrder = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId).populate({
      path: "products.review",
      populate: { path: "user", select: "name" },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order.products.map((p) => p.review));
  } catch (err) {
    next(err);
  }
};

exports.getReviewsByProduct = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ product: productId }).populate(
      "user",
      "name"
    );
    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const user = req.userId; // Assuming req.user is set after authentication

  try {
    const review = await Review.findOne({ _id: reviewId, user });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const user = req.user.id; // Assuming req.user is set after authentication

  try {
    const review = await Review.findOneAndDelete({ _id: reviewId, user });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};
