import {React,useEffect} from "react";
import {  useNavigate } from "react-router-dom";
import { ListTodo, Star, Check, Plus, LogOut, Pencil, Trash2 } from "lucide-react";
import API from "../api";

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
}) => {
  const navigate = useNavigate();



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
        setLists(res.data); // Use the lists from DB
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
  

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-100 to-slate-200 p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-4">My Lists</h2>
        <ul className="space-y-4 text-gray-700">
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600" onClick={() => setFilter("all")}>
            <ListTodo size={20} /> All Tasks
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600" onClick={() => setFilter("important")}>
            <Star size={20} /> Important
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600" onClick={() => setFilter("completed")}>
            <Check size={20} /> Completed
          </li>
          <hr className="border-gray-400 my-4" />
          {lists.map((listName) => (
            <li
              key={listName._id}
              onClick={() => navigate(`/list/${encodeURIComponent(listName.title)}`)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ visible: true, x: e.pageX, y: e.pageY, list: listName });
              }}
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600 relative"
            >
              <ListTodo size={18} /> {listName.title}
            </li>
          ))}

          {showNewListInput ? (
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      if (!newListTitle.trim()) return;

      try {
        const res = await API.post("/api/lists", {
          title: newListTitle.trim(),
        });

        setLists((prev) => [res.data, ...prev]);
        setCurrentListFilter(newListTitle.trim());
        setShowNewListInput(false);
        setNewListTitle("");

        // Redirect to list page
        window.location.href = `/list/${encodeURIComponent(newListTitle.trim())}`;
      } catch (err) {
        console.error("Failed to save list", err);
      }
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
    className="flex items-center gap-2 cursor-pointer hover:text-blue-600 mt-4"
    onClick={() => setShowNewListInput(true)}
  >
    <Plus size={20} /> New List
  </li>
)}
        </ul>
      </div>

      

      <ul className="mt-8">
        <li
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-700"
        >
          <LogOut size={20} /> Logout
        </li>
      </ul>

      {contextMenu.visible && (
        <div
          className="absolute bg-white border rounded shadow-md z-50 p-2 space-y-2 "
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          onClick={() => setContextMenu({ ...contextMenu, visible: false })}
        >
          <button
        className="block w-full text-left hover:bg-gray-100 px-6 py-1"
        onClick={() => {
          const newTitle = prompt("Enter new list name:", contextMenu.list.title || contextMenu.list);
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
