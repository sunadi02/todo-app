import React, { useEffect, useState, useCallback } from "react";
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
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

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

const today = new Date().toISOString().split("T")[0];

const todaysTasks = tasks.filter((task) => {
  const taskDate = task.dueDate
    ? new Date(task.dueDate).toISOString().split("T")[0]
    : null;

  return (
    taskDate === today &&
    !task.list // Only show tasks without a list
  );
});


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
    <div className="flex min-h-screen">
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
    

      {/* Main Content */}
      <main className={`flex-1 bg-gradient-to-br from-white to-blue-50 p-6 transition-all ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}>
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
      {showPanel && selectedTask && (
  <div
  className="right-panel  bg-white border-l shadow-md p-4 fixed right-0 top-0 h-full overflow-y-auto z-50"
  style={{ width: selectedTask.panelWidth || 400 }}
>
  {/* Resizer line */}
  <div
    className="absolute left-0 top-0 h-full w-2 cursor-ew-resize z-50"
    onMouseDown={(e) => {
      const startX = e.clientX;
      const startWidth = selectedTask.panelWidth || 400;

      const handleMouseMove = (e) => {
        const newWidth = startWidth + (startX - e.clientX);
        if (newWidth >= 250 && newWidth <= 600) {
          setSelectedTask((prev) => ({ ...prev, panelWidth: newWidth }));
        }
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }}
  />

  {/* right Panel content starts */}
  <div className="pl-2 ">
    <div className="flex justify-between items-center mb-4 ">
      <h2 className="text-lg font-bold">Task Details</h2>
      <button
        onClick={() => setSelectedTask(null)}
        className="text-gray-500 hover:text-red-500"
      >
        ✖
      </button>
    </div>

    <div className="pl-2 space-y-4">

  {/* Editable title */}
  <input
    type="text"
    value={selectedTask.title}
    onChange={(e) =>
      setSelectedTask({ ...selectedTask, title: e.target.value })
    }
    onBlur={() => updateTaskField("title", selectedTask.title)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
      e.preventDefault();
      updateTaskField("title", selectedTask.title);
     }
    }}

    className="w-full border rounded px-2 py-1"
  />

  {/* Completion toggle and star */}
  <div className="flex items-center gap-4">
    {/* Completed circle */}
    <div
      onClick={() =>
        updateTaskField("completed", !selectedTask.completed)
      }
      className={`w-6 h-6 flex items-center justify-center border-2 rounded-full cursor-pointer ${
        selectedTask.completed ? "bg-green-500 border-green-500" : "border-gray-400"
      }`}
    >
      {selectedTask.completed && <Check size={14} className="text-white" />}
    </div>

    {/* Star toggle */}
    <Star
  size={22}
  className={`cursor-pointer ${selectedTask?.isImportant ? 'text-yellow-500' : 'text-gray-400'}`}
  onClick={() =>
    updateTaskField("isImportant", !selectedTask.isImportant)
  }
/>


  </div>

  {/* Description */}
  <div>
    <label className="text-sm font-semibold mb-1 block">Description</label>
    <textarea
  className="w-full border rounded p-2"
  value={selectedTask.description}
  placeholder="Add a description..."
  onChange={(e) =>
    setSelectedTask({ ...selectedTask, description: e.target.value })
  }
  onBlur={() => handleUpdateTask(selectedTask._id, { description: selectedTask.description })}
/>
  </div>

  {/* Priority */}
  <div>
    <label className="text-sm font-semibold mb-1 block">Priority</label>
    <select
  value={selectedTask.priority}
  onChange={(e) => updateTaskField("priority", e.target.value)}

  className="border rounded p-2"
>
  <option value="Low">Low</option>
  <option value="Medium">Medium</option>
  <option value="High">High</option>
</select>

  </div>

  {/* Due Date */}
  <div>
    <label className="text-sm font-semibold mb-1 block">Due Date</label>
    <input
      type="date"
      className="w-full border rounded px-2 py-1"
      value={
        selectedTask.dueDate
          ? new Date(selectedTask.dueDate).toISOString().substr(0, 10)
          : ""
      }
      onChange={(e) =>
        updateTaskField("dueDate", e.target.value)
      }
    />
  </div>

  {/* Sub-steps */}
<div className="steps-container">
  <label className="text-sm font-semibold mb-1 block">Steps</label>
  <ul className="space-y-2">
    {(selectedTask.steps || []).map((step, i) => (
      <li key={i} className="flex items-center gap-2">
        {/* Completion Circle */}
        <div
          onClick={() => {
            const newSteps = [...selectedTask.steps];
            newSteps[i].done = !newSteps[i].done;
            setSelectedTask({ ...selectedTask, steps: newSteps });
            updateTaskField("steps", newSteps);
          }}
          className={`w-4 h-4 rounded-full border-2 cursor-pointer flex items-center justify-center ${
            step.done ? "bg-green-500 border-green-500" : "border-gray-400"
          }`}
        >
          {step.done && <Check size={12} className="text-white" />}
        </div>

        {/* Step text input */}
        <input
          type="text"
          value={step.text}
          onChange={(e) => {
            const newSteps = [...selectedTask.steps];
            newSteps[i].text = e.target.value;
            setSelectedTask({ ...selectedTask, steps: newSteps });
          }}
          onBlur={() => {
            const newSteps = [...selectedTask.steps];
            // Don’t save if still empty
            if (step.text.trim() === "") return;
            updateTaskField("steps", newSteps);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const newSteps = [...selectedTask.steps];
              if (step.text.trim() === "") return;
              updateTaskField("steps", newSteps);
            }
          }}
          className="border px-2 py-1 rounded w-full"
          placeholder="Type a step..."
          autoFocus={i === selectedTask.steps.length - 1 && step.text === ""}
        />

        <button
            type="button"
            className="text-red-500 hover:text-red-700"
            onClick={() => {
              const newSteps = selectedTask.steps.filter((_, idx) => idx !== i);
              setSelectedTask({ ...selectedTask, steps: newSteps });
              updateTaskField("steps", newSteps);
            }}
          >
            ❌
          </button>


      </li>
    ))}
  </ul>

  {/* Add new step button */}
  <button
    type="button"
    className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
    onClick={() => {
  const newSteps = [...(selectedTask.steps || []), { text: "", done: false }];
  setSelectedTask({ ...selectedTask, steps: newSteps });
  // 👇 Don’t call updateTaskField yet
}}


  >
    <Plus size={16} /> Add Step
  </button>
</div>

</div>


  </div>
  
  <button
  onClick={() => {
    handleDeleteTask(selectedTask._id);
    setShowPanel(false); // Close the panel after deletion
  }}
  className="mt-6 mx-auto min-w-full flex items-center justify-center text-white bg-red-500 hover:bg-red-600 py-2 px-4 rounded"
>
  <Trash2 size={18} />
</button>
</div>

)}

    </div>
  );
};

export default Dashboard;
