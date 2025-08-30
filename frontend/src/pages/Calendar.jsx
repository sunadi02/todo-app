import React, { useEffect, useState } from 'react';
import API from '../api';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import TaskDetailPanel from '../components/TaskDetailPanel';
// ...existing imports
import { useNavigate } from 'react-router-dom';

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// return local yyyy-mm-dd for a Date instance (uses local timezone)
function localISODate(d) {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// create a Date at local midnight from a yyyy-mm-dd string
function dateFromLocalISO(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const Calendar = ({ user, setUser }) => {
  const [current, setCurrent] = useState(new Date());
  const [tasksByDate, setTasksByDate] = useState({});
  const [totalTasks, setTotalTasks] = useState(0);
  const [nextTask, setNextTask] = useState(null);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const toggleSidebar = () => setIsSidebarOpen(s => !s);

  // sidebar & lists state (reused by Sidebar)
  const [filter, setFilter] = useState('all');
  const [lists, setLists] = useState([]);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [currentListFilter, setCurrentListFilter] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, list: null });

  // right panel (task detail / create)
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [expanded, setExpanded] = useState(false);


  const fetchForMonth = async (date) => {
    try {
      const start = startOfMonth(date).toISOString();
      const end = endOfMonth(date).toISOString();
      const res = await API.get(`/api/tasks/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      const map = {};
      res.data.forEach(t => {
  if (!t.dueDate) return;
  // use local date string to avoid UTC shift issues
  const parsed = new Date(t.dueDate);
  const d = localISODate(parsed);
        map[d] = map[d] || [];
        map[d].push(t);
      });
      setTasksByDate(map);
      setTotalTasks(res.data.length || 0);

      // find next upcoming task in this range
      const now = new Date();
      const sorted = res.data
        .filter(t => t.dueDate && new Date(t.dueDate) >= now)
        .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
      setNextTask(sorted.length ? sorted[0] : null);
    } catch (err) {
      console.error('Failed to load calendar tasks', err);
    }
  };

  useEffect(() => { fetchForMonth(current); }, [current]);

  const prevMonth = () => setCurrent(c => new Date(c.getFullYear(), c.getMonth() -1, 1));
  const nextMonth = () => setCurrent(c => new Date(c.getFullYear(), c.getMonth() +1, 1));

  // build calendar grid
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  // handlers for selecting, creating, updating, deleting tasks
  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail;
      if (detail && detail._id) {
        handleSelectTask(detail._id);
      }
    };
    window.addEventListener('open-task', handler);
    return () => window.removeEventListener('open-task', handler);
  }, [current]);

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
  
  const handleSelectTask = async (id) => {
    try {
      const res = await API.get(`/api/tasks/${id}`);
      setSelectedTask(res.data);
      setShowPanel(true);
      setNewTaskDate(null);
    } catch (err) {
      console.error('Failed to open task', err);
    }
  };

  const updateTaskField = async (field, value) => {
    if (!selectedTask) return;
    try {
      const updated = { ...selectedTask, [field]: value };
      const res = await API.put(`/api/tasks/${selectedTask._id}`, updated);
      setSelectedTask(res.data);
      fetchForMonth(current);
      window.dispatchEvent(new Event('tasks-updated'));
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/api/tasks/${id}`);
      setShowPanel(false);
      setSelectedTask(null);
      fetchForMonth(current);
      window.dispatchEvent(new Event('tasks-updated'));
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const handleDateClick = (date) => {
    const iso = localISODate(date);
    // disallow creating tasks on past dates (only today and future allowed)
    const todayIso = localISODate(new Date());
    if (iso < todayIso) {
      // ignore clicks on past dates
      return;
    }
    setNewTaskDate(iso);
    setNewTaskTitle('');
    setSelectedTask(null);
    setShowPanel(true);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle || !newTaskDate) return;
    // validate no past dates
    const todayIso = localISODate(new Date());
    if (newTaskDate < todayIso) return;
    try {
      const due = dateFromLocalISO(newTaskDate); // local midnight
      await API.post('/api/tasks', { title: newTaskTitle, dueDate: due.toISOString(), completed: false, isImportant: false, priority: 'Medium', steps: [] });
      setShowPanel(false);
      setNewTaskDate(null);
      setNewTaskTitle('');
      fetchForMonth(current);
      window.dispatchEvent(new Event('tasks-updated'));
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  return (
  <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-200 to-teal-50">
      {/* Mobile Sidebar Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="text-2xl fixed top-4 left-4 z-40 p-2 px-4 rounded-md bg-slate-700 text-white sidebar-toggle-button"
          aria-label="Toggle sidebar"
        >
          {/* simple menu icon */}
          ☰
        </button>
      )}

      {/* Sidebar wrapper to match Dashboard layout and avoid covering main content */}
      <div
        className={`fixed top-0 left-0 h-full z-30 duration-300 bg-white shadow-lg sidebar-container
          ${isSidebarOpen ? ' w-64' : '-translate-x-0 w-0 overflow-hidden'}
          md:relative md:w-64 md:overflow-visible`}
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

      {/* Main container (matches Dashboard): flex column so TopNavbar sits above content and content shifts when sidebar visible) */}
      <div className={`flex-1 w-auto sm:w-auto sm:m-10 flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
        <TopNavbar user={user} setUser={setUser} navbarHeight="h-16 md:h-20" />

  <main className="flex-1 p-4 pt-16 md:pt-20 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#2f9ea5]">{current.toLocaleString('default', { month: 'long' })} {current.getFullYear()}</h2>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={prevMonth} className="px-3 py-1 bg-white hover:bg-teal-50 rounded shadow text-[#2f9ea5]">Prev</button>
              <button onClick={nextMonth} className="px-3 py-1 bg-white rounded shadow hover:bg-teal-50 text-[#2f9ea5]">Next</button>
              <button onClick={() => setExpanded(e => !e)} className=" hover:bg-teal-50 px-3 py-1 bg-white rounded shadow text-[#2f9ea5]">
                {expanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex w-full sm:w-auto gap-3 flex-col sm:flex-row">
              <div className="bg-white rounded px-3 py-2 shadow flex-1 text-center sm:text-left">
                <div className="text-base text-slate-500">Total this month</div>
                <div className="text-lg font-bold">{totalTasks}</div>
              </div>
              <div className="bg-white rounded px-3 py-2 shadow  text-center sm:text-left">
                <div className="text-base text-slate-500">Next due</div>
                <div className="text-base text-slate-700">{nextTask ? `${nextTask.title} — ${new Date(nextTask.dueDate).toLocaleString()}` : '—'}</div>
              </div>
            </div>
            <div className="w-full sm:w-auto flex justify-start sm:justify-end">
              <button onClick={() => navigate('/dashboard')} className="text-base px-3 py-2 bg-white rounded shadow hover:bg-teal-50">Back to Dashboard</button>
            </div>
          </div>

          <div className={`grid grid-cols-7 gap-2 text-lg ${expanded ? 'w-full' : ''}`}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center font-medium">{d}</div>
            ))}

            {cells.map((cell, idx) => {
              if (!cell) return <div key={idx} className={`${expanded ? 'h-40 md:h-52' : 'h-20 md:h-28'} bg-white rounded p-2 opacity-60`}></div>;
              const iso = localISODate(cell);
              const todayIso = localISODate(new Date());
              const isPast = iso < todayIso;
              const items = tasksByDate[iso] || [];
              const maxItems = expanded ? 6 : 3;
              return (
                <div
                  key={iso}
                  className={`${expanded ? 'h-40 md:h-52' : 'h-20 md:h-28'} bg-white rounded p-2 shadow-sm flex flex-col justify-start ${isPast ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => { if (!isPast) handleDateClick(cell); }}
                >
                  <div className="text-xs text-slate-500">{cell.getDate()}</div>
                  <div className="mt-1 flex-1 overflow-auto">
                      {items.slice(0,maxItems).map(it => (
                      <div key={it._id} className="text-base py-0.5 px-1 rounded mb-1 bg-[#e6f7f6] text-slate-700" onClick={(e) => { e.stopPropagation(); handleSelectTask(it._id); }}>
                        {it.title}
                      </div>
                    ))}
                    {items.length > maxItems && <div className="text-xs text-slate-400 mt-1">+{items.length - maxItems} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Right panel: either edit selected task or create new */}
        {showPanel && (
          <div className="fixed right-0 top-20 bottom-0 z-50">
            {selectedTask ? (
              <TaskDetailPanel
                selectedTask={selectedTask}
                setSelectedTask={setSelectedTask}
                updateTaskField={updateTaskField}
                handleDeleteTask={handleDeleteTask}
                setShowPanel={setShowPanel}
              />
            ) : (
              <div className="bg-white w-80 p-4 shadow rounded-l">
                <h3 className="font-semibold mb-2">New task — {newTaskDate}</h3>
                <input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Task title" className="w-full border px-2 py-1 rounded mb-2" />
                <div className="flex gap-2">
                  <button onClick={handleCreateTask} className="px-3 py-1 bg-[#5faeb6] text-white rounded">Create</button>
                  <button onClick={() => { setShowPanel(false); setNewTaskDate(null); }} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
