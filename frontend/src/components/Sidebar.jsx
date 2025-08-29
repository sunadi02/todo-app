import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ListTodo, Star, Check, Plus, LogOut, Pencil, Trash2 } from "lucide-react";
import API from "../api";
import Todo from "../../src/assets/todo.jpg";

const MIN_WIDTH = 260;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 350;

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
  }, [setLists]);

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
  }, [contextMenu, setContextMenu]);

  // resizer logic
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



  return (
    <aside
      ref={sidebarRef}
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gradient-to-b from-[#f6f7f9] to-[#5faeb6]/20 p-6 flex flex-col z-30 transition-all duration-300 ${
        isSidebarOpen ? '' : 'w-0 overflow-hidden'
      }`}
      style={{
        width: isSidebarOpen ? sidebarWidth : 0,
        minWidth: isSidebarOpen ? MIN_WIDTH : 0,
        maxWidth: isSidebarOpen ? MAX_WIDTH : 0,
        boxShadow: isSidebarOpen ? '4px 0 6px -1px rgba(50, 58, 69, 0.07)' : 'none',
        transition: 'width 0.3s'
      }}
      aria-label="Sidebar navigation"
    >
      
      {isSidebarOpen && (
        <div
          className="absolute top-0 right-0 h-full w-2 cursor-ew-resize z-40"
          style={{ userSelect: "none" }}
          onMouseDown={handleMouseDown}
        />
      )}

      
      <div className="flex items-center gap-3 mb-8 mt-12 ml-4">
        <img
          src={Todo}
          alt="TaskFlow Logo"
          className="h-8 w-8 object-contain"
        />
        <h1 className="text-2xl font-bold text-[#323a45]">TaskFlow</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto ml-4">
  <h2 className="text-xl font-bold mb-4 text-[#3f6184]">My Lists</h2>
  <ul className="space-y-2 text-[#323a45]">
          <li
            className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
              activeFilter === 'all' ? 'bg-[#5faeb6]/30 text-[#3f6184]' : 'hover:text-[#3f6184] hover:bg-[#5faeb6]/20'
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
              activeFilter === 'important' ? 'bg-[#5faeb6]/30 text-[#3f6184]' : 'hover:text-[#3f6184] hover:bg-[#5faeb6]/20'
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
              activeFilter === 'completed' ? 'bg-[#5faeb6]/30 text-[#3f6184]' : 'hover:text-[#3f6184] hover:bg-[#5faeb6]/20'
            }`}
            onClick={() => {
              setFilter("completed");
              navigate("/dashboard");
            }}
          >
            <Check size={20} /> Completed
          </li>

          <hr className="border-gray-300 my-4" />
  <hr className="border-[#778899] my-4" />

          {lists.map((listName) => (
            <li
              key={listName._id}
              className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
                currentListFilter === listName.title ? 'bg-[#5faeb6]/30 text-[#3f6184]' : 'hover:text-[#3f6184] hover:bg-[#5faeb6]/20'
              }`}
              onClick={() => navigate(`/list/${encodeURIComponent(listName.title)}`)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ visible: true, x: e.pageX, y: e.pageY, list: listName });
              }}
              aria-label={`List: ${listName.title}`}
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
                className="border border-[#3f6184] px-2 py-1 rounded w-full text-[#323a45] bg-[#f6f7f9] placeholder-[#778899]"
                placeholder="Enter list name"
                aria-label="New list name"
              />
            </form>
          ) : (
            <li
              className="flex items-center gap-2 cursor-pointer hover:text-[#3f6184] hover:bg-[#5faeb6]/20 p-2 rounded mt-4"
              onClick={() => setShowNewListInput(true)}
              aria-label="Add new list"
            >
              <Plus size={20} /> New List
            </li>
          )}
        </ul>
      </div>

      
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col">
        <div className="mb-2">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="flex items-center gap-2 w-full text-left text-red-500 hover:text-red-700 p-2 rounded hover:bg-[#f6f7f9]"
            aria-label="Logout"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        <div className="w-full">
          <hr className="border-t border-[#e6eef0] my-2" />
        </div>

        <div className="mt-2 text-xs text-[#778899] ml-1">
          © {new Date().getFullYear()} TaskFlow
        </div>
      </div>

      
      {contextMenu.visible && (
        <div
          className="absolute bg-[#f6f7f9] border border-[#778899] rounded shadow-md z-50 p-2 space-y-2"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          onClick={() => setContextMenu({ ...contextMenu, visible: false })}
        >
          <button
            className="block w-full text-left hover:bg-[#5faeb6]/20 px-6 py-1 text-[#323a45]"
            onClick={() => {
              const newTitle = prompt("Enter new list name:", contextMenu.list.title);
              if (newTitle?.trim()) {
                handleRenameList(contextMenu.list, newTitle.trim());
              }
            }}
            aria-label="Rename list"
          >
            <div className="flex items-center gap-2">
              <Pencil size={15} /> <span>Rename List</span>
            </div>
          </button>

          <button
            className="block w-full text-left hover:bg-red-100 px-6 py-1 text-red-600"
            onClick={() => handleDeleteList(contextMenu.list)}
            aria-label="Delete list"
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