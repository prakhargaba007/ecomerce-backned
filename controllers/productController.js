const { validationResult } = require("express-validator");
const Product = require("../models/Product");
const User = require("../models/User");
const Category = require("../models/Category");

exports.createProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    description,
    price,
    stock,
    category,
    gender,
    fabric,
    color,
    size,
    brand,
    images,
    featured,
  } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      gender,
      fabric,
      color,
      size,
      brand,
      images,
      featured,
    });

    await product.save();

    const userId = req.userId;

    const user = await User.findById(userId);
    user.products.push(product);
    await user.save();

    res.status(201).json({ message: "Product created successfully!", product });
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

exports.productCategory = async (req, res, next) => {
  try {
    console.log("hello");
    const category = await Category.find();
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId).populate({
      path: "review",
      populate: {
        path: "user",
        select: "name", // Select only the 'name' field from the user
      },
    });
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  const productId = req.params.productId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    description,
    price,
    stock,
    category,
    gender,
    fabric,
    color,
    size,
    brand,
    images,
    featured,
  } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.category = category;
    product.gender = gender;
    product.fabric = fabric;
    product.color = color;
    product.size = size;
    product.brand = brand;
    product.images = images;
    product.featured = featured;

    await product.save();
    res.status(200).json({ message: "Product updated successfully!", product });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findByIdAndDelete(productId);
    // if (!product) {
    //   const error = new Error("Product not found");
    //   error.statusCode = 404;
    //   throw error;
    // }

    // await product.remove();
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (err) {
    next(err);
  }
};

exports.productCategoryFilter = async (req, res, next) => {
  const catName = req.params.catName;
  // console.log(catName);

  const { price, fabric, gender, size, color, page = 1 } = req.query;
  console.log(req.query);

  let filter = {};
  if (price) filter.price = { $lte: price };
  if (fabric) filter.fabric = fabric;
  if (gender) filter.gender = gender;
  if (size) filter.size = size;
  if (color) filter.color = color;
  console.log(filter);

  try {
    const category = await Category.findOne({ name: catName });
    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }

    // console.log(category);
    // console.log({
    //   ...filter,
    //   category: category._id,
    // });

    const limit = 8;
    const skip = (page - 1) * limit;

    const products = await Product.find({
      ...filter,
      category: category._id,
    })
      .populate("category")
      .limit(limit)
      .skip(skip);

    if (!products || products.length === 0) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

exports.filterProducts = async (req, res, next) => {
  const { price, fabric, gender, size, color } = req.query;

  let filter = {};
  if (price) filter.price = { $lte: price };
  if (fabric) filter.fabric = fabric;
  if (gender) filter.gender = gender;
  if (size) filter.size = size;
  if (color) filter.color = color;

  try {
    const products = await Product.find(filter).populate("category");
    res.status(200).json(products);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
