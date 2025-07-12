const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date
  },
  isImportant: {
  type: Boolean,
  default: false,
  },
  description: String,
  dueDate: Date,
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  steps: [{
  text: String,
  done: Boolean,
}],
list: {
  type: String,
  default: null,
},
// list: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'List',
//   default: null
// }


}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
