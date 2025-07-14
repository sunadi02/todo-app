import React, { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";
import TopNavbar from '../components/TopNavbar';
import API from "../api";
import {  Star, Check, Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import SidebarToggle from "../components/SidebarToggle";
import TaskDetailPanel from '../components/TaskDetailPanel';

const ListPage = () => {
  const { listTitle } = useParams();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [filter, setFilter] = useState('all');

  const [selectedTask, setSelectedTask] = useState(null);
  const [showPanel, setShowPanel] = useState(false);


  const [lists, setLists] = useState([]);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, list: null });

  const [searchQuery, setSearchQuery] = useState('');

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
  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error("Error deleting task", err);
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

// Add this state at the top of your component
const [isSidebarOpen, setIsSidebarOpen] = useState(true);

// Add this function
const toggleSidebar = () => {
  setIsSidebarOpen(!isSidebarOpen);
};

useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get("/api/tasks");
        let filtered = res.data.filter((task) => task.list === listTitle);
        
        // Apply filters
        if (filter === "important") {
          filtered = filtered.filter((task) => task.isImportant);
        } else if (filter === "completed") {
          filtered = filtered.filter((task) => task.completed);
        }
        
        setTasks(filtered);
      } catch (err) {
        console.error("Error loading tasks", err);
      }
    };

    fetchTasks();
  }, [listTitle, filter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const panel = document.querySelector('.right-panel');
      if (panel && !panel.contains(event.target)) {
        setShowPanel(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updateTaskField = async (field, value) => {
  try {
    const updatedTask = {
      ...selectedTask,
      [field]: value,
      steps: field === "steps" ? value : selectedTask.steps || []
    };

    const res = await API.put(`/api/tasks/${selectedTask._id}`, updatedTask);
    setSelectedTask((prev) => ({
      ...prev,
      ...res.data,
      steps: field === "steps" ? res.data.steps : prev.steps
    }));

    setTasks((prevTasks) => {
      const updated = prevTasks.map((task) =>
        task._id === selectedTask._id ? { ...task, [field]: value } : task
      );
      return updated;
    });
  } catch (err) {
    console.error("Error updating field", err);
  }

  
};
return (
  <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100">
    {/* Sidebar */}
    <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-30 transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-0'}`}>
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
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
      />
      <SidebarToggle 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
    </div>

    {/* Main Content */}
    <div className="flex-1 flex flex-col relative">
      {/* Top Navbar */}
      <TopNavbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'} mt-16 px-4 md:px-12`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-3 bg-white/80 backdrop-blur rounded-xl px-6 py-3 shadow">
            <span className="text-slate-800">{decodeURIComponent(listTitle)}</span>
          </h1>
          <Link to="/Dashboard" className="text-blue-700 hover:underline font-medium">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow transition-all duration-200
              ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white/90 text-blue-700 hover:bg-blue-50'}`}
          >
            <Menu size={18} /> All
          </button>
          <button
            onClick={() => setFilter('important')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow transition-all duration-200
              ${filter === 'important' ? 'bg-blue-600 text-white' : 'bg-white/90 text-blue-700 hover:bg-blue-50'}`}
          >
            <Star size={18} /> Important
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow transition-all duration-200
              ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-white/90 text-blue-700 hover:bg-blue-50'}`}
          >
            <Check size={18} /> Completed
          </button>
        </div>

        {/* Add Task */}
        <form className="mb-8 flex gap-4 items-center" onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 border border-slate-200 rounded-xl px-5 py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition-colors font-semibold"
          >
            Add
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`group p-5 bg-white rounded-xl flex items-center justify-between shadow border-l-4 transition-all duration-200
                ${task.completed ? 'border-slate-500' : 'border-blue-200'}
                hover:shadow-lg`}
            >
              <div className="flex items-center gap-4 flex-1">
                <Star
                  size={22}
                  className={`cursor-pointer transition-colors duration-200
                    ${task.isImportant ? "text-yellow-400" : "text-slate-300 group-hover:text-yellow-400"}`}
                  onClick={() => toggleImportant(task._id)}
                />
                <div
                  onClick={() => toggleComplete(task._id, task.completed)}
                  className={`w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-colors duration-200
                    ${task.completed ? "bg-green-500 border-green-500" : "border-slate-300 group-hover:border-green-200"}`}
                >
                  {task.completed && <Check size={16} className="text-white" />}
                </div>
                <span
                  onClick={() => {
                    setSelectedTask(task);
                    setShowPanel(true);
                  }}
                  className={`cursor-pointer text-lg font-medium transition-colors duration-200
                    ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 group-hover:text-blue-600'}`}
                >
                  {task.title}
                </span>
              </div>
              {/* Optional: Add a delete button or more actions here */}
            </div>
          ))}
        </div>
      </main>

      {/* Task Detail Panel */}
      {showPanel && selectedTask && (
        <TaskDetailPanel
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          updateTaskField={updateTaskField}
          handleDeleteTask={handleDeleteTask}
          setShowPanel={setShowPanel}
          panelWidth={selectedTask.panelWidth || 400}
        />
      )}
    </div>
  </div>
)};

export default ListPage;
