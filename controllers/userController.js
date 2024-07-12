// controllers/userController.js
const User = require("../models/User"); // Assuming you have a User model

// Function to get user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    // Fetch user details using req.userId
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    // Return user data
    res.json(user);
  } catch (err) {
    next(err); // Pass error to error handling middleware
  }
};

// Function to update user profile
exports.updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;

  try {
    // Fetch user by userId
    let user = await User.findById(req.userId);
    console.log(user);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Update user details
    user.name = name || user.name; // Update only if provided
    user.email = email || user.email; // Update only if provided

    // Save updated user data
    user = await user.save();

    // Return updated user data
    res.status(201).json(user);
  } catch (err) {
    next(err); // Pass error to error handling middleware
  }
};
