const List = require('../models/List');

// Get all lists for a user
exports.getLists = async (req, res) => {
  try {
    const lists = await List.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new list
exports.createList = async (req, res) => {
  const { title } = req.body;
  try {
    const newList = await List.create({ title, user: req.user._id });
    res.status(201).json(newList);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a list
exports.updateList = async (req, res) => {
  try {
    const updatedList = await List.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title: req.body.title },
      { new: true }
    );
    if (!updatedList) return res.status(404).json({ message: 'List not found' });
    res.json(updatedList);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a list
exports.deleteList = async (req, res) => {
  try {
    const deletedList = await List.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!deletedList) return res.status(404).json({ message: 'List not found' });
    res.json({ message: 'List deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
