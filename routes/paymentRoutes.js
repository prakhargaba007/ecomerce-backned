const express = require("express");

const router = express.Router();
const paymentController = require("../controllers/paymentController");
const isAuth = require("../middlewares/is-auth");

router.post("/order", isAuth, paymentController.createPayment);

router.post("/verify", isAuth, paymentController.verifyPayment);

module.exports = router;
