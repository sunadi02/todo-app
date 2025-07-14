const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});
router.delete('/me', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: 'Account deactivated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
module.exports = router;
