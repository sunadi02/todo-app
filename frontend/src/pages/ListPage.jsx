import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import TopNavbar from '../components/TopNavbar';
import API from "../api";
import { Star, Check, Menu, Calendar as CalendarIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TaskDetailPanel from '../components/TaskDetailPanel';
import { useNavigate } from "react-router-dom";

const ListPage = () => {
  const { listTitle } = useParams();
  const decodedTitle = decodeURIComponent(listTitle || '');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState('all');
  const [currentListId, setCurrentListId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [lists, setLists] = useState([]);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, list: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

        // try to resolve the current list id from the title param
        if (decodedTitle) {
          const found = res.data.find(l => l.title === decodedTitle);
          if (found) setCurrentListId(found._id);
        }
      } catch (err) {
        console.error('Error fetching lists', err);
      }
    };
    fetchLists();
  }, [decodedTitle]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get('/api/tasks');
        const all = res.data;

        const filtered = all.filter((task) => {
          if (!currentListId) return false;
          const tList = task.list;
          if (!tList) return false;
          if (typeof tList === 'string') return tList === currentListId;
          if (typeof tList === 'object') return tList._id === currentListId || tList.title === decodedTitle;
          return false;
        }).filter(task => {
          if (filter === 'important') return task.isImportant;
          if (filter === 'completed') return task.completed;
          return true;
        });

        filtered.sort((a, b) => {
          if (a.completed && !b.completed) return 1;
          if (!a.completed && b.completed) return -1;
          const order = { High: 1, Medium: 2, Low: 3 };
          return order[a.priority] - order[b.priority];
        });

        setTasks(filtered);
      } catch (err) {
        console.error('Error loading tasks', err);
      }
    };

    if (currentListId) fetchTasks();
  }, [currentListId, filter, decodedTitle]);

  


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await API.post("/api/tasks", {
        title: newTask,
  list: currentListId || null,
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
      setTasks(tasks.filter(task => task._id !== id));
      if (selectedTask && selectedTask._id === id) {
        setShowPanel(false);
      }
    } catch (err) {
      console.error("Error deleting task", err);
    }
  };

  const toggleImportant = async (id) => {
    try {
      const res = await API.patch(`/api/tasks/important/${id}`);
      const updated = res.data;
      setTasks(prev => prev.map(task => task._id === id ? updated : task));
    } catch (err) {
      console.error("Error toggling important", err);
    }
  };

  const toggleComplete = async (id, completed) => {
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

  return (
  <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Mobile Sidebar Toggle Button */}
      {isMobile && (
              <button 
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-40 p-2 rounded-md bg-slate-700 text-white sidebar-toggle-button"
                aria-label="Toggle sidebar"
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
      </div>

      {/* Main Content Area */}
      <div className={`mx-5 flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
        <TopNavbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          navbarHeight="h-16 md:h-20"
          user={user}
          setUser={setUser}
        />

        <main className="flex-1 px-4 md:px-6 lg:px-8 pt-32 md:pt-32 pb-20 md:pb-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-3 bg-[#f6f7f9]/80 backdrop-blur rounded-xl px-4 py-2 sm:px-6 sm:py-3 shadow">
              <span className="text-[#323a45]">{decodeURIComponent(listTitle)}</span>
            </h1>
            <div className="flex items-center gap-3">
              <Link to="/Dashboard" className="text-[#3f6184] hover:underline font-medium text-sm md:text-base">
                ← Back to Dashboard
              </Link>
              
            </div>
            <div>
              <button onClick={() => navigate('/calendar')} className="mr-5 ml-2 mt-1 bg-white/90 px-3 py-2 rounded shadow hover:bg-[#f0f9f9] flex items-center gap-2" aria-label="Open calendar">
                <CalendarIcon size={30} className="text-[#5faeb6]" />
              </button>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
            {['all', 'important', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow transition-all duration-200 text-sm sm:text-base
                  ${filter === f ? 'bg-[#5faeb6] text-[#f6f7f9]' : 'bg-[#f6f7f9]/90 text-[#3f6184] hover:bg-[#5faeb6]/10'}`}
                aria-label={`Filter: ${f}`}
              >
                {f === 'all' && <Menu size={16} className="sm:size-[18px]" />}
                {f === 'important' && <Star size={16} className="sm:size-[18px]" />}
                {f === 'completed' && <Check size={16} className="sm:size-[18px]" />}
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          

          {/* Add Task */}
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
            >
              Add Task
            </button>
          </form>

          {/* Task List */}
          <div className="grid grid-cols-1 gap-4 md:gap-6 mb-9">
            {tasks.map((task) => (
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
                        className={`hover:text-yellow-600 cursor-pointer transition-colors duration-150
                          ${task.isImportant ? "text-yellow-500 " : "text-slate-300"}
                        `}
                        onClick={() => toggleImportant(task._id)}
                        onMouseEnter={e => e.currentTarget.classList.add('text-yellow-300')}
                        onMouseLeave={e => e.currentTarget.classList.remove('text-yellow-300')}
                        style={task.isImportant ? { color: '#facc15' } : {}}
                      />
                    </span>
                    <span className="relative">
                      <div
                        onClick={() => toggleComplete(task._id, task.completed)}
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
                    onClick={() => {
                      setSelectedTask(task);
                      setShowPanel(true);
                    }}
                    className={`cursor-pointer text-base md:text-lg font-medium flex-1
                      ${task.completed ? 'line-through text-[#778899]' : 'text-[#323a45] group-hover:text-[#3f6184]'}`}
                  >
                    {task.title}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-4">
                  <button 
                    onClick={() => {
                      setSelectedTask(task);
                      setShowPanel(true);
                    }}
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

        {/* Task Detail Panel */}
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

export default ListPage;