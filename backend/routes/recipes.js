const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/generate/', recipeController.generate);
router.get('/', recipeController.list);
router.get('/:id/', recipeController.getById);
router.delete('/:id/', recipeController.delete);

module.exports = router;
