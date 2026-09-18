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

    const { 
      name, diet_preference, generation, spiceLevel, cookingSkill, 
      favoriteCuisines, dislikedIngredients, allergies, budgetPreference 
    } = req.body;
    
    if (name !== undefined) user.name = name;
    if (diet_preference !== undefined) user.diet_preference = diet_preference;
    if (generation !== undefined) user.generation = generation;
    if (spiceLevel !== undefined) user.spiceLevel = spiceLevel;
    if (cookingSkill !== undefined) user.cookingSkill = cookingSkill;
    if (favoriteCuisines !== undefined) user.favoriteCuisines = favoriteCuisines;
    if (dislikedIngredients !== undefined) user.dislikedIngredients = dislikedIngredients;
    if (allergies !== undefined) user.allergies = allergies;
    if (budgetPreference !== undefined) user.budgetPreference = budgetPreference;

    if (req.file) {
      user.avatar = req.file.filename;
    }

    await user.save();

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar ? `http://localhost:8000/uploads/${user.avatar}` : null,
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
