const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validate, updateUserValidation } = require('../middleware/validate');

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, validate(updateUserValidation), updateUserProfile);

module.exports = router;
