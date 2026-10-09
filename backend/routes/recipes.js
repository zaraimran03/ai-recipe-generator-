const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/auth');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && token !== 'null' && token !== 'undefined') {
      return authMiddleware(req, res, next);
    }
  }
  req.user = null;
  next();
};

router.post('/generate/', optionalAuth, recipeController.generate);
router.post('/substitute/', optionalAuth, recipeController.substitute);
router.post('/adapt/', authMiddleware, recipeController.adapt);
router.get('/recommendations/', authMiddleware, recipeController.recommendations);
router.get('/', authMiddleware, recipeController.list);
router.get('/:id/', authMiddleware, recipeController.getById);
router.post('/:id/interact/', authMiddleware, recipeController.interact);
router.delete('/:id/', authMiddleware, recipeController.delete);

module.exports = router;
