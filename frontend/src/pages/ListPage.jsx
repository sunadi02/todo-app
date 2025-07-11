import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import {  Menu,Star, Check } from "lucide-react";
import Sidebar from "../components/Sidebar";


const ListPage = () => {
  const { listTitle } = useParams();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const [lists, setLists] = useState([]);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, list: null });

    useEffect(() => {
  const fetchTasks = async () => {
    try {
      const res = await API.get("/api/tasks");
      const filtered = res.data.filter((task) => task.list === listTitle);
      setTasks(filtered);
    } catch (err) {
      console.error("Error loading tasks", err);
    }
  };

  fetchTasks();
}, [listTitle]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await API.post("/api/tasks", {
        title: newTask,
        list: listTitle,
        steps: [],
        completed: false,
        isImportant: false,
        priority: "Medium",
      });

      setTasks([res.data, ...tasks]);
      setNewTask("");
    } catch (err) {
      console.error("Error adding task", err);
    }
  };

  const toggleImportant = async (id) => {
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

  const toggleComplete = async (id, completed) => {
    try {
      const res = await API.put(`/api/tasks/${id}`, {
        completed: !completed,
      });
      const updated = res.data;
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? updated : task))
      );
    } catch (err) {
      console.error("Error toggling complete", err);
    }
  };

  useEffect(() => {
  const fetchLists = async () => {
    try {
      const res = await API.get('/api/lists');
      setLists(res.data);
    } catch (err) {
      console.error("Error fetching lists", err);
    }
  };
  fetchLists();
}, []);


  return (
    <div className="flex min-h-screen">
  {/* Sidebar */}
  <Sidebar
    filter={null}
    setFilter={() => {}}
    lists={lists}
    setLists={setLists}
    showNewListInput={showNewListInput}
    setShowNewListInput={setShowNewListInput}
    newListTitle={newListTitle}
    setNewListTitle={setNewListTitle}
    currentListFilter={listTitle}
    setCurrentListFilter={() => {}}
    contextMenu={contextMenu}
    setContextMenu={setContextMenu}
  />

  {/* Main content */}
  <main className="flex-1 bg-gradient-to-br from-white to-blue-50 p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold mb-4">
        {decodeURIComponent(listTitle)}
      </h1>
      <Link to="/Dashboard" className="text-blue-500 hover:underline">
        ← Back to Dashboard
      </Link>
    </div>

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
          <div className="flex items-center gap-2 flex-1">
            <Star
              size={18}
              className={`cursor-pointer ${
                task.isImportant ? "text-yellow-500" : "text-gray-400"
              }`}
              onClick={() => toggleImportant(task._id)}
            />
            <div
              onClick={() => toggleComplete(task._id, task.completed)}
              className={`w-5 h-5 rounded-full border-2 cursor-pointer flex items-center justify-center ${
                task.completed
                  ? "bg-green-500 border-green-500"
                  : "border-gray-400"
              }`}
            >
              {task.completed && <Check size={14} className="text-white" />}
            </div>
            <span
              className={`cursor-pointer ${
                task.completed ? "line-through text-gray-400" : ""
              }`}
            >
              {task.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  </main>
</div>

  );
};

export default ListPage;
