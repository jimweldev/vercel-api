const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const generateAccessToken = (_id) => {
  return jwt.sign({ _id: _id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Please fill all the required fields" });
  }

  let user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ error: "Incorrect email address" });
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  user = await User.findOne({ email }).select(
    "-password -createdAt -updatedAt -__v"
  );

  if (!isPasswordMatched) {
    return res.status(400).json({ error: "Incorrect password" });
  }

  // generate access token
  const accessToken = generateAccessToken(user._id);

  res.status(200).json({ user, accessToken });
};

// Register
const register = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: "Please fill all the required fields" });
  }

  const isEmailUsed = await User.findOne({ email });

  if (isEmailUsed) {
    return res.status(400).json({ error: "Email already used" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Email is invalid" });
  }

  // prettier-ignore
  if (!validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })) {
    return res.status(400).json({ error: 'Password is not strong enough' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords mismatch" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // try to create
  try {
    let user = await User.create({
      email,
      password: hashedPassword,
    });

    user = await User.findOne({ email }).select(
      "-password -createdAt -updatedAt -__v"
    );

    // generate access token
    const accessToken = generateAccessToken(user._id);

    res.status(201).json({ user, accessToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  res.status(200).json({ message: "Successfully logged out" });
};

module.exports = {
  login,
  register,
  logout,
};
