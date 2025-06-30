import React from "react";
import { ListTodo, Star, CheckCircle, Plus } from "lucide-react";


const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">My Lists</h2>
        <ul className="space-y-4 text-gray-700">
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
            <ListTodo size={20} /> All Tasks
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
            <Star size={20} /> Important
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
            <CheckCircle size={20} /> Completed
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
            <Plus size={20} /> New List
          </li>
        </ul>

      </aside>

      {/* Main content */}
      <main className="flex-1 bg-white p-6">
        <h1 className="text-2xl font-bold mb-4">Today’s Tasks</h1>
        <form className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Add a new task..."
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
          {["Finish homework", "Buy groceries", "Workout"].map((task, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-100 rounded-lg flex items-center justify-between shadow-sm"
            >
              <span>{task}</span>
              <button className="text-sm text-red-500 hover:underline">Delete</button>
            </div>
          ))}
        </div>


      </main>
    </div>
  );
};

export default Dashboard;
