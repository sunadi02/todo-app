const Task = require('../models/Task');

// Get all tasks for logged-in user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  const {
    title,
    dueDate,
    description,
    completed,
    isImportant,
    priority,
    steps,
    list
  } = req.body;

  try {
    const task = await Task.create({
      user: req.user._id,
      title,
      dueDate,
      description: description || "",
      completed: completed || false,
      isImportant: isImportant || false,
      priority: priority || "Medium",
      steps: steps || [],
      list: list || null
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Update a task
exports.updateTask = async (req, res) => {
  try {
    const update = {};
    ['title', 'completed', 'description', 'isImportant', 'priority', 'dueDate', 'steps', 'list'].forEach(key => {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    });

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
      { new: true }
    );

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Toggle important
exports.toggleImportant = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.isImportant = !task.isImportant;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get upcoming tasks within next N days (default 3)
// Uses local day boundaries: start of today (00:00) up to end of (today + days) (23:59:59.999)
exports.getUpcomingTasks = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 3;

    // start = today at local 00:00:00
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    // end = (today + days) at local 23:59:59.999
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      user: req.user._id,
      completed: false,
      dueDate: { $gte: start, $lte: end }
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single task by id
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.searchTasks = async (req, res) => {
  try {
    const query = req.query.q;
    const tasks = await Task.find({
      user: req.user._id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};

// Get tasks between a start and end date (inclusive)
exports.getTasksByRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ message: 'start and end query parameters are required' });

    const startDate = new Date(start);
    const endDate = new Date(end);
    // ensure endDate includes the full day when only a date is supplied
    if (endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) {
      endDate.setHours(23, 59, 59, 999);
    }

    const tasks = await Task.find({
      user: req.user._id,
      dueDate: { $gte: startDate, $lte: endDate }
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

