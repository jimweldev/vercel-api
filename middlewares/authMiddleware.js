const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer")) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const accessToken = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    req.user = await User.findById({ _id }).select("-password");

    next();
  } catch (error) {
    return res.status(401).json({ error: "Authorization token expired" });
  }
};

module.exports = authMiddleware;
