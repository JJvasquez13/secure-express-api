const User = require('../models/User');

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        // Update fields
        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();

        res.status(200).json({
            status: 'success',
            data: { user: { id: user._id, username: user.username, email: user.email } },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

module.exports = { getUserProfile, updateUserProfile };
