const express = require("express");
const { body } = require("express-validator");
const addressController = require("../controllers/addressController");
const isAuth = require("../middlewares/is-auth");

const router = express.Router();

// Add a new address
router.post(
  "/",
  isAuth,
  [
    body("name").not().isEmpty().withMessage("Name is required"),
    body("phoneNumber").not().isEmpty().withMessage("Phone number is required"),
    body("street").not().isEmpty().withMessage("Street is required"),
    body("city").not().isEmpty().withMessage("City is required"),
    body("state").not().isEmpty().withMessage("State is required"),
    body("country").not().isEmpty().withMessage("Country is required"),
    body("postalCode").not().isEmpty().withMessage("Postal Code is required"),
  ],
  addressController.addAddress
);

// Get all addresses for the logged-in user
router.get("/", isAuth, addressController.getAddresses);

// Get a specific address by ID
router.get("/:addressId", isAuth, addressController.getAddressById);

// Update an address
router.put(
  "/:addressId",
  isAuth,
  [
    body("name").optional().not().isEmpty().withMessage("Name is required"),
    body("phoneNumber")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Phone number is required"),
    body("street").optional().not().isEmpty().withMessage("Street is required"),
    body("city").optional().not().isEmpty().withMessage("City is required"),
    body("state").optional().not().isEmpty().withMessage("State is required"),
    body("country")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Country is required"),
    body("postalCode")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Postal Code is required"),
  ],
  addressController.updateAddress
);

// Delete an address
router.delete("/:addressId", isAuth, addressController.deleteAddress);

module.exports = router;
