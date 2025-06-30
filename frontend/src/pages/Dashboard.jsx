import React, { useEffect, useState } from "react";
import { ListTodo, Star, CheckCircle, Plus, LogOut } from "lucide-react";
import API from "../api";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // 🔁 Fetch tasks on load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get('/api/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const res = await API.post('/api/tasks', { title: newTask });
      setTasks([res.data, ...tasks]);
      setNewTask("");
    } catch (err) {
      console.error("Error adding task", err);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">My Lists</h2>
        <ul className="space-y-4 text-gray-700">
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
            <ListTodo size={20} /> All Tasks
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
            <Star size={20} /> Important
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
            <CheckCircle size={20} /> Completed
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
            <Plus size={20} /> New List
          </li>
          <li
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
            className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-700 mt-4"
          >
            <LogOut size={20} /> Logout
          </li>


        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-6">
        <h1 className="text-2xl font-bold mb-4">Today’s Tasks</h1>

        {/* Add Task Form */}
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

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="p-4 bg-gray-100 rounded-lg flex items-center justify-between shadow-sm"
            >
              <span>{task.title}</span>
              {/* We’ll add delete/edit later */}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
