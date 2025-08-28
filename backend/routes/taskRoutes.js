const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleImportant,
  getUpcomingTasks,
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
router.get('/:id', protect, getTaskById);
router.post('/api/lists', async (req, res) => {
  const { title } = req.body;
  const newList = await List.create({ title }); 
  res.json(newList);
});
router.get('/search', protect, searchTasks);



module.exports = router;
