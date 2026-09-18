const express = require('express');
const router = express.Router();
const familyRecipeController = require('../controllers/familyRecipeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', familyRecipeController.create);
router.get('/', familyRecipeController.list);
router.get('/:id', familyRecipeController.getById);
router.post('/:id/modernize', familyRecipeController.modernize);

module.exports = router;
