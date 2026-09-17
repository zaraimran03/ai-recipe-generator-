const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const access = jwt.sign(
    { id: user._id, email: user.email, is_superuser: user.is_superuser },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '15m' }
  );
  const refresh = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: '7d' }
  );
  return { access, refresh };
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirm_password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password || !confirm_password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name || email.split('@')[0],
      email: normalizedEmail,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ detail: 'Invalid credentials' }); // Match DRF format mostly
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const tokens = generateTokens(user);

    res.json({
      access: tokens.access,
      refresh: tokens.refresh,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refresh } = req.body;
    if (!refresh) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    jwt.verify(refresh, process.env.JWT_REFRESH_SECRET || 'refresh_secret', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const tokens = generateTokens(user);
      res.json({ access: tokens.access });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logout = (req, res) => {
  // In a real app we might blacklist the refresh token. For now just return success.
  res.json({ success: true });
};
