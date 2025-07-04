const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleImportant
} = require('../controllers/taskController');
const protect = require('../middleware/authMiddleware');

// Routes
router.get('/', protect, getTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.patch('/important/:id', protect, toggleImportant);

module.exports = router;
