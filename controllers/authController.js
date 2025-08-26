const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Token = require("../models/Token");
const {
  generateToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwt");
const { ApiError } = require("../utils/errorHandler");
const {
  validateRequiredFields,
  validateEmail,
} = require("../utils/validation");

// Utility function to handle async operations and pass errors to middleware
const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  validateRequiredFields(["username", "email", "password"], req.body);
  validateEmail(email);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "El correo ya está registrado");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  await user.save();

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await Token.create({
    userId: user._id,
    refreshToken,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    status: "success",
    data: { user: { id: user._id, username, email } },
  });
});

// @desc    Log in a user
// @route   POST /api/auth/login
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  validateRequiredFields(["email", "password"], req.body);
  validateEmail(email);

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "El correo no está registrado");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(400, "La contraseña es incorrecta");
  }

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await Token.create({
    userId: user._id,
    refreshToken,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    data: { user: { id: user._id, username: user.username, email } },
  });
});

// @desc    Log out a user
// @route   POST /api/auth/logout
const logout = catchAsync(async (req, res, next) => {
  if (req.cookies.refreshToken) {
    await Token.deleteOne({ refreshToken: req.cookies.refreshToken });
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    status: "success",
    message: "Sesión cerrada correctamente",
  });
});

// @desc    Refresh an access token
// @route   POST /api/auth/refresh-token
const refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "No se proporcionó un refresh token");
  }

  let decoded;
  try {
    decoded = verifyToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, "Refresh token inválido o expirado");
  }

  const storedToken = await Token.findOne({
    refreshToken,
    userId: decoded.id,
  });
  if (!storedToken) {
    throw new ApiError(401, "Refresh token no encontrado");
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  const newToken = generateToken(user._id);

  res.cookie("token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: { id: user._id, username: user.username, email: user.email },
    },
  });
});

// @desc    Get CSRF token
// @route   GET /api/auth/csrf-token
const getCsrfToken = (req, res) => {
  res.json({ "XSRF-TOKEN": req.csrfToken() });
};

module.exports = { register, login, logout, refreshToken, getCsrfToken };
