// const express = require("express");
// const { body } = require("express-validator");

// const User = require("../models/user");
// const authCntroller = require("../controllers/auth");
// const isAuth = require("../middleware/is-auth");

// const router = express.Router();

// router.post(
//   "/signup",
//   [
//     body("email")
//       .isEmail()
//       .withMessage("Please enter a valid email address")
//       .custom((value, { req }) => {
//         return User.findOne({ email: value }).then((userDoc) => {
//           if (userDoc) {
//             return Promise.reject("E-mail address already exists");
//           }
//         });
//       })
//       .normalizeEmail(),
//     body("password")
//       .trim()
//       .notEmpty()
//       .withMessage("Password cannot be empty")
//       .isLength({ min: 6 })
//       .withMessage("Password must be at least  6 characters long"),
//     body("name")
//       .trim()
//       .notEmpty()
//       .withMessage("Name cannot be empty")
//       .isLength({ min: 3 }),
//   ],
//   authCntroller.signup
// );

// router.post("/login", authCntroller.login);

// router.post("/profile", authCntroller.getUser);

// router.put(
//   "/updateUser",
//   [
//     body("name")
//       .trim()
//       .notEmpty()
//       .withMessage("Name cannot be empty")
//       .isLength({ min: 3 }),
//     body("gender").notEmpty(),
//   ],
//   authCntroller.updateUserProfile
// );

// router.put(
//   "/changePassword",
//   [
//     body("password")
//       .trim()
//       .notEmpty()
//       .withMessage("Password cannot be empty")
//       .isLength({ min: 6 })
//       .withMessage("Password must be at least  6 characters long"),
//   ],
//   authCntroller.updateUserPassword
// );

// module.exports = router;
// routes/authRoutes.js
// routes/authRoutes.js
const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const isAuth = require("../middlewares/is-auth");

router.post("/otp", authController.optGenerte);

// Route: POST /api/auth/signup
router.post(
  "/signup",
  [
    // Validate inputs
    body("name")
      .not()
      .isEmpty()
      .trim()
      .escape()
      .withMessage("Name is required"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.signup
);

// Route: POST /api/auth/login
router.post(
  "/login",
  [
    // Validate inputs
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

// Route: POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
  ],
  authController.forgotPassword
);

// Route: POST /api/auth/reset-password
router.put(
  "/reset-password",
  [
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  isAuth,
  authController.resetPassword
);

module.exports = router;
