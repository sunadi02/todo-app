import React, { useEffect, useState, useCallback } from "react";
import TopNavbar from '../components/TopNavbar';
import TaskDetailPanel from '../components/TaskDetailPanel';
import { Menu, Check, Star, Calendar as CalendarIcon } from "lucide-react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {

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
  const [isUploading] = useState(false);
  const navigate = useNavigate();

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

  const fetchTasks = useCallback(async () => {
    try {
      const res = await API.get('/api/tasks');
      let all = res.data.filter(task => !task.list); // Only show tasks without a list

      if (filter === "important") all = all.filter(task => task.isImportant);
      if (filter === "completed") all = all.filter(task => task.completed);

      //sorting by completion status and priority
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

  // refresh when tasks updated elsewhere (calendar, create, delete)
  useEffect(() => {
    const handler = () => fetchTasks();
    window.addEventListener('tasks-updated', handler);
    return () => window.removeEventListener('tasks-updated', handler);
  }, [fetchTasks]);

  // Listen for global open-task events from notifications
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail) {
        setSelectedTask(e.detail);
        setShowPanel(true);
      }
    };
    window.addEventListener('open-task', handler);
    return () => window.removeEventListener('open-task', handler);
  }, []);

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
  setTasks(prev => [res.data, ...prev]);
      setNewTask("");
  // notify rest of app (notifications) that tasks changed
  window.dispatchEvent(new Event('tasks-updated'));
    } catch (err) {
      console.error("Error adding task", err);
    }
  };

  const handleToggleImportant = async (id) => {
    try {
      const res = await API.patch(`/api/tasks/important/${id}`);
      const updated = res.data;
      setTasks(prev => prev.map(task => task._id === id ? updated : task));
  window.dispatchEvent(new Event('tasks-updated'));
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
  window.dispatchEvent(new Event('tasks-updated'));
    } catch (err) {
      console.error("Error toggling complete", err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/api/tasks/${id}`);
  setTasks(prev => prev.filter(task => task._id !== id));
      if (selectedTask && selectedTask._id === id) {
        setShowPanel(false);
      }
  window.dispatchEvent(new Event('tasks-updated'));
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 ">
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
        className={`fixed top-0 left-0 h-full z-30  duration-300 bg-white shadow-lg sidebar-container
          ${isSidebarOpen ? ' w-64' : '-translate-x-0 w-0 overflow-hidden'} 
          md:relative  md:w-64 md:overflow-visible`}
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
  <div className={`mx-7 flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}> 
        <TopNavbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          navbarHeight="h-16 md:h-20"
          user={user}
          setUser={setUser}
        />

  <main className="flex-1 px-2 md:px-4 lg:px-6 pt-16 md:pt-20 pb-20 md:pb-0">
          
          <section className="mb-6 md:mb-8 mt-9 md:w-full mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-slate-700/90 rounded-xl shadow px-4 py-3 sm:px-6 sm:py-5">
              <div className="flex-shrink-0">
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="48" fill="#5faeb6" />
                  <path d="M30 52l14 14 26-26" stroke="#3f6184" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
                    <div className="text-center sm:text-left">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                              Welcome back, <span className="text-[#5faeb6]">{user?.name || 'Loading...'}!</span>
                            </h2>
                            <p className="text-slate-200 text-xs sm:text-sm md:text-base">
                              Quick add, mark, and organize your tasks.
                            </p>
                          </div>
            </div>
          </section>

          
          <div className="flex justify-between items-center mb-6 md:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold bg-white/80 backdrop-blur rounded-xl px-4 py-2 sm:px-6 sm:py-3 shadow">
                  Today's Tasks
                </h1>
                <div>
                  <button onClick={() => navigate('/calendar')} className="mr-5 ml-2 mt-1 bg-white/90 px-3 py-2 rounded shadow hover:bg-[#f0f9f9] flex items-center gap-2" aria-label="Open calendar">
                    <CalendarIcon size={30} className="text-[#5faeb6]" /> 
                  </button>
                </div>
              </div>

          
          <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
            {['all', 'important', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow transition-all duration-200 text-sm sm:text-base
                  ${filter === f ? 'bg-[#5faeb6] text-white' : 'bg-white/90 text-[#3f6184] hover:bg-[#5faeb6]/10'}`}
              >
                {f === 'all' && <Menu size={16} className="sm:size-[18px]" />}
                {f === 'important' && <Star size={16} className="sm:size-[18px]" />}
                {f === 'completed' && <Check size={16} className="sm:size-[18px]" />}
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

         
          <form className="mb-6 md:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4" onSubmit={handleAddTask}>
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 border border-[#3f6184] rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-[#f6f7f9] shadow focus:outline-none focus:ring-2 focus:ring-[#5faeb6] text-base sm:text-lg text-[#323a45] placeholder-[#778899]"
              aria-label="Add new task"
            />
            <button
              type="submit"
              className="bg-[#5faeb6] text-[#f6f7f9] px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow hover:bg-[#3f6184] transition-colors font-semibold text-sm sm:text-base"
              disabled={isUploading}
            >
              {isUploading ? 'Adding...' : 'Add Task'}
            </button>
          </form>

          
          <div className="grid grid-cols-1 gap-4 md:gap-6 mb-9">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`group p-4 md:p-5 bg-[#f6f7f9] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow border-l-4 transition-all duration-200
                  ${task.completed ? 'border-[#778899]' : 'border-[#5faeb6]'}
                  hover:shadow-lg`}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="relative">
                      <Star
                        size={20}
                        className={`cursor-pointer transition-colors duration-150
                          ${task.isImportant ? "text-yellow-400" : "text-slate-300"}
                        `}
                        onClick={() => handleToggleImportant(task._id)}
                        onMouseEnter={e => e.currentTarget.classList.add('text-yellow-300')}
                        onMouseLeave={e => e.currentTarget.classList.remove('text-yellow-300')}
                        style={task.isImportant ? { color: '#facc15' } : {}}
                        
                      />
                    </span>
                    <span className="relative">
                      <div
                        onClick={() => handleToggleComplete(task._id, task.completed)}
                        className={`w-5 h-5 hover:border-green-500 rounded-full border-2 cursor-pointer flex items-center justify-center transition-colors duration-150
                          ${task.completed ? "bg-green-500 border-green-500" : "border-slate-300"}
                        `}
                        onMouseEnter={e => {
                          if (!task.completed) {
                            e.currentTarget.classList.add('border-green-400');
                          }
                        }}
                        onMouseLeave={e => {
                          if (!task.completed) {
                            e.currentTarget.classList.remove('border-green-400');
                          }
                        }}
                      >
                        {task.completed && <Check size={14} className="text-white" />}
                      </div>
                    </span>
                  </div>
                  
                  <span
                    onClick={() => handleSelectTask(task)}
                    className={`cursor-pointer text-base md:text-lg font-medium flex-1
                      ${task.completed ? 'line-through text-[#778899]' : 'text-[#323a45] group-hover:text-[#3f6184]'}`}
                  >
                    {task.title}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-4">
                  <button 
                    onClick={() => handleSelectTask(task)}
                    className="text-sm text-[#3f6184] hover:text-[#5faeb6]"
                    aria-label="Task details"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        
        {showPanel && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
            <div 
              
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