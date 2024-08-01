const Payment = require("../models/Payment");
const User = require("../models/User");

const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

exports.createPayment = async (req, res) => {
  const { amount } = req.body;

  try {
    // Validate and convert amount to integer
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Invalid amount provided" });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Something Went Wrong!" });
      }
      res.status(200).json({ data: order });
      // console.log(order);
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
};

exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    address,
    token,
  } = req.body;

  console.log("req.body", req.body.token);

  try {
    // Create Sign
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    // Create ExpectedSign
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    // console.log(razorpay_signature === expectedSign);

    // Create isAuthentic
    const isAuthentic = expectedSign === razorpay_signature;

    // Condition
    if (isAuthentic) {
      const payment = new Payment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      // Save Payment
      await payment.save();
      console.log(payment._id, address._id);
      const order = await confirmOrder(payment._id, address._id, token);

      // Send Message
      res.status(201).json({
        message: "Payement Successfully",
        payment,
        order,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
};

const confirmOrder = async (paymentId, addressId, token) => {
  if (!addressId) return;

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shippingAddressId: addressId,
        payment: paymentId,
      }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error confirming order:", error);
    // toast.error("Error confirming order");
  }
};
