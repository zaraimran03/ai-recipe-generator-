const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email');
const crypto = require('crypto');

const generateTokens = (user) => {
  const access = jwt.sign(
    { id: user._id, email: user.email, role: user.role, is_superuser: user.is_superuser },
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
    
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60000); // 5 minutes

    const user = new User({
      name: name || email.split('@')[0],
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      role: 'user',
      otp: otp,
      otpExpires: otpExpires,
      otpAttempts: 0,
      otpLastSent: new Date()
    });

    await user.save();
    
    // Send OTP via EmailJS
    await emailService.sendOTPEmail(user.email, otp);

    res.status(201).json({ message: 'User registered successfully. Please verify your email.', email: user.email });
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

    if (!user.isVerified) {
      // Generate/send a new OTP if cooldown allows (1 minute)
      if (!user.otpLastSent || new Date() - user.otpLastSent > 60000) {
        const newOtp = crypto.randomInt(100000, 1000000).toString();
        user.otp = newOtp;
        user.otpExpires = new Date(Date.now() + 5 * 60000); // 5 minutes
        user.otpAttempts = 0;
        user.otpLastSent = new Date();
        await user.save();
        await emailService.sendOTPEmail(user.email, newOtp);
      }
      return res.status(403).json({ detail: 'Please verify your email first. A new OTP has been sent if allowed.', isVerified: false, email: user.email });
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

// crypto imported at the top

exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }
    res.status(200).json({ message: 'Email exists' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // 1-minute cooldown to prevent spam
    if (user.otpLastSent && new Date() - user.otpLastSent < 60000) {
      return res.status(429).json({ message: 'Please wait before requesting another reset code.' });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60000; // 5 mins
    user.otpAttempts = 0;
    user.otpLastSent = new Date();
    await user.save();

    await emailService.sendPasswordResetOTPEmail(user.email, otp);
    
    res.status(200).json({ message: 'Password reset OTP sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({ message: 'Maximum OTP attempts reached.' });
    }

    if (!user.otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60000;
    // Invalidate OTP immediately so it cannot be re-used
    user.otp = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save();

    res.status(200).json({ message: 'OTP verified.', resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, new_password } = req.body;

    if (!new_password || new_password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const user = await User.findOne({ resetPasswordToken: resetToken, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    user.otp = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({ message: 'Maximum OTP attempts reached. Please request a new one.' });
    }

    if (!user.otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Success
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Cooldown check (1 minute)
    if (user.otpLastSent && new Date() - user.otpLastSent < 60000) {
      return res.status(429).json({ message: 'Please wait before requesting a new OTP' });
    }

    const newOtp = crypto.randomInt(100000, 1000000).toString();
    user.otp = newOtp;
    user.otpExpires = new Date(Date.now() + 5 * 60000); // 5 minutes
    user.otpAttempts = 0;
    user.otpLastSent = new Date();
    await user.save();

    await emailService.sendOTPEmail(user.email, newOtp);

    res.json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
