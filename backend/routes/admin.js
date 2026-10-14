const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const History = require('../models/History');
const Favorite = require('../models/Favorite');
const FamilyRecipe = require('../models/FamilyRecipe');
const Pantry = require('../models/Pantry');
const AiLog = require('../models/AiLog');
const SystemSetting = require('../models/SystemSetting');

// Default system configuration constants
const DEFAULT_SYSTEM_SETTINGS = {
  supportedCuisines: [
    'Desi / South Asian',
    'Italian',
    'Mexican',
    'Mediterranean',
    'East Asian',
    'Middle Eastern',
    'American',
    'French',
    'Thai',
    'Continental',
  ],
  supportedDietaryPreferences: [
    'none',
    'vegetarian',
    'vegan',
    'keto',
    'paleo',
    'gluten_free',
    'dairy_free',
    'halal',
    'low_carb',
  ],
  recipeGenerationLimits: {
    guestLimit: 2,
    maxDailyPerUser: 50,
    maxCookingTimeMinutes: 180,
    defaultServings: 2,
  },
  aiSettings: {
    model: 'openai/gpt-oss-120b',
    maxTokens: 2500,
    temperature: 0.2,
  },
};

// Helper: load or initialize a system setting
const getOrInitSetting = async (key, defaultValue, category = 'general', description = '') => {
  let setting = await SystemSetting.findOne({ key });
  if (!setting) {
    setting = await SystemSetting.create({
      key,
      value: defaultValue,
      category,
      description,
    });
  }
  return setting.value;
};

// Admin middleware check — role OR is_superuser
const adminMiddleware = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && !req.user.is_superuser)) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

router.use(authMiddleware);
router.use(adminMiddleware);

