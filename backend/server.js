require('dotenv').config();
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
app.use('/admin', require('./routes/admin'));
app.use('/nutrition', require('./routes/nutrition'));

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
