const express = require("express");
const { body } = require("express-validator");
const cartController = require("../controllers/cartController");
const isAuth = require("../middlewares/is-auth");

const router = express.Router();

// Add a product to the cart
router.post(
  "/",
  isAuth,
  [
    body("productId").not().isEmpty().withMessage("Product ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  cartController.addToCart
);

// Get the user's cart
router.get("/", isAuth, cartController.getCart);

// Update product quantity in the cart
router.put(
  "/",
  isAuth,
  [
    body("productId").not().isEmpty().withMessage("Product ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  cartController.updateCart
);

// Remove a product from the cart
router.delete("/:productId", isAuth, cartController.removeFromCart);

// Clear the cart
router.delete("/", isAuth, cartController.clearCart);

module.exports = router;
