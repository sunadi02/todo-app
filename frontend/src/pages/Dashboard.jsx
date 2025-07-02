import React, { useEffect, useState, useCallback } from "react";
import {
  ListTodo,
  Star,
  Check,
  Plus,
  LogOut,
  Trash2,
} from "lucide-react";
import API from "../api";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  // const [editText, setEditText] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);


  const fetchTasks = useCallback(async () => {
  try {
    const res = await API.get('/api/tasks');
    let all = res.data;

    if (filter === "important") {
      all = all.filter((task) => task.isImportant);
    } else if (filter === "completed") {
      all = all.filter((task) => task.completed);
    }

    setTasks(all);
  } catch (err) {
    console.error("Error fetching tasks", err);
  }
}, [filter]);

useEffect(() => {
  fetchTasks();
}, [fetchTasks]);



  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await API.post("/api/tasks", { title: newTask });
      setTasks([res.data, ...tasks]);
      setNewTask("");
    } catch (err) {
      console.error("Error adding task", err);
    }
  };

  const handleToggleImportant = async (id) => {
  try {
    const res = await API.patch(`/api/tasks/important/${id}`);
    const updated = res.data;
    setTasks((prev) =>
      prev.map((task) => (task._id === id ? updated : task))
    );
  } catch (err) {
    console.error("Error toggling important", err);
  }
};


  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error("Error deleting task", err);
    }
  };

  const handleUpdateTask = async (id) => {
  try {
    const res = await API.put(`/api/tasks/${id}`, { title: editedTitle });
    const updated = res.data;
    setTasks((prev) =>
      prev.map((task) => (task._id === id ? updated : task))
    );
    setEditingTaskId(null);
    setEditedTitle("");
  } catch (err) {
    console.error("Error updating task", err);
  }
  };

  const handleToggleComplete = async (id, completed) => {
  try {
    const res = await API.put(`/api/tasks/${id}`, { completed: !completed });
    const updated = res.data;
    setTasks((prev) =>
      prev.map((task) => (task._id === id ? updated : task))
    );
  } catch (err) {
    console.error("Error toggling complete", err);
  }
  };

  const handleSelectTask = (task) => {
  setSelectedTask(task);
  };


  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-100 to-slate-200 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4">My Lists</h2>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600"  onClick={() => setFilter("all")}>
              <ListTodo size={20} /> All Tasks
            </li>
            <li
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
              onClick={() => setFilter("important")}
              >
              <Star size={20} /> Important
            </li>

            <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600" onClick={() => setFilter("completed")}>
              <Check size={20} /> Completed
            </li>
            <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
              <Plus size={20} /> New List
            </li>
            
          </ul>
        </div>

        <ul className="mt-8">
          <li
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-700"
          >
            <LogOut size={20} /> Logout
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-white to-blue-50 p-6">
        <h1 className="text-2xl font-bold mb-4">Today’s Tasks</h1>

        <form className="mb-6 flex gap-4" onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add
          </button>
        </form>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="p-4 bg-gray-100 rounded-lg flex items-center justify-between shadow-sm"
            >
              {editingTaskId === task._id ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={() => handleUpdateTask(task._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateTask(task._id);
                    }
                  }}
              autoFocus
              className="border px-2 py-1 rounded-md w-full"
            />


              ) : (
                <div className="flex items-center gap-2">
                  <Star
                    size={18}
                    className={`cursor-pointer ${
                      task.isImportant ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                    onClick={() => handleToggleImportant(task._id)}
                  />
                  <div className="flex items-center gap-2 flex-1">
  {/* Completion toggle circle */}
  <div
    onClick={() => handleToggleComplete(task._id, task.completed)}
    className={`w-5 h-5 rounded-full border-2 cursor-pointer flex items-center justify-center ${
      task.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'
    }`}
  >
    {task.completed && <Check size={14} className="text-white" />}
  </div>

  {/* Inline edit or normal title */}
  {editingTaskId === task._id ? (
    <input
      type="text"
      className="border border-gray-300 rounded px-2 py-1 w-full"
      value={editedTitle}
      autoFocus
      onChange={(e) => setEditedTitle(e.target.value)}
      onBlur={() => handleUpdateTask(task._id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleUpdateTask(task._id);
        }
      }}
    />
  ) : (
    <span
      onClick={() => handleSelectTask(task)}
      className={`cursor-pointer ${task.completed ? 'line-through text-gray-400' : ''}`}
    >
      {task.title}
    </span>
  )}
</div>

                </div>

              )}

              <div className="flex gap-3 items-center ml-4">
                {/* {editingTaskId === task._id ? (
                  <button
                    onClick={() => handleUpdateTask(task._id)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingTaskId(task._id);
                      setEditText(task.title);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Pencil size={18} />
                  </button>
                )} */}

                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedTask && (
  <div className="w-96 bg-white border-l shadow-md p-4 fixed right-0 top-0 h-full overflow-y-auto z-50">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold">Task Details</h2>
      <button
        onClick={() => setSelectedTask(null)}
        className="text-gray-500 hover:text-red-500"
      >
        ✖
      </button>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block font-medium text-sm mb-1">Title</label>
        <input
          type="text"
          value={selectedTask.title}
          readOnly
          className="w-full border rounded px-2 py-1"
        />
      </div>

      {/* Next features: status, star, desc, etc. */}
    </div>
  </div>
)}

    </div>
  );
};

export default Dashboard;
