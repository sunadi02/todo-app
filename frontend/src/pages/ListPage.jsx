import React, { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";
import TopNavbar from '../components/TopNavbar';
import API from "../api";
import {  Menu,Star, Check } from "lucide-react";
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

  const [user, setUser] = useState({
  name: 'John Doe', // Replace with dynamic data
  avatar: 'https://example.com/profile.jpg'
});

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
    <div className="flex min-h-screen bg-gradient-to-t from-gray-100">
     <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-20 ${isSidebarOpen ? 'w-72' : 'w-0'}`}>
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
        isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
      />

      <SidebarToggle 
            isSidebarOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar} 
            />
  </div> 

    <div className="flex-1 flex flex-col">
          

  {/* Main content */}
  <main className={`flex-1 transition-all duration-300 ${
    isSidebarOpen ? 'ml-80 mt-9 pl-8 mr-16' : 'mt-9 ml-7 mr-7 pl-16'
  } pr-8`}>
    <div className="flex justify-between items-center mb-6 mt-12">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        {decodeURIComponent(listTitle)}
      </h1>
      <Link to="/Dashboard" className="text-blue-500 hover:underline">
        ← Back to Dashboard
      </Link>
      <div className="flex gap-4">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('important')}
              className={`px-3 py-1 rounded ${filter === 'important' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Important
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Completed
            </button>
          </div>
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
              onClick={() => {
                setSelectedTask(task);
                setShowPanel(true);
              }}
              className={`cursor-pointer ${task.completed ? 'line-through text-gray-400' : ''}`}
            >
              {task.title}
            </span>
            
          </div>
        </div>
      ))}
    </div>
  </main>
<TopNavbar />
  
  </div>
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

  );
};

export default ListPage;
