const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Return mapped fields expected by frontend
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar ? `http://localhost:8000/uploads/${user.avatar}` : null,
      isVerified: user.isVerified,
      role: user.role,
      is_superuser: user.is_superuser,
      diet_preference: user.diet_preference,
      generation: user.generation,
      spiceLevel: user.spiceLevel,
      cookingSkill: user.cookingSkill,
      favoriteCuisines: user.favoriteCuisines,
      dislikedIngredients: user.dislikedIngredients,
      allergies: user.allergies,
      budgetPreference: user.budgetPreference
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Explicitly pick allowed fields — role/password/is_superuser cannot be changed via this endpoint
    const { 
      name, diet_preference, generation, spiceLevel, cookingSkill, 
      favoriteCuisines, dislikedIngredients, allergies, budgetPreference 
    } = req.body;

    const parseArray = (val) => {
      if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
      if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
      return [];
    };
    
    if (name !== undefined) user.name = String(name).trim();
    if (diet_preference !== undefined) {
      const normalizedDiet = String(diet_preference || '').toLowerCase().replace(/[-\s]/g, '_');
      const validDiets = ['vegetarian', 'vegan', 'paleo', 'keto', 'gluten_free', 'dairy_free', 'halal', 'low_carb', 'none', ''];
      user.diet_preference = validDiets.includes(normalizedDiet) ? normalizedDiet : 'none';
    }
    if (generation !== undefined) {
      const validGenerations = ['GEN_Z', 'MILLENNIAL', 'GEN_X', 'OLDER_ADULT'];
      user.generation = (generation && validGenerations.includes(generation)) ? generation : null;
    }
    if (spiceLevel !== undefined) user.spiceLevel = spiceLevel;
    if (cookingSkill !== undefined) user.cookingSkill = cookingSkill;
    if (favoriteCuisines !== undefined) user.favoriteCuisines = parseArray(favoriteCuisines);
    if (dislikedIngredients !== undefined) user.dislikedIngredients = parseArray(dislikedIngredients);
    if (allergies !== undefined) user.allergies = parseArray(allergies);
    if (budgetPreference !== undefined) {
      if (budgetPreference === '' || budgetPreference === null || isNaN(Number(budgetPreference))) {
        user.budgetPreference = null;
      } else {
        user.budgetPreference = Number(budgetPreference);
      }
    }

    if (req.file) {
      user.avatar = req.file.filename;
    }

    await user.save();

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar ? `http://localhost:8000/uploads/${user.avatar}` : null,
      isVerified: user.isVerified,
      role: user.role,
      is_superuser: user.is_superuser,
      diet_preference: user.diet_preference,
      generation: user.generation,
      spiceLevel: user.spiceLevel,
      cookingSkill: user.cookingSkill,
      favoriteCuisines: user.favoriteCuisines,
      dislikedIngredients: user.dislikedIngredients,
      allergies: user.allergies,
      budgetPreference: user.budgetPreference
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    
    if (new_password !== confirm_password) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const user = await User.findById(req.user.id);
    
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ current_password: ['Invalid current password.'] }); // Django style error
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
