import React, { useEffect, useState, useCallback } from "react";
import TopNavbar from '../components/TopNavbar';
import TaskDetailPanel from '../components/TaskDetailPanel';

import {
  
  ListTodo,
  Star,
  Check,
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
    <div className="flex min-h-screen bg-gradient-to-t from-gray-100 to-white pt-16">
      {/* Sidebar */}
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
    
      <div className="flex-1 flex flex-col">
      

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${
        isSidebarOpen ? 'ml-80 mt-9 pl-8 mr-16' : 'mt-9 ml-7 mr-16 pl-16'
      } pr-8 `}>
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          Today’s Tasks</h1>

        
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
          {filteredTasks.map((task) => (
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
                
              </div>
            </div>
          ))}
        </div>
      </main>

          <TopNavbar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

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

export default Dashboard;
