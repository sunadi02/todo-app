import React, { useEffect, useState, useCallback } from "react";
import TopNavbar from '../components/TopNavbar';
import TaskDetailPanel from '../components/TaskDetailPanel';

import {
  Menu, Check,
  ListTodo,
  Star,
  Plus,
  LogOut,
  Trash2,
  Pencil,
  
} from "lucide-react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import SidebarToggle from "../components/SidebarToggle";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTaskId] = useState(null);
  // const [editText, setEditText] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  const [lists, setLists] = useState([]);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [currentListFilter, setCurrentListFilter] = useState("");

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, list: null });

  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = useCallback(async () => {
  try {
    const res = await API.get('/api/tasks');
    let all = res.data;

    // Filter tasks based on the current view
    if (filter === "important") {
      all = all.filter((task) => task.isImportant && !task.list);
    } else if (filter === "completed") {
      all = all.filter((task) => task.completed && !task.list);
    } else {
      // Default "all" view - only show tasks without a list
      all = all.filter((task) => !task.list);
    }

    // Sort by priority
    all.sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;

      const order = { High: 1, Medium: 2, Low: 3 };
      return order[a.priority] - order[b.priority];
    });

    setTasks(all);
  } catch (err) {
    console.error("Error fetching tasks", err);
  }
}, [filter]);


useEffect(() => {
  fetchTasks();
}, [fetchTasks]);

useEffect(() => {
  if (selectedTask?.steps?.length) {
    const lastStepInput = document.querySelector(`.steps-container input[type="text"]:last-of-type`);
    if (lastStepInput && lastStepInput.value === "") {
      lastStepInput.focus();
    }
  }
}, [selectedTask?.steps?.length]);

  const handleAddTask = async (e) => {
  e.preventDefault();
  if (!newTask.trim()) return;

  try {
    const res = await API.post("/api/tasks", { 
      title: newTask,
      steps: [],
      completed: false,
      isImportant: false,
      priority: "Medium",
      list: null // Explicitly set to null for dashboard tasks
    });
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

// Add this filtering function
const filteredTasks = tasks.filter(task => {
  const matchesFilter = 
    (filter === "important" ? task.isImportant :
     filter === "completed" ? task.completed :
     true) && !task.list;
  
  const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
  
  return matchesFilter && matchesSearch;
});

  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error("Error deleting task", err);
    }
  };

  const handleUpdateTask = async (id, updates) => {
  try {
    const res = await API.put(`/api/tasks/${id}`, updates);
    const updated = res.data;
    setTasks((prev) =>
      prev.map((task) => (task._id === id ? updated : task))
    );
    if (selectedTask && selectedTask._id === id) {
      setSelectedTask(updated);
    }
  } catch (err) {
    console.error("Error updating task", err);
  }
};


  // Replace your handleToggleComplete function with:
const handleToggleComplete = async (id, completed) => {
  try {
    const res = await API.put(`/api/tasks/${id}`, { completed: !completed });
    const updatedTask = res.data;
    
    setTasks(prevTasks => {
      // Remove the task temporarily
      const filteredTasks = prevTasks.filter(task => task._id !== id);
      
      // Add it back at the bottom if completed, or at the top if not
      const newTasks = updatedTask.completed 
        ? [...filteredTasks, updatedTask]
        : [updatedTask, ...filteredTasks];
      
      // Maintain priority sorting for active tasks
      return newTasks.sort((a, b) => {
        if (a.completed === b.completed) {
          const order = { High: 1, Medium: 2, Low: 3 };
          return order[a.priority] - order[b.priority];
        }
        return 0;
      });
    });

  } catch (err) {
    console.error("Error toggling complete", err);
  }
};

  const handleSelectTask = (task) => {
  setSelectedTask(task);
  setShowPanel(true);
};

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

    // Only merge the updated field instead of replacing whole selectedTask
    setSelectedTask((prev) => ({
      ...prev,
      ...res.data,
      steps: field === "steps" ? res.data.steps : prev.steps
    }));

    // Also update task in full list
    setTasks((prevTasks) => {
  const updated = prevTasks.map((task) =>
    task._id === selectedTask._id ? { ...task, [field]: value } : task
  );

  // Reapply sorting
  updated.sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;

    const order = { High: 1, Medium: 2, Low: 3 };
    return order[a.priority] - order[b.priority];
  });

  return updated;
});
  } catch (err) {
    console.error("Error updating field", err);
  }
};

useEffect(() => {
  const fetchLists = async () => {
    try {
      const res = await API.get('/api/lists');
      setLists(res.data); // Use the lists from DB
    } catch (err) {
      console.error("Error fetching lists", err);
    }
  };

  fetchLists();
}, []);



useEffect(() => {
  const handleClick = () => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  };
  window.addEventListener("click", handleClick);
  return () => window.removeEventListener("click", handleClick);
}, [contextMenu]);

// Add this state at the top of your component
const [isSidebarOpen, setIsSidebarOpen] = useState(true);

// Add this function
const toggleSidebar = () => {
  setIsSidebarOpen(!isSidebarOpen);
};


  
return (
  <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100">
    {/* Sidebar */}
    <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-30 transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-0'}`}>
      <Sidebar
        filter={filter}
        setFilter={setFilter}
        lists={lists}
        setLists={setLists}
        showNewListInput={showNewListInput}
        setShowNewListInput={setShowNewListInput}
        newListTitle={newListTitle}
        setNewListTitle={setNewListTitle}
        currentListFilter={currentListFilter}
        setCurrentListFilter={setCurrentListFilter}
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

    <div className="flex-1 flex flex-col relative">
      {/* Top Navbar */}
      <TopNavbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'} mt-16 px-4 md:px-12`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-3 bg-white/80 backdrop-blur rounded-xl px-6 py-3 shadow">
            <span className="text-slate-800">Today’s Tasks</span>
          </h1>
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
          {filteredTasks.map((task) => (
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
                  onClick={() => handleToggleImportant(task._id)}
                />
                <div
                  onClick={() => handleToggleComplete(task._id, task.completed)}
                  className={`w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-colors duration-200
                    ${task.completed ? "bg-green-500 border-green-500" : "border-slate-300 group-hover:border-green-400"}`}
                >
                  {task.completed && <Check size={16} className="text-white" />}
                </div>
                <span
                  onClick={() => handleSelectTask(task)}
                  className={`cursor-pointer text-lg font-medium transition-colors duration-200
                    ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 group-hover:text-blue-600'}`}
                >
                  {task.title}
                </span>
              </div>
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

export default Dashboard;
