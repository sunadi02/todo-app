const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, listController.getLists);
router.post('/', auth, listController.createList);
router.put('/:id', auth, listController.updateList);
router.delete('/:id', auth, listController.deleteList);

module.exports = router;