// ─────────────────────────────────────────────────────────────
// 1. DASHBOARD OVERVIEW & RECENT ACTIVITY
// ─────────────────────────────────────────────────────────────
router.get('/stats/', async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      adminUsers,
      totalRecipes,
      flaggedRecipes,
      totalFavorites,
      totalFamilyRecipes,
      aiLogsCount,
      aiSuccessCount,
      aiLogsLatency,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ $or: [{ role: 'admin' }, { is_superuser: true }] }),
      Recipe.countDocuments(),
      Recipe.countDocuments({ $or: [{ status: 'flagged' }, { isReported: true }] }),
      Favorite.countDocuments(),
      FamilyRecipe.countDocuments(),
      AiLog.countDocuments(),
      AiLog.countDocuments({ status: 'success' }),
      AiLog.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, avgDuration: { $avg: '$durationMs' }, totalTokens: { $sum: '$totalTokens' } } },
      ]),
    ]);

    // Calculate AI telemetry with fallback to recipe count baseline if logs are fresh
    const effectiveAiTotal = aiLogsCount > 0 ? aiLogsCount : totalRecipes;
    const effectiveAiSuccess = aiLogsCount > 0 ? aiSuccessCount : totalRecipes;
    const successRate = effectiveAiTotal > 0
      ? Math.round((effectiveAiSuccess / effectiveAiTotal) * 100)
      : 100;

    const avgLatency = aiLogsLatency[0]?.avgDuration
      ? Math.round(aiLogsLatency[0].avgDuration)
      : 1200;

    const totalTokens = aiLogsLatency[0]?.totalTokens || 0;

    // Fetch real recent activity from database
    const [recentUsers, recentRecipes, recentAiLogs, recentFamily] = await Promise.all([
      User.find().select('name email role isVerified createdAt').sort({ createdAt: -1 }).limit(5),
      Recipe.find().populate('user', 'name email').select('title metadata createdAt status').sort({ createdAt: -1 }).limit(5),
      AiLog.find().select('operation model status durationMs createdAt error').sort({ createdAt: -1 }).limit(5),
      FamilyRecipe.find().select('createdAt aiAdaptations').sort({ createdAt: -1 }).limit(5),
    ]);

    const activityTimeline = [];

    recentUsers.forEach(u => {
      activityTimeline.push({
        id: `user-${u._id}`,
        type: 'user_registered',
        title: `New User: ${u.name || u.email.split('@')[0]}`,
        subtitle: `${u.email} (${u.role === 'admin' ? 'Admin' : 'Member'})`,
        status: u.isVerified ? 'verified' : 'pending',
        timestamp: u.createdAt,
        icon: 'person_add',
        color: 'text-primary',
      });
    });

    recentRecipes.forEach(r => {
      activityTimeline.push({
        id: `recipe-${r._id}`,
        type: 'recipe_generated',
        title: `Recipe Created: ${r.title}`,
        subtitle: `By ${r.user?.name || r.user?.email || 'Guest/User'} • ${r.metadata?.cuisine || 'Cuisine'}`,
        status: r.status,
        timestamp: r.createdAt,
        icon: 'restaurant',
        color: 'text-secondary',
      });
    });

    recentFamily.forEach(f => {
      activityTimeline.push({
        id: `family-${f._id}`,
        type: 'family_vault',
        title: 'Family Recipe Preserved',
        subtitle: `Vault entry converted (${f.aiAdaptations?.length || 0} modern variants)`,
        status: 'private',
        timestamp: f.createdAt,
        icon: 'menu_book',
        color: 'text-tertiary',
      });
    });

    recentAiLogs.filter(log => log.status === 'error').forEach(l => {
      activityTimeline.push({
        id: `ai-err-${l._id}`,
        type: 'ai_incident',
        title: `AI Incident: ${l.operation.toUpperCase()}`,
        subtitle: l.error || 'Failed response',
        status: 'error',
        timestamp: l.createdAt,
        icon: 'warning',
        color: 'text-error',
      });
    });

    activityTimeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      total_users: totalUsers,
      verified_users: verifiedUsers,
      admin_users: adminUsers,
      total_recipes: totalRecipes,
      flagged_recipes: flaggedRecipes,
      total_favorites: totalFavorites,
      total_family_recipes: totalFamilyRecipes,
      ai_stats: {
        total_requests: effectiveAiTotal,
        success_requests: effectiveAiSuccess,
        failed_requests: effectiveAiTotal - effectiveAiSuccess,
        success_rate: successRate,
        avg_latency_ms: avgLatency,
        total_tokens: totalTokens,
      },
      recent_activity: activityTimeline.slice(0, 10),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 2. USER MANAGEMENT
