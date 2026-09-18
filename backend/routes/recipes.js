const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/generate/', recipeController.generate);
router.post('/substitute/', recipeController.substitute);
router.post('/adapt/', recipeController.adapt);
router.get('/recommendations/', recipeController.recommendations);
router.get('/', recipeController.list);
router.get('/:id/', recipeController.getById);
router.post('/:id/interact/', recipeController.interact);
router.delete('/:id/', recipeController.delete);

module.exports = router;
