require('dotenv').config();

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET and JWT_REFRESH_SECRET must be defined in the environment.");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI must be defined in the environment.");
  process.exit(1);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/user', require('./routes/user'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/history', require('./routes/history'));
app.use('/api/pantry', require('./routes/pantry'));
app.use('/api/family-recipes', require('./routes/familyRecipes'));
app.use('/admin', require('./routes/admin'));
app.use('/nutrition', require('./routes/nutrition'));

// Public system settings route
app.get('/api/settings', async (req, res) => {
  try {
    const SystemSetting = require('./models/SystemSetting');
    const [cuisines, dietary, limits] = await Promise.all([
      SystemSetting.findOne({ key: 'supportedCuisines' }),
      SystemSetting.findOne({ key: 'supportedDietaryPreferences' }),
      SystemSetting.findOne({ key: 'recipeGenerationLimits' }),
    ]);
    res.json({
      supportedCuisines: cuisines?.value || ['Desi / South Asian', 'Italian', 'Mexican', 'Mediterranean', 'East Asian', 'Middle Eastern', 'American'],
      supportedDietaryPreferences: dietary?.value || ['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'gluten_free', 'dairy_free', 'halal', 'low_carb'],
      recipeGenerationLimits: limits?.value || { guestLimit: 2, maxCookingTimeMinutes: 180, defaultServings: 2 },
    });
  } catch (e) {
    res.status(500).json({ message: 'Error loading settings' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Connect to MongoDB, then start listening
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_recipe_db';
mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

