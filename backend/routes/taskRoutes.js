const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleImportant,
  getUpcomingTasks,
  getTasksByRange,
  getTaskById,
  searchTasks
} = require('../controllers/taskController');
const protect = require('../middleware/authMiddleware');

// Routes
router.get('/', protect, getTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.patch('/important/:id', protect, toggleImportant);
router.get('/upcoming', protect, getUpcomingTasks);
router.get('/range', protect, getTasksByRange);
router.get('/search', protect, searchTasks);
router.get('/:id', protect, getTaskById);



module.exports = router;
