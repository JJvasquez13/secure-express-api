const User = require("../models/User");
const { ApiError } = require("../utils/errorHandler");

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        user: { id: user._id, username: user.username, email: user.email },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, updateUserProfile };
