const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Token = require('../models/Token'); // Import Token model
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwt');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword,
        });

        await user.save();

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to database
        await Token.create({
            userId: user._id,
            refreshToken,
        });

        // Set HTTP-only cookies
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            status: 'success',
            data: { user: { id: user._id, username, email } },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
        }

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to database
        await Token.create({
            userId: user._id,
            refreshToken,
        });

        // Set HTTP-only cookies
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            status: 'success',
            data: { user: { id: user._id, username: user.username, email } },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const logout = async (req, res) => {
    try {
        // Clear refresh tokens from database
        if (req.cookies.refreshToken) {
            await Token.deleteOne({ refreshToken: req.cookies.refreshToken });
        }

        // Clear cookies
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(200).json({ status: 'success', message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ status: 'error', message: 'No refresh token provided' });
        }

        // Verify refresh token
        const decoded = verifyToken(refreshToken);

        // Check if refresh token exists in database
        const storedToken = await Token.findOne({ refreshToken, userId: decoded.id });
        if (!storedToken) {
            return res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
        }

        // Find user
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'User not found' });
        }

        // Generate new access token
        const newToken = generateToken(user._id);

        // Set new access token in cookie
        res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.status(200).json({
            status: 'success',
            data: { user: { id: user._id, username: user.username, email: user.email } },
        });
    } catch (error) {
        res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token' });
    }
};

module.exports = { register, login, logout, refreshToken };
