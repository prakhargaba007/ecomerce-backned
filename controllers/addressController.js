const Address = require("../models/Address");
const User = require("../models/User");
const { validationResult } = require("express-validator");

// Add a new address
exports.addAddress = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    phoneNumber,
    street,
    city,
    state,
    country,
    postalCode,
    isDefault,
  } = req.body;

  try {
    if (isDefault) {
      // Reset any existing default addresses
      await Address.updateMany(
        { user: req.userId, isDefault: true },
        { isDefault: false }
      );
    }

    const address = new Address({
      user: req.userId,
      name,
      phoneNumber,
      street,
      city,
      state,
      country,
      postalCode,
      isDefault,
    });

    await address.save();

    const userId = req.userId;
    const user = await User.findById(userId);
    user.address.push(address);
    await user.save();

    res.status(201).json({ message: "Address added successfully", address });
  } catch (err) {
    next(err);
  }
};

// Get all addresses for the logged-in user
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.userId });
    res.status(200).json(addresses);
  } catch (err) {
    next(err);
  }
};

// Get a specific address by ID
exports.getAddressById = async (req, res, next) => {
  const { addressId } = req.params;

  try {
    const address = await Address.findById(addressId);
    if (!address) {
      const error = new Error("Address not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(address);
  } catch (err) {
    next(err);
  }
};

// Update an address
exports.updateAddress = async (req, res, next) => {
  const { addressId } = req.params;
  const {
    name,
    phoneNumber,
    street,
    city,
    state,
    country,
    postalCode,
    isDefault,
  } = req.body;

  try {
    const address = await Address.findById(addressId);
    if (!address) {
      const error = new Error("Address not found");
      error.statusCode = 404;
      throw error;
    }

    if (isDefault) {
      // Reset any existing default addresses
      await Address.updateMany(
        { user: req.userId, isDefault: true },
        { isDefault: false }
      );
    }

    address.name = name || address.name;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.country = country || address.country;
    address.postalCode = postalCode || address.postalCode;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await address.save();
    res.status(200).json({ message: "Address updated successfully", address });
  } catch (err) {
    next(err);
  }
};

// Delete an address
exports.deleteAddress = async (req, res, next) => {
  const { addressId } = req.params;

  try {
    const address = await Address.findByIdAndDelete(addressId);
    console.log(address);

    const userId = req.userId;
    const user = await User.findById(userId);
    const addressIndex = user.address.indexOf(addressId);

    if (addressIndex > -1) {
      user.address.splice(addressIndex, 1);
      await user.save();
    }

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    next(err);
  }
};
