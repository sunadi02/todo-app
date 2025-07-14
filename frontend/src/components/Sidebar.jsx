import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ListTodo, Star, Check, Plus, LogOut, Pencil, Trash2 } from "lucide-react";
import API from "../api";
import Todo from "../../src/todo.jpg";

const MIN_WIDTH = 260;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 280;

const Sidebar = ({
  filter,
  setFilter,
  lists,
  setLists,
  showNewListInput,
  setShowNewListInput,
  newListTitle,
  setNewListTitle,
  currentListFilter,
  setCurrentListFilter,
  contextMenu,
  setContextMenu,
  isSidebarOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const sidebarRef = useRef();

  const getActiveFilter = () => {
    if (location.pathname.includes('/list/')) return null;
    return filter;
  };

  const activeFilter = getActiveFilter();

  const handleDeleteList = async (list) => {
    const confirmDelete = window.confirm(`Delete list "${list.title}"?`);
    if (!confirmDelete) return;

    try {
      await API.delete(`/api/lists/${list._id}`);
      setLists((prev) => prev.filter((l) => l._id !== list._id));
      if (currentListFilter === list.title) {
        setCurrentListFilter("Default");
      }
    } catch (err) {
      console.error("Failed to delete list:", err);
    }
  };

  const handleAddList = async (title) => {
    try {
      const res = await API.post('/api/lists', { title });
      setLists(prev => [res.data, ...prev]);
      setCurrentListFilter(res.data.title);
      setShowNewListInput(false);
    } catch (err) {
      console.error("Error saving list to DB", err);
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

  const handleRenameList = async (list, newTitle) => {
    try {
      await API.put(`/api/lists/${list._id}`, { title: newTitle });
      setLists((prev) =>
        prev.map((l) =>
          l._id === list._id ? { ...l, title: newTitle } : l
        )
      );
      if (currentListFilter === list.title) {
        setCurrentListFilter(newTitle);
      }
    } catch (err) {
      console.error("Failed to rename list:", err);
    }
  };

  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [contextMenu]);

  // --- Resizer logic ---
  useEffect(() => {
    if (!isSidebarOpen) return;
    setSidebarWidth(DEFAULT_WIDTH);
  }, [isSidebarOpen]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent) => {
      const newWidth = Math.min(
        Math.max(startWidth + (moveEvent.clientX - startX), MIN_WIDTH),
        MAX_WIDTH
      );
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // --- End resizer logic ---

  return (
    <aside
      ref={sidebarRef}
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-100 to-slate-200 p-6 flex flex-col z-30 transition-all duration-300 ${
        isSidebarOpen ? '' : 'w-0 overflow-hidden'
      }`}
      style={{
        width: isSidebarOpen ? sidebarWidth : 0,
        minWidth: isSidebarOpen ? MIN_WIDTH : 0,
        maxWidth: isSidebarOpen ? MAX_WIDTH : 0,
        boxShadow: isSidebarOpen ? '4px 0 6px -1px rgba(0, 0, 0, 0.07)' : 'none',
        transition: 'width 0.3s'
      }}
    >
      {/* Resizer */}
      {isSidebarOpen && (
        <div
          className="absolute top-0 right-0 h-full w-2 cursor-ew-resize z-40"
          style={{ userSelect: "none" }}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* App Header */}
      <div className="flex items-center gap-3 mb-8">
        <img
          src={Todo}
          alt="TaskFlow Logo"
          className="h-8 w-8 object-contain"
        />
        <h1 className="text-2xl font-bold text-slate-700">TaskFlow</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-slate-700">My Lists</h2>
        <ul className="space-y-2 text-slate-700">
          <li
            className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
              activeFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'hover:text-blue-700 hover:bg-blue-100'
            }`}
            onClick={() => {
              setFilter("all");
              navigate("/dashboard");
            }}
          >
            <ListTodo size={20} /> All Tasks
          </li>
          <li
            className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
              activeFilter === 'important' ? 'bg-blue-100 text-blue-700' : 'hover:text-blue-700 hover:bg-blue-100'
            }`}
            onClick={() => {
              setFilter("important");
              navigate("/dashboard");
            }}
          >
            <Star size={20} /> Important
          </li>
          <li
            className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
              activeFilter === 'completed' ? 'bg-blue-100 text-blue-700' : 'hover:text-blue-700 hover:bg-blue-100'
            }`}
            onClick={() => {
              setFilter("completed");
              navigate("/dashboard");
            }}
          >
            <Check size={20} /> Completed
          </li>

          <hr className="border-gray-300 my-4" />

          {lists.map((listName) => (
            <li
              key={listName._id}
              className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
                currentListFilter === listName.title ? 'bg-blue-100 text-blue-700' : 'hover:text-blue-700 hover:bg-blue-100'
              }`}
              onClick={() => navigate(`/list/${encodeURIComponent(listName.title)}`)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ visible: true, x: e.pageX, y: e.pageY, list: listName });
              }}
            >
              <ListTodo size={18} /> {listName.title}
            </li>
          ))}

          {showNewListInput ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newListTitle.trim()) return;
                await handleAddList(newListTitle.trim());
              }}
              className="mt-2"
            >
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onBlur={() => setShowNewListInput(false)}
                autoFocus
                className="border px-2 py-1 rounded w-full"
                placeholder="Enter list name"
              />
            </form>
          ) : (
            <li
              className="flex items-center gap-2 cursor-pointer hover:text-blue-700 hover:bg-blue-100 p-2 rounded mt-4"
              onClick={() => setShowNewListInput(true)}
            >
              <Plus size={20} /> New List
            </li>
          )}
        </ul>
      </div>

      {/* Logout Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="flex items-center gap-2 w-full text-left text-red-500 hover:text-red-700 p-2 rounded hover:bg-white"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="absolute bg-white border rounded shadow-md z-50 p-2 space-y-2"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          onClick={() => setContextMenu({ ...contextMenu, visible: false })}
        >
          <button
            className="block w-full text-left hover:bg-gray-100 px-6 py-1"
            onClick={() => {
              const newTitle = prompt("Enter new list name:", contextMenu.list.title);
              if (newTitle?.trim()) {
                handleRenameList(contextMenu.list, newTitle.trim());
              }
            }}
          >
            <div className="flex items-center gap-2">
              <Pencil size={15} /> <span>Rename List</span>
            </div>
          </button>

          <button
            className="block w-full text-left hover:bg-red-100 px-6 py-1 text-red-600"
            onClick={() => handleDeleteList(contextMenu.list)}
          >
            <div className="flex items-center gap-2">
              <Trash2 size={15} /> <span>Delete List</span>
            </div>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;