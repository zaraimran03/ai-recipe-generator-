const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateInput = require('../middleware/validateInput');
const { registerSchema, loginSchema, emailSchema, verifyOtpSchema, resetPasswordSchema } = require('../schemas/apiSchemas');

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { message: 'Too many attempts, please try again later' }
});

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { message: 'Too many OTP requests, please try again later' }
});

router.post('/register/', authLimiter, validateInput(registerSchema), authController.register);
router.post('/login/', authLimiter, validateInput(loginSchema), authController.login);
router.post('/refresh/', authController.refresh);
router.post('/logout/', authController.logout);
router.post('/check-email/', validateInput(emailSchema), authController.checkEmail);
router.post('/forgot-password/', otpLimiter, validateInput(emailSchema), authController.forgotPassword);
router.post('/verify-reset-otp/', authLimiter, validateInput(verifyOtpSchema), authController.verifyResetOTP);
router.post('/reset-password/', authLimiter, validateInput(resetPasswordSchema), authController.resetPassword);
router.post('/verify-otp/', authLimiter, validateInput(verifyOtpSchema), authController.verifyOTP);
router.post('/resend-otp/', otpLimiter, validateInput(emailSchema), authController.resendOTP);

module.exports = router;
