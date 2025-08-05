const express = require('express');
const { register, login, logout, refreshToken } = require('../controllers/authController');
const { validate, registerValidation, loginValidation } = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiter');
const csrfProtection = require('../middleware/csrfMiddleware');

const router = express.Router();

router.post('/register', csrfProtection, validate(registerValidation), register);
router.post('/login', loginLimiter, csrfProtection, validate(loginValidation), login);
router.post('/logout', csrfProtection, logout);
router.post('/refresh-token', csrfProtection, refreshToken);

module.exports = router;
