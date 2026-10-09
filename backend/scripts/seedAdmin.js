/**
 * One-time admin seed script.
 * Run with: node backend/scripts/seedAdmin.js
 *
 * You can override credentials via env vars:
 *   ADMIN_EMAIL=myadmin@example.com ADMIN_PASSWORD=MyStr0ngPass! node backend/scripts/seedAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@recipegenerator.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass@123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_recipe_db');
    console.log('✅ MongoDB connected');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
      } else {
        existing.role = 'admin';
        existing.is_superuser = true;
        existing.isVerified = true;
        await existing.save();
        console.log(`✅ Upgraded existing user to admin: ${ADMIN_EMAIL}`);
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        is_superuser: true,
        isVerified: true,
      });
      console.log(`✅ Admin created: ${ADMIN_EMAIL}`);
    }

    console.log('\n🔐 Admin Credentials:');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n⚠️  Change the default password immediately after first login.\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
