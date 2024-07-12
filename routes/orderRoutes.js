const express = require("express");

const router = express.Router();
const orderController = require("../controllers/orderController");
const isAuth = require("../middlewares/is-auth");

router.post("/", isAuth, orderController.createOrder);

router.get("/:orderId", isAuth, orderController.getOrderById);

router.get("/", isAuth, orderController.getOrders);

module.exports = router;
