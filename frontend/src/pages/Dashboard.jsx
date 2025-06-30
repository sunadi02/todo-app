import React, { useEffect, useState } from "react";
import {
  ListTodo,
  Star,
  CheckCircle,
  Plus,
  LogOut,
  Pencil,
  Trash2,
} from "lucide-react";
import API from "../api";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

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
      const res = await API.put(`/api/tasks/${id}`, { title: editText });
      setTasks(
        tasks.map((task) =>
          task._id === id ? { ...task, title: res.data.title } : task
        )
      );
      setEditingTaskId(null);
      setEditText("");
    } catch (err) {
      console.error("Error updating task", err);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-100 to-slate-200 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4">My Lists</h2>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
              <ListTodo size={20} /> All Tasks
            </li>
            <li
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
              onClick={() => setTasks(tasks.filter(task => task.isImportant))}
              >
              <Star size={20} /> Important
            </li>

            <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
              <CheckCircle size={20} /> Completed
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
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="border px-2 py-1 rounded-md w-full mr-2"
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
                  <span>{task.title}</span>
                </div>

              )}

              <div className="flex gap-3 items-center ml-4">
                {editingTaskId === task._id ? (
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
                )}

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
    </div>
  );
};

export default Dashboard;
