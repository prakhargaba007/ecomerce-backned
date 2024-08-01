const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { validationResult } = require("express-validator");

// Add a product to the cart
exports.addToCart = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const userCart = await Cart.findOne({ user: req.userId });
    if (!userCart) {
      console.log("not there");
      const newCart = new Cart({
        user: req.userId,
        products: [{ product: productId, quantity }],
        totalPrice: (product.price * +quantity).toFixed(0),
      });
      console.log(newCart);

      await newCart.save();

      const userId = req.userId;
      const user = await User.findById(userId);
      user.cart.push(newCart);
      await user.save();

      return res
        .status(201)
        .json({ message: "Product added to cart", cart: newCart });
    }

    const productIndex = userCart.products.findIndex(
      (p) => p.product.toString() === productId
    );
    console.log(3, productIndex);
    if (productIndex >= 0) {
      console.log(1);
      userCart.products[productIndex].quantity += +quantity;
    } else {
      console.log(2);
      userCart.products.push({ product: productId, quantity });
    }
    console.log(product.price);
    console.log(quantity);
    console.log((product.price * +quantity).toFixed(0));
    console.log(userCart.totalPrice);
    console.log(+userCart.totalPrice + +(product.price * +quantity).toFixed(0));
    console.log(userCart.totalPrice + +(product.price * +quantity).toFixed(0));
    console.log(userCart.totalPrice + (product.price * +quantity).toFixed(0));

    userCart.totalPrice += +(product.price * +quantity).toFixed(0);
    // console.log(userCart);

    await userCart.save();
    res.status(200).json(userCart);
  } catch (err) {
    next(err);
  }
};

// Get the user's cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate(
      "products.product"
    );
    if (!cart) {
      return res.status(200).json({ message: "Cart is empty", cart: null });
    }

    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
};

// Update product quantity in the cart
exports.updateCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.userId }).populate(
      "products.product"
    );
    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    const productIndex = cart.products.findIndex(
      (p) => p.product._id.toString() === productId
    );
    if (productIndex === -1) {
      const error = new Error("Product not found in cart");
      error.statusCode = 404;
      throw error;
    }

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      c;
      throw error;
    }

    cart.products[productIndex].quantity = quantity;

    cart.totalPrice = cart.products.reduce(
      (total, p) => total + p.product.price * p.quantity,
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
};

// Remove a product from the cart
exports.removeFromCart = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.userId }).populate(
      "products.product"
    );
    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    const productIndex = cart.products.findIndex(
      (p) => p.product._id.toString() === productId
    );
    if (productIndex === -1) {
      const error = new Error("Product not found in cart");
      error.statusCode = 404;
      throw error;
    }

    const product = cart.products[productIndex];
    cart.totalPrice -= product.product.price * product.quantity;
    cart.products.splice(productIndex, 1);

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
};

// Clear the cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    cart.products = [];
    cart.totalPrice = 0;

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
};
