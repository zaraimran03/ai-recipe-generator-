const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-that-is-long-enough';

const mockAdminUser = {
  _id: 'admin-1',
  id: 'admin-1',
  name: 'Admin Boss',
  email: 'admin@example.com',
  role: 'admin',
  is_superuser: true,
  isVerified: true,
  save: jest.fn().mockResolvedValue(true),
  toObject: function() { return { ...this }; },
};

const mockRegularUser = {
  _id: 'user-1',
  id: 'user-1',
  name: 'Regular Cook',
  email: 'regular@example.com',
  role: 'user',
  is_superuser: false,
  isVerified: true,
  save: jest.fn().mockResolvedValue(true),
  toObject: function() { return { ...this }; },
};

jest.mock('../models/User', () => {
  const User = {
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([
            { _id: 'user-1', id: 'user-1', name: 'Regular User', email: 'user@example.com', role: 'user', isVerified: true, toObject: () => ({ _id: 'user-1', id: 'user-1', name: 'Regular User', email: 'user@example.com', role: 'user', isVerified: true }) }
          ])
        })
      })
    }),
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'admin-1') return Promise.resolve(mockAdminUser);
      if (id === 'user-1') return Promise.resolve(mockRegularUser);
      return Promise.resolve(null);
    }),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn().mockResolvedValue({ _id: 'deleted-1' }),
    countDocuments: jest.fn().mockResolvedValue(5),
  };
  return User;
});

const createMockQuery = (resolveWith = []) => {
  const query = {};
  query.populate = jest.fn().mockReturnValue(query);
  query.select = jest.fn().mockReturnValue(query);
  query.sort = jest.fn().mockReturnValue(query);
  query.limit = jest.fn().mockResolvedValue(resolveWith);
  return query;
};

jest.mock('../models/Recipe', () => ({
  find: jest.fn().mockImplementation(() => createMockQuery([])),
  countDocuments: jest.fn().mockResolvedValue(10),
  aggregate: jest.fn().mockResolvedValue([]),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn().mockResolvedValue({ _id: 'r-1' }),
  deleteMany: jest.fn().mockResolvedValue({}),
}));

jest.mock('../models/Favorite', () => ({
  countDocuments: jest.fn().mockResolvedValue(3),
  deleteMany: jest.fn().mockResolvedValue({}),
}));

jest.mock('../models/History', () => ({
  deleteMany: jest.fn().mockResolvedValue({}),
}));

jest.mock('../models/FamilyRecipe', () => ({
  countDocuments: jest.fn().mockResolvedValue(2),
  find: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([])
      })
    })
  }),
  aggregate: jest.fn().mockResolvedValue([]),
  deleteMany: jest.fn().mockResolvedValue({}),
}));

jest.mock('../models/Pantry', () => ({
  deleteMany: jest.fn().mockResolvedValue({}),
}));

jest.mock('../models/AiLog', () => ({
  countDocuments: jest.fn().mockResolvedValue(15),
  aggregate: jest.fn().mockResolvedValue([{ _id: null, avgDuration: 850, totalTokens: 1200 }]),
  find: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([])
      })
    })
  }),
  create: jest.fn().mockResolvedValue({}),
}));

jest.mock('../models/SystemSetting', () => ({
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockImplementation((d) => Promise.resolve({ ...d, value: d.value })),
  findOneAndUpdate: jest.fn().mockResolvedValue({}),
}));

const adminRoutes = require('../routes/admin');
const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

describe('Admin Security & RBAC Authorization', () => {
  const regularUserToken = jwt.sign(
    { id: 'user-1', email: 'regular@example.com', role: 'user' },
    process.env.JWT_SECRET
  );

  const adminToken = jwt.sign(
    { id: 'admin-1', email: 'admin@example.com', role: 'admin' },
    process.env.JWT_SECRET
  );

  test('GET /admin/stats/ — rejects unauthenticated requests', async () => {
    const res = await request(app).get('/admin/stats/');
    expect(res.status).toBe(401);
  });

  test('GET /admin/stats/ — rejects regular user (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/admin/stats/')
      .set('Authorization', `Bearer ${regularUserToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Admin access required');
  });

  test('GET /admin/stats/ — allows admin user', async () => {
    const res = await request(app)
      .get('/admin/stats/')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.total_users).toBe(5);
    expect(res.body.total_recipes).toBe(10);
  });

  test('GET /admin/ai-usage/ — returns AI telemetry to admin without API keys', async () => {
    const res = await request(app)
      .get('/admin/ai-usage/')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(JSON.stringify(res.body)).not.toContain('gsk_');
  });

  test('PATCH /admin/users/:id/ — prevents admin from demoting self', async () => {
    const res = await request(app)
      .patch('/admin/users/admin-1/')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'user' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('cannot remove your own admin');
  });
});
