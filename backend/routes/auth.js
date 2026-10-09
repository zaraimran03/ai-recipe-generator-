const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register/', authController.register);
router.post('/login/', authController.login);
router.post('/refresh/', authController.refresh);
router.post('/logout/', authController.logout);
router.post('/check-email/', authController.checkEmail);
router.post('/forgot-password/', authController.forgotPassword);
router.post('/verify-reset-otp/', authController.verifyResetOTP);
router.post('/reset-password/', authController.resetPassword);
router.post('/verify-otp/', authController.verifyOTP);
router.post('/resend-otp/', authController.resendOTP);

module.exports = router;