// ─────────────────────────────────────────────────────────────
router.get('/users/', async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { email: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') },
      ];
    }

    if (role && role !== 'all') {
      if (role === 'admin') {
        query.$or = [{ role: 'admin' }, { is_superuser: true }];
      } else {
        query.role = 'user';
        query.is_superuser = { $ne: true };
      }
    }

    if (status && status !== 'all') {
      query.isVerified = status === 'verified';
    }

    const users = await User.find(query)
      .select('-password -otp -otpExpires -refreshTokens -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    // Count recipes generated by each user in parallel
    const userIds = users.map(u => u._id);
    const recipeCounts = await Recipe.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    recipeCounts.forEach(rc => { countMap[String(rc._id)] = rc.count; });

    const results = users.map(u => ({
      ...u.toObject(),
      id: u._id,
      recipeCount: countMap[String(u._id)] || 0,
    }));

    res.json({ results, total: results.length });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/users/:id/', async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = String(req.user.id || req.user._id);

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const { role, isVerified, name, email } = req.body;

    // Security Guard: Prevent an admin from demoting or disabling themselves
    if (String(targetUserId) === currentUserId) {
      if (role !== undefined && role !== 'admin') {
        return res.status(400).json({ message: 'You cannot remove your own admin privileges.' });
      }
      if (isVerified !== undefined && isVerified === false) {
        return res.status(400).json({ message: 'You cannot un-verify your own admin account.' });
      }
    }

    if (name !== undefined) targetUser.name = String(name).trim();
    if (email !== undefined) targetUser.email = String(email).trim().toLowerCase();
    if (isVerified !== undefined) targetUser.isVerified = Boolean(isVerified);

    if (role !== undefined && (role === 'admin' || role === 'user')) {
      targetUser.role = role;
      if (role === 'admin') targetUser.is_superuser = true;
      else targetUser.is_superuser = false;
    }

    await targetUser.save();

    const sanitized = targetUser.toObject();
    delete sanitized.password;
    delete sanitized.otp;
    delete sanitized.refreshTokens;

    res.json({ ...sanitized, id: targetUser._id });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/users/:id/', async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = String(req.user.id || req.user._id);

    if (String(targetUserId) === currentUserId) {
      return res.status(400).json({ message: 'You cannot delete your own active admin account.' });
    }

    const user = await User.findByIdAndDelete(targetUserId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Clean up related data
    await Promise.all([
      Recipe.deleteMany({ user: targetUserId }),
      Favorite.deleteMany({ user: targetUserId }),
      History.deleteMany({ user: targetUserId }),
      FamilyRecipe.deleteMany({ userId: targetUserId }),
      Pantry.deleteMany({ user: targetUserId }),
    ]);

    res.status(200).json({ success: true, message: 'User and associated data removed.' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 3. RECIPE MANAGEMENT & CONTENT MODERATION
// ─────────────────────────────────────────────────────────────
router.get('/recipes/', async (req, res) => {
  try {
    const { search, user_id, status, cuisine } = req.query;
    let query = {};

    if (search) {
      query.title = new RegExp(search, 'i');
    }

    if (user_id) {
      query.user = user_id;
    }

    if (status && status !== 'all') {
      if (status === 'flagged') {
        query.$or = [{ status: 'flagged' }, { isReported: true }];
      } else {
        query.status = status;
      }
    }

    if (cuisine && cuisine !== 'all') {
      query.$or = [
        { 'metadata.cuisine': new RegExp(cuisine, 'i') },
        { cuisine: new RegExp(cuisine, 'i') },
      ];
    }

    const recipes = await Recipe.find(query)
      .populate('user', 'email name role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    const results = recipes.map(r => ({
      ...r.toObject(),
      id: r._id,
    }));

    res.json({ results, total: results.length });
  } catch (error) {
    console.error('Admin recipes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Recipe statistics & privacy-guaranteed family metrics
router.get('/recipes/stats/', async (req, res) => {
  try {
    const [
      totalRecipes,
      activeRecipes,
      flaggedRecipes,
      hiddenRecipes,
      topCuisines,
      avgCaloriesResult,
      totalFamilyVaults,
      familyModernizations,
    ] = await Promise.all([
      Recipe.countDocuments(),
      Recipe.countDocuments({ status: 'active' }),
      Recipe.countDocuments({ $or: [{ status: 'flagged' }, { isReported: true }] }),
      Recipe.countDocuments({ status: 'hidden' }),
      Recipe.aggregate([
        { $match: { 'metadata.cuisine': { $exists: true, $ne: '' } } },
        { $group: { _id: '$metadata.cuisine', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Recipe.aggregate([
        { $match: { 'nutrition.calories': { $gt: 0 } } },
        { $group: { _id: null, avgCal: { $avg: '$nutrition.calories' } } },
      ]),
      FamilyRecipe.countDocuments(),
      FamilyRecipe.aggregate([
        { $unwind: '$aiAdaptations' },
        { $count: 'total' },
      ]),
    ]);

    res.json({
      total_recipes: totalRecipes,
      active_recipes: activeRecipes,
      flagged_recipes: flaggedRecipes,
      hidden_recipes: hiddenRecipes,
      top_cuisines: topCuisines.map(c => ({ cuisine: c._id, count: c.count })),
      avg_calories: avgCaloriesResult[0]?.avgCal ? Math.round(avgCaloriesResult[0].avgCal) : 0,
      family_recipes_stats: {
        total_vaults: totalFamilyVaults,
        total_modernizations: familyModernizations[0]?.total || 0,
        privacy_note: 'Family recipes are private user heirlooms. Raw heirloom text is shielded from public/moderator inspection.',
      },
    });
  } catch (error) {
    console.error('Admin recipe stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update recipe status (active, flagged, hidden, reportReason)
router.patch('/recipes/:id/status/', async (req, res) => {
  try {
    const { status, isReported, reportReason } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    if (status && ['active', 'flagged', 'hidden'].includes(status)) {
      recipe.status = status;
    }
    if (isReported !== undefined) {
      recipe.isReported = Boolean(isReported);
      if (recipe.isReported) recipe.reportedAt = new Date();
      else recipe.reportedAt = null;
    }
    if (reportReason !== undefined) {
      recipe.reportReason = String(reportReason);
    }

    recipe.reviewedBy = req.user.id;
    await recipe.save();

    res.json({ ...recipe.toObject(), id: recipe._id });
  } catch (error) {
    console.error('Admin update recipe status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/recipes/:id/', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    await Promise.all([
      Favorite.deleteMany({ recipe: req.params.id }),
      History.deleteMany({ recipe: req.params.id }),
    ]);

    res.status(200).json({ success: true, message: 'Recipe removed successfully' });
  } catch (error) {
    console.error('Admin delete recipe error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 4. AI USAGE MONITORING (TELEMETRY WITHOUT API KEYS)
// ─────────────────────────────────────────────────────────────
router.get('/ai-usage/', async (req, res) => {
  try {
    const [totalRequests, successRequests, errorRequests, operationStats, recentLogs] = await Promise.all([
      AiLog.countDocuments(),
      AiLog.countDocuments({ status: 'success' }),
      AiLog.countDocuments({ status: 'error' }),
      AiLog.aggregate([
        {
          $group: {
            _id: '$operation',
            count: { $sum: 1 },
            avgDuration: { $avg: '$durationMs' },
            successCount: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          },
        },
      ]),
      AiLog.find()
        .select('operation model status durationMs promptTokens completionTokens totalTokens error createdAt')
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    // If no logs yet in fresh database, provide baseline from generated recipes
    const totalRecipesCount = await Recipe.countDocuments();
    const effectiveTotal = totalRequests > 0 ? totalRequests : totalRecipesCount;
    const effectiveSuccess = totalRequests > 0 ? successRequests : totalRecipesCount;
    const successRate = effectiveTotal > 0
      ? Math.round((effectiveSuccess / effectiveTotal) * 100)
      : 100;

    res.json({
      summary: {
        total_requests: effectiveTotal,
        success_requests: effectiveSuccess,
        error_requests: totalRequests > 0 ? errorRequests : 0,
        success_rate: successRate,
        active_model: 'openai/gpt-oss-120b',
      },
      operations: operationStats.map(op => ({
        operation: op._id,
        count: op.count,
        avgDurationMs: Math.round(op.avgDuration || 0),
        successRate: op.count > 0 ? Math.round((op.successCount / op.count) * 100) : 100,
      })),
      recent_logs: recentLogs.map(l => ({
        id: l._id,
        operation: l.operation,
        model: l.model,
        status: l.status,
        durationMs: l.durationMs,
        tokens: l.totalTokens || 0,
        error: l.error,
        createdAt: l.createdAt,
      })),
    });
  } catch (error) {
    console.error('Admin AI usage error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 5. SYSTEM SETTINGS
// ─────────────────────────────────────────────────────────────
router.get('/settings/', async (req, res) => {
  try {
    const [cuisines, dietary, limits, aiSettings] = await Promise.all([
      getOrInitSetting('supportedCuisines', DEFAULT_SYSTEM_SETTINGS.supportedCuisines, 'cuisines', 'Supported cuisine genres for recipe generation'),
      getOrInitSetting('supportedDietaryPreferences', DEFAULT_SYSTEM_SETTINGS.supportedDietaryPreferences, 'dietary', 'Supported dietary constraints'),
      getOrInitSetting('recipeGenerationLimits', DEFAULT_SYSTEM_SETTINGS.recipeGenerationLimits, 'limits', 'Usage limits and recipe parameters'),
      getOrInitSetting('aiSettings', DEFAULT_SYSTEM_SETTINGS.aiSettings, 'ai', 'Active AI model configuration'),
    ]);

    res.json({
      supportedCuisines: cuisines,
      supportedDietaryPreferences: dietary,
      recipeGenerationLimits: limits,
      aiSettings,
    });
  } catch (error) {
    console.error('Admin get settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/settings/', async (req, res) => {
  try {
    const { supportedCuisines, supportedDietaryPreferences, recipeGenerationLimits, aiSettings } = req.body;
    const userId = req.user.id;

    if (Array.isArray(supportedCuisines)) {
      await SystemSetting.findOneAndUpdate(
        { key: 'supportedCuisines' },
        { value: supportedCuisines.map(s => String(s).trim()).filter(Boolean), updatedBy: userId },
        { upsert: true, new: true }
      );
    }

    if (Array.isArray(supportedDietaryPreferences)) {
      await SystemSetting.findOneAndUpdate(
        { key: 'supportedDietaryPreferences' },
        { value: supportedDietaryPreferences.map(s => String(s).trim()).filter(Boolean), updatedBy: userId },
        { upsert: true, new: true }
      );
    }

    if (recipeGenerationLimits && typeof recipeGenerationLimits === 'object') {
      await SystemSetting.findOneAndUpdate(
        { key: 'recipeGenerationLimits' },
        { value: recipeGenerationLimits, updatedBy: userId },
        { upsert: true, new: true }
      );
    }

    if (aiSettings && typeof aiSettings === 'object') {
      await SystemSetting.findOneAndUpdate(
        { key: 'aiSettings' },
        { value: aiSettings, updatedBy: userId },
        { upsert: true, new: true }
      );
    }

    const updated = {
      supportedCuisines: await getOrInitSetting('supportedCuisines', DEFAULT_SYSTEM_SETTINGS.supportedCuisines),
      supportedDietaryPreferences: await getOrInitSetting('supportedDietaryPreferences', DEFAULT_SYSTEM_SETTINGS.supportedDietaryPreferences),
      recipeGenerationLimits: await getOrInitSetting('recipeGenerationLimits', DEFAULT_SYSTEM_SETTINGS.recipeGenerationLimits),
      aiSettings: await getOrInitSetting('aiSettings', DEFAULT_SYSTEM_SETTINGS.aiSettings),
    };

    res.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Admin update settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/settings/reset/', async (req, res) => {
  try {
    await Promise.all([
      SystemSetting.findOneAndUpdate({ key: 'supportedCuisines' }, { value: DEFAULT_SYSTEM_SETTINGS.supportedCuisines, updatedBy: req.user.id }, { upsert: true }),
      SystemSetting.findOneAndUpdate({ key: 'supportedDietaryPreferences' }, { value: DEFAULT_SYSTEM_SETTINGS.supportedDietaryPreferences, updatedBy: req.user.id }, { upsert: true }),
      SystemSetting.findOneAndUpdate({ key: 'recipeGenerationLimits' }, { value: DEFAULT_SYSTEM_SETTINGS.recipeGenerationLimits, updatedBy: req.user.id }, { upsert: true }),
      SystemSetting.findOneAndUpdate({ key: 'aiSettings' }, { value: DEFAULT_SYSTEM_SETTINGS.aiSettings, updatedBy: req.user.id }, { upsert: true }),
    ]);

    res.json({ success: true, settings: DEFAULT_SYSTEM_SETTINGS });
  } catch (error) {
    console.error('Admin reset settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
