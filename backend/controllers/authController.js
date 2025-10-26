const bcrypt = require('bcryptjs');
const UserProfileService = require('../services/userProfileService');
const User = require('../models/User');
const { sign } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, sizeProfile, stylePreferences } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserProfileService.createUser({ email, passwordHash, firstName, lastName, sizeProfile, stylePreferences });

    res.status(201).json({ success: true, data: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = sign({ userId: user._id, email: user.email });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
