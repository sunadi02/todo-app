import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ListTodo, Star, Check, Plus, LogOut, Pencil, Trash2, Menu } from "lucide-react";
import API from "../api";
import Todo from "../../src/assets/todo.jpg";

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
  onCollapsedChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef();

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed);
    }
  };

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

  return (
    <aside
      ref={sidebarRef}
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gradient-to-b from-[#f6f7f9] to-[#5faeb6]/20 flex flex-col z-30 transition-all duration-300 ${
        isSidebarOpen ? '' : 'w-0 overflow-hidden'
      }`}
      style={{
        width: isSidebarOpen ? (isCollapsed ? '60px' : '280px') : 0,
        padding: isSidebarOpen ? (isCollapsed ? '1rem 0.5rem' : '1.5rem') : 0,
        boxShadow: isSidebarOpen ? '4px 0 6px -1px rgba(50, 58, 69, 0.07)' : 'none',
        transition: 'width 0.3s, padding 0.3s'
      }}
      aria-label="Sidebar navigation"
    >
      
      <button
        onClick={handleToggleCollapse}
        className="mb-4 p-2 hover:bg-[#5faeb6]/20 rounded transition-colors self-start"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Menu size={20} className="text-[#323a45]" />
      </button>

      
      <div className={`flex items-center mb-6 mt-4 transition-all ${isCollapsed ? 'justify-center' : 'gap-2 ml-3'}`}>
        <img
          src={Todo}
          alt="TaskFlow Logo"
          className="h-7 w-7 object-contain"
        />
        {!isCollapsed && <h1 className="text-xl font-bold text-[#323a45]">TaskFlow</h1>}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && <h2 className="text-base font-bold mb-3 text-[#3f6184] ml-3">My Lists</h2>}
        <ul className="space-y-1.5 text-[#323a45]">
          <li
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-1.5 ml-3'} cursor-pointer p-1.5 rounded text-sm ${
              activeFilter === 'all' ? 'bg-[#5faeb6]/30 text-[#3f6184]' : 'hover:text-[#3f6184] hover:bg-[#5faeb6]/20'
            }`}
            onClick={() => {
              setFilter("all");
              navigate("/dashboard");
            }}
            title={isCollapsed ? "All Tasks" : ""}
          >
            <ListTodo size={16} /> {!isCollapsed && 'All Tasks'}
          </li>
          <li
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-1.5 ml-3'} cursor-pointer p-1.5 rounded text-sm ${
              activeFilter === 'important' ? 'bg-[#5faeb6]/30 text-[#3f6184]' : 'hover:text-[#3f6184] hover:bg-[#5faeb6]/20'
            }`}
            onClick={() => {
              setFilter("important");
              navigate("/dashboard");
            }}
            title={isCollapsed ? "Important" : ""}
          >
            <Star size={16} /> {!isCollapsed && 'Important'}
          </li>
          <li
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-1.5 ml-3'} cursor-pointer p-1.5 rounded text-sm ${
              activeFilter === 'completed' ? 'bg-[#5faeb6]/30 text-[#3f6184]' : 'hover:text-[#3f6184] hover:bg-[#5faeb6]/20'
            }`}
            onClick={() => {
              setFilter("completed");
              navigate("/dashboard");
            }}
            title={isCollapsed ? "Completed" : ""}
          >
            <Check size={16} /> {!isCollapsed && 'Completed'}
          </li>

          {!isCollapsed && <hr className="border-[#778899] my-3" />}

          {lists.map((listName) => (
            <li
              key={listName._id}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-1.5 ml-3'} cursor-pointer p-1.5 rounded text-sm ${
                currentListFilter === listName.title ? 'bg-[#5faeb6]/30 text-[#3f6184]' : 'hover:text-[#3f6184] hover:bg-[#5faeb6]/20'
              }`}
              onClick={() => navigate(`/list/${encodeURIComponent(listName.title)}`)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ visible: true, x: e.pageX, y: e.pageY, list: listName });
              }}
              aria-label={`List: ${listName.title}`}
              title={isCollapsed ? listName.title : ""}
            >
              <ListTodo size={15} /> {!isCollapsed && <span className="truncate">{listName.title}</span>}
            </li>
          ))}

          {isCollapsed ? (
            <li
              className="flex items-center justify-center cursor-pointer hover:text-[#3f6184] hover:bg-[#5faeb6]/20 p-1.5 rounded mt-3 text-sm"
              onClick={() => setShowNewListInput(true)}
              aria-label="Add new list"
              title="New List"
            >
              <Plus size={16} />
            </li>
          ) : (showNewListInput ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newListTitle.trim()) return;
                await handleAddList(newListTitle.trim());
              }}
              className="mt-2 ml-3"
            >
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onBlur={() => setShowNewListInput(false)}
                autoFocus
                className="border border-[#3f6184] px-2 py-1 rounded w-full text-sm text-[#323a45] bg-[#f6f7f9] placeholder-[#778899]"
                placeholder="Enter list name"
                aria-label="New list name"
              />
            </form>
          ) : (
            <li
              className="flex items-center gap-1.5 ml-3 cursor-pointer hover:text-[#3f6184] hover:bg-[#5faeb6]/20 p-1.5 rounded mt-3 text-sm"
              onClick={() => setShowNewListInput(true)}
              aria-label="Add new list"
            >
              <Plus size={16} /> New List
            </li>
          ))}
        </ul>
      </div>

      
      <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col">
        <div className="mb-2">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-1.5 ml-3'} w-full text-left text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-[#f6f7f9] text-sm`}
            aria-label="Logout"
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {!isCollapsed && (
          <>
            <div className="w-full">
              <hr className="border-t border-[#e6eef0] my-1.5" />
            </div>

            <div className="mt-1.5 text-xs text-[#778899] ml-1">
              © {new Date().getFullYear()} TaskFlow
            </div>
          </>
        )}
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