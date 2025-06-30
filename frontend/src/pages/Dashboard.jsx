import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
    } else {
      setUser(JSON.parse(storedUser));
    }

    // temporary dummy tasks (replace later with fetch)
    setTasks([
      { id: 1, text: "Buy groceries", completed: false },
      { id: 2, text: "Finish homework", completed: true },
    ]);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const tempTask = {
      id: Date.now(),
      text: newTask,
      completed: false,
    };

    setTasks([tempTask, ...tasks]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow mb-6">
        <h1 className="text-2xl font-bold text-blue-600">
          Welcome, {user?.name || "User"} 👋
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Task Input */}
      <form
        onSubmit={handleAddTask}
        className="flex gap-4 mb-6 max-w-xl mx-auto"
      >
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-grow px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      {/* Task List */}
      <div className="max-w-xl mx-auto space-y-3">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center">No tasks yet</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow"
            >
              <span
                className={`${
                  task.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {task.text}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="text-green-600 hover:underline text-sm"
                >
                  {task.completed ? "Undo" : "Done"}
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
