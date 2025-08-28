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
  const { title, completed, description, isImportant, priority, dueDate } = req.body;

  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, completed, description, isImportant, priority, dueDate },
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
exports.getUpcomingTasks = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 3;
    const now = new Date();
    const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
      user: req.user._id,
      completed: false,
      dueDate: { $gte: now, $lte: end }
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

