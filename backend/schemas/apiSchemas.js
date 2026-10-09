const { z } = require('zod');

exports.registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  confirm_password: z.string().min(8)
});

exports.loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

exports.emailSchema = z.object({
  email: z.string().email()
});

exports.verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});

exports.resetPasswordSchema = z.object({
  resetToken: z.string(),
  new_password: z.string().min(8)
});
