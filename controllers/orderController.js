const Order = require("../models/Order");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Address = require("../models/Address");

exports.createOrder = async (req, res, next) => {
  const { shippingAddressId, payment } = req.body;

  try {
    // Find the user
    const user = await User.findById(req.userId).populate("cart");

    // Check if the user has a cart
    const cart = await Cart.findOne({ user: user._id }).populate(
      "products.product"
    );

    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    // Check if the cart has products
    if (cart.products.length === 0) {
      const error = new Error("Cart is empty");
      error.statusCode = 400;
      throw error;
    }

    // Calculate the total price
    let totalPrice = 0;
    const products = cart.products.map((item) => {
      const productPrice = item.product.price;
      totalPrice += productPrice * item.quantity;
      return {
        product: item.product._id,
        name: item.product.name,
        price: productPrice,
        quantity: item.quantity,
      };
    });

    // Create a new order
    const newOrder = new Order({
      user: user._id,
      products: products,
      totalPrice,
      status: "Pending",
      shippingAddress: shippingAddressId,
      payment: payment,
    });

    // Save the order
    const order = await newOrder.save();

    // Update the user's orders
    user.order.push(order._id);

    // Clear the cart
    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();

    // Update the stock of products
    // console.log(61);
    for (const item of order.products) {
      console.log(item.product.toHexString());
      const product = await Product.findById(item.product.toHexString());
      console.log(product);
      if (product) {
        console.log(0);
        product.stock -= item.quantity;
        console.log(1);
        await product.save();
        console.log(2);
      }
    }
    // console.log(62);

    // Save the updated user
    await user.save();
    // console.log(63);

    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId)
      .populate("shippingAddress")
      .populate("products.product");

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const order = await Order.find({ user: req.userId }).populate(
      "products.product"
    );
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};
