const express = require("express");
const { body } = require("express-validator");

const productController = require("../controllers/productController");
const isAuth = require("../middlewares/is-auth");

const router = express.Router();

// Filter products
router.get("/filter", productController.filterProducts);


router.get("/category", productController.productCategory);
router.get("/category/:catName", productController.productCategoryFilter);


// Create a new product
router.post(
  "/",
  isAuth,
  [
    body("name").not().isEmpty().withMessage("Name is required"),
    body("description").not().isEmpty().withMessage("Description is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
    body("stock").isInt({ gt: 0 }).withMessage("Stock must be greater than 0"),
    body("category").not().isEmpty().withMessage("Category is required"),
  ],
  productController.createProduct
);

// Get all products
router.get("/", productController.getProducts);

// Get a single product by ID
router.get("/:productId", productController.getProductById);

// Update a product
router.put(
  "/:productId",
  isAuth,
  [
    body("name").not().isEmpty().withMessage("Name is required"),
    body("description").not().isEmpty().withMessage("Description is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
    body("stock").isInt({ gt: 0 }).withMessage("Stock must be greater than 0"),
    body("category").not().isEmpty().withMessage("Category is required"),
  ],
  productController.updateProduct
);

// Delete a product
router.delete("/:productId", isAuth, productController.deleteProduct);

module.exports = router;
