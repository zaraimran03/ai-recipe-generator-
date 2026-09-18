const express = require('express');
const router = express.Router();
const pantryController = require('../controllers/pantryController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', pantryController.get);
router.post('/', pantryController.add);
router.delete('/:itemId/', pantryController.remove);
router.delete('/', pantryController.clear);

module.exports = router;
