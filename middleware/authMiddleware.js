const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ status: "error", message: "Not authorized, token invalid" });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ status: "error", message: "Access denied" });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
