import React, { useEffect, useState, useCallback } from "react";
import TopNavbar from '../components/TopNavbar';
import TaskDetailPanel from '../components/TaskDetailPanel';
import { Menu, Check, ListTodo, Star, Plus, Home, List } from "lucide-react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [lists, setLists] = useState([]);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [currentListFilter, setCurrentListFilter] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, list: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Check screen size and set initial sidebar state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.querySelector('.sidebar-container');
        const toggleButton = document.querySelector('.sidebar-toggle-button');
        
        if (sidebar && !sidebar.contains(event.target)) {
          if (!toggleButton || !toggleButton.contains(event.target)) {
            setIsSidebarOpen(false);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  // Fetch tasks with filtering and sorting
  const fetchTasks = useCallback(async () => {
    try {
      const res = await API.get('/api/tasks');
      let all = res.data.filter(task => !task.list); // Only show tasks without a list

      if (filter === "important") all = all.filter(task => task.isImportant);
      if (filter === "completed") all = all.filter(task => task.completed);

      // Sort by completion status and priority
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

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get('/api/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

  // Fetch lists
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

  // Task management functions
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
        list: null
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
      setTasks(prev => prev.map(task => task._id === id ? updated : task));
    } catch (err) {
      console.error("Error toggling important", err);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const res = await API.put(`/api/tasks/${id}`, { completed: !completed });
      const updatedTask = res.data;
      
      setTasks(prevTasks => {
        const filteredTasks = prevTasks.filter(task => task._id !== id);
        const newTasks = updatedTask.completed 
          ? [...filteredTasks, updatedTask]
          : [updatedTask, ...filteredTasks];
        
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

  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
      if (selectedTask && selectedTask._id === id) {
        setShowPanel(false);
      }
    } catch (err) {
      console.error("Error deleting task", err);
    }
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setShowPanel(true);
  };

  const updateTaskField = async (field, value) => {
    try {
      const updatedTask = {
        ...selectedTask,
        [field]: value,
        steps: field === "steps" ? value : selectedTask.steps || []
      };

      const res = await API.put(`/api/tasks/${selectedTask._id}`, updatedTask);
      
      setSelectedTask(prev => ({
        ...prev,
        ...res.data,
        steps: field === "steps" ? res.data.steps : prev.steps
      }));

      setTasks(prevTasks => {
        const updated = prevTasks.map(task =>
          task._id === selectedTask._id ? { ...task, [field]: value } : task
        );
        
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

  // Filter tasks based on current filter and search query
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      (filter === "important" ? task.isImportant :
       filter === "completed" ? task.completed :
       true);
    
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100">
      {/* Mobile Sidebar Toggle Button */}
      {isMobile && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-40 p-2 rounded-md bg-slate-700 text-white sidebar-toggle-button"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-30 transition-all duration-300 bg-white shadow-lg sidebar-container
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 overflow-hidden'} 
          md:relative md:translate-x-0 md:w-64 md:overflow-visible`}
      >
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
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
        <TopNavbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          navbarHeight="h-16 md:h-20"
          user={user}
          setUser={setUser}
        />

        <main className="flex-1 px-4 md:px-6 lg:px-8 pt-16 md:pt-20 pb-20 md:pb-0">
          {/* Hero Section */}
          <section className="mb-6 md:mb-8 mt-9 md:w-full mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-slate-700/90 rounded-xl shadow px-4 py-3 sm:px-6 sm:py-5">
              <div className="flex-shrink-0">
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="48" fill="#64748b" />
                  <path d="M30 52l14 14 26-26" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                  Welcome back, <span className="text-blue-300">{user?.name || 'Loading...'}!</span>
                </h2>
                <p className="text-slate-200 text-xs sm:text-sm md:text-base">
                  Quick add, mark, and organize your tasks.
                </p>
              </div>
            </div>
          </section>

          {/* Task Management Header */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold bg-white/80 backdrop-blur rounded-xl px-4 py-2 sm:px-6 sm:py-3 shadow">
              Today's Tasks
            </h1>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
            {['all', 'important', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow transition-all duration-200 text-sm sm:text-base
                  ${filter === f ? 'bg-blue-600 text-white' : 'bg-white/90 text-blue-700 hover:bg-blue-50'}`}
              >
                {f === 'all' && <Menu size={16} className="sm:size-[18px]" />}
                {f === 'important' && <Star size={16} className="sm:size-[18px]" />}
                {f === 'completed' && <Check size={16} className="sm:size-[18px]" />}
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Add Task Form */}
          <form className="mb-6 md:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4" onSubmit={handleAddTask}>
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-base sm:text-lg"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
              disabled={isUploading}
            >
              {isUploading ? 'Adding...' : 'Add Task'}
            </button>
          </form>

          {/* Task List */}
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`group p-4 md:p-5 bg-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow border-l-4 transition-all duration-200
                  ${task.completed ? 'border-slate-500' : 'border-blue-200'}
                  hover:shadow-lg`}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <Star
                      size={20}
                      className={`cursor-pointer ${task.isImportant ? "text-yellow-400" : "text-slate-300 group-hover:text-yellow-400"}`}
                      onClick={() => handleToggleImportant(task._id)}
                    />
                    <div
                      onClick={() => handleToggleComplete(task._id, task.completed)}
                      className={`w-5 h-5 rounded-full border-2 cursor-pointer flex items-center justify-center
                        ${task.completed ? "bg-green-500 border-green-500" : "border-slate-300 group-hover:border-green-400"}`}
                    >
                      {task.completed && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                  
                  <span
                    onClick={() => handleSelectTask(task)}
                    className={`cursor-pointer text-base md:text-lg font-medium flex-1
                      ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 group-hover:text-blue-600'}`}
                  >
                    {task.title}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-4">
                  <button 
                    onClick={() => handleSelectTask(task)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Task Detail Panel */}
        {showPanel && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
            <div 
              className="bg-white w-full max-w-md h-full overflow-y-auto animate-slide-in"
              style={{ width: 'min(90vw, 400px)' }}
            >
              <TaskDetailPanel
                selectedTask={selectedTask}
                setSelectedTask={setSelectedTask}
                updateTaskField={updateTaskField}
                handleDeleteTask={handleDeleteTask}
                setShowPanel={setShowPanel}
              />
            </div>
          </div>
        )}

      
      </div>
    </div>
  );
};

export default Dashboard;