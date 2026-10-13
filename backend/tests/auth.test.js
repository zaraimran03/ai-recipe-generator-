const request = require('supertest');
const express = require('express');

// ── Build a minimal Express app that uses the real auth routes ──────────────
// We DO NOT mock the controller so that validateInput actually runs.
// But we mock the models so we don't need a live database.

jest.mock('../models/User', () => {
  const mockUser = {
    findOne: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
    countDocuments: jest.fn().mockResolvedValue(0),
  };
  // Constructor for `new User({...})`
  const UserConstructor = jest.fn().mockImplementation((data) => ({
    ...data,
    _id: 'mock-id-123',
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnValue({ ...data, _id: 'mock-id-123' }),
  }));
  Object.assign(UserConstructor, mockUser);
  return UserConstructor;
});

// Set required env vars BEFORE importing anything that reads them
process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-that-is-long-enough';

const authRoutes = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// ── 1. Input Validation Tests ───────────────────────────────────────────────

describe('Input Validation', () => {
  test('POST /auth/register/ — rejects missing fields', async () => {
    const res = await request(app).post('/auth/register/').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  test('POST /auth/register/ — rejects invalid email', async () => {
    const res = await request(app).post('/auth/register/').send({
      email: 'not-an-email',
      password: 'longenough1',
      confirm_password: 'longenough1',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.some(e => e.includes('email'))).toBe(true);
  });

  test('POST /auth/register/ — rejects short password', async () => {
    const res = await request(app).post('/auth/register/').send({
      email: 'user@example.com',
      password: 'short',
      confirm_password: 'short',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.some(e => e.includes('password'))).toBe(true);
  });

  test('POST /auth/login — rejects empty body', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  test('POST /auth/verify-otp/ — rejects OTP that is not 6 digits', async () => {
    const res = await request(app).post('/auth/verify-otp/').send({
      email: 'user@example.com',
      otp: '123', // too short
    });
    expect(res.status).toBe(400);
  });

  test('POST /auth/verify-otp/ — rejects missing email', async () => {
    const res = await request(app).post('/auth/verify-otp/').send({
      otp: '123456',
    });
    expect(res.status).toBe(400);
  });

  test('POST /auth/reset-password/ — rejects short new_password', async () => {
    const res = await request(app).post('/auth/reset-password/').send({
      resetToken: 'some-token',
      new_password: 'short',
    });
    expect(res.status).toBe(400);
  });

  test('POST /auth/forgot-password/ — rejects missing email', async () => {
    const res = await request(app).post('/auth/forgot-password/').send({});
    expect(res.status).toBe(400);
  });
});

// ── 2. Authentication Security Tests ────────────────────────────────────────

describe('Authentication Security', () => {
  test('POST /auth/refresh/ — rejects missing token', async () => {
    const res = await request(app).post('/auth/refresh/').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Refresh token is required');
  });

  test('POST /auth/refresh/ — rejects garbage token', async () => {
    const res = await request(app).post('/auth/refresh/').send({
      refresh: 'this-is-not-a-valid-jwt',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid refresh token');
  });
});

// ── 3. Safe error responses (no internal leaks) ────────────────────────────

describe('Safe error responses', () => {
  test('Validation errors never expose stack traces', async () => {
    const res = await request(app).post('/auth/register/').send({ garbage: true });
    expect(res.body.stack).toBeUndefined();
    expect(res.body.error).toBeUndefined();
    expect(res.body.message).toBeDefined();
  });
});
