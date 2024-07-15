// routes/reviews.js
const express = require("express");
const { body } = require("express-validator");
const reviewController = require("../controllers/reviewController");
const isAuth = require("../middlewares/is-auth");
const multer = require("multer");

const router = express.Router();
const upload = multer({ dest: "images/" });

router.post(
  "/",
  isAuth,
  // upload.single("image"),
  [
    body("orderId").not().isEmpty().withMessage("Order ID is required"),
    body("productId").not().isEmpty().withMessage("Product ID is required"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment").not().isEmpty().withMessage("Comment is required"),
  ],
  reviewController.addReview
);

// Other routes remain unchanged
router.get("/order/:orderId", isAuth, reviewController.getReviewsByOrder);
router.get("/product/:productId", reviewController.getReviewsByProduct);
router.put(
  "/:reviewId",
  isAuth,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment").not().isEmpty().withMessage("Comment is required"),
  ],
  reviewController.updateReview
);
router.delete("/:reviewId", isAuth, reviewController.deleteReview);

module.exports = router;
