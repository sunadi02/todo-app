import React, { useEffect, useRef } from 'react';
import { Star, Check, Plus, Trash2 } from 'lucide-react';

const TaskDetailPanel = ({
  selectedTask,
  setSelectedTask,
  updateTaskField,
  handleDeleteTask,
  setShowPanel,
  panelWidth = 600
}) => {
  const panelRef = useRef(null);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowPanel]);

  // Handle resizing
  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;

    const handleMouseMove = (e) => {
      const newWidth = startWidth + (startX - e.clientX);
     
      const constrainedWidth = Math.min(Math.max(newWidth, 300), 600);
      setSelectedTask(prev => ({ ...prev, panelWidth: constrainedWidth }));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (!selectedTask) return null;

  
  const responsiveWidth = window.innerWidth < 768 ? '60vw' : `${panelWidth}px`;

  return (
    <div
      ref={panelRef}
  className="right-panel bg-[#f6f7f9] border-l-4 border-[#5faeb6] shadow-lg p-4 md:p-6 fixed right-0 top-0 h-full overflow-y-auto z-50"
      style={{ width: responsiveWidth }}
    >
      
        {window.innerWidth >= 768 && (
        <div
          className="absolute left-0 top-0 h-full w-2 cursor-ew-resize z-50 hover:bg-[#5faeb6]/50"
          onMouseDown={handleMouseDown}
        />
      )}

      
      <div className="pl-2">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-[#323a45]">Task Details</h2>
          <button
            onClick={() => setShowPanel(false)}
            className="text-[#323a45] hover:text-red-600 text-xl font-bold"
            title="Close"
          >
            ✖
          </button>
        </div>

  <div className="pl-2 space-y-5 md:space-y-8">
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
            className="w-full border border-[#778899] rounded-lg px-3 py-2 text-lg md:text-xl font-semibold bg-[#f6f7f9] shadow focus:outline-none focus:ring-2 focus:ring-[#5faeb6] text-[#323a45]"
            aria-label="Task Title"
          />

          {/*completion toggle and star */}
          <div className="flex items-center gap-4">
            <div
              onClick={() =>
                updateTaskField("completed", !selectedTask.completed)
              }
            className={`w-7 h-7 md:w-7 md:h-7 flex items-center justify-center border-2 rounded-full cursor-pointer transition-colors duration-200
          ${selectedTask.completed ? "bg-[#5faeb6] border-[#5faeb6]" : "border-[#778899] hover:border-[#5faeb6]"}`}
              title="Toggle Complete"
            >
              {selectedTask.completed && <Check size={14} className="text-white" />}
            </div>

            <Star
              size={28}
              className={`cursor-pointer transition-colors duration-200
                ${selectedTask?.isImportant ? 'text-yellow-400' : 'text-[#778899] hover:text-yellow-400'}`}
              onClick={() =>
                updateTaskField("isImportant", !selectedTask.isImportant)
              }
              title={selectedTask.isImportant ? "Unmark as important" : "Mark this task as important"}
            />
          </div>

          
          <div>
            <label className="text-sm md:text-lg font-semibold mb-1 block text-[#323a45]">Description</label>
            <textarea
              className="w-full border border-[#778899] rounded-lg p-2 bg-[#f6f7f9] shadow focus:outline-none focus:ring-2 focus:ring-[#5faeb6] text-base md:text-lg text-[#323a45]"
              aria-label="Description"
              value={selectedTask.description}
              placeholder="Add a description..."
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, description: e.target.value })
              }
              onBlur={() => updateTaskField("description", selectedTask.description)}
              rows={3}
            />
          </div>

          {/*priority */}
          <div>
            <label className="text-sm md:text-lg font-semibold mb-1 block text-[#323a45]">Priority</label>
            <select
              value={selectedTask.priority}
              onChange={(e) => updateTaskField("priority", e.target.value)}
              className="border border-[#778899] rounded-lg p-2 bg-[#f6f7f9] shadow focus:outline-none focus:ring-2 focus:ring-[#5faeb6] text-base md:text-lg text-[#323a45]"
              aria-label="Priority"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/*due date */}
          <div>
            <label className="text-sm md:text-lg font-semibold mb-1 block text-[#323a45]">Due Date</label>
            <input
              type="date"
              min={new Date().toISOString().substr(0,10)}
              className="w-full border border-[#778899] rounded-lg px-3 py-2 bg-[#f6f7f9] shadow focus:outline-none focus:ring-2 focus:ring-[#5faeb6] text-base md:text-lg text-[#323a45]"
              aria-label="Due Date"
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

          {/* steps */}
          <div className="steps-container">
            <label className="text-sm md:text-lg font-semibold mb-1 block text-[#323a45] ">Steps</label>
            <ul className="space-y-2">
              {(selectedTask.steps || []).map((step, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div
                    onClick={() => {
                      const newSteps = [...selectedTask.steps];
                      newSteps[i].done = !newSteps[i].done;
                      setSelectedTask({ ...selectedTask, steps: newSteps });
                      updateTaskField("steps", newSteps);
                    }}
                    className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 cursor-pointer flex items-center justify-center transition-colors duration-200
                      ${step.done ? "bg-[#5faeb6] border-[#5faeb6]" : "border-[#778899] hover:border-[#5faeb6]"}`}
                  >
                    {step.done && <Check size={10} className="text-white" />}
                  </div>

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
                    className="border border-[#778899] px-2 py-1 rounded-lg w-full bg-[#f6f7f9] shadow focus:outline-none focus:ring-2 focus:ring-[#5faeb6] text-base md:text-lg text-[#323a45]"
                    aria-label="Step"
                    placeholder="Type a step..."
                    autoFocus={i === selectedTask.steps.length - 1 && step.text === ""}
                  />

                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 text-xl md:text-xl"
                    onClick={() => {
                      const newSteps = selectedTask.steps.filter((_, idx) => idx !== i);
                      setSelectedTask({ ...selectedTask, steps: newSteps });
                      updateTaskField("steps", newSteps);
                    }}
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="mt-2 text-sm md:text-base text-[#5faeb6] hover:underline flex items-center gap-1"
              onClick={() => {
                const newSteps = [...(selectedTask.steps || []), { text: "", done: false }];
                setSelectedTask({ ...selectedTask, steps: newSteps });
              }}
            >
              <Plus size={14} /> Add Step
            </button>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => {
          handleDeleteTask(selectedTask._id);
          setShowPanel(false);
        }}
  className="mt-6 mx-auto w-full flex items-center justify-center text-[#f6f7f9] bg-red-700 hover:bg-red-900 py-2 px-4 rounded-lg shadow transition-colors text-base md:text-lg"
      >
        <Trash2 size={16} className="mr-2" /> Delete Task
      </button>
    </div>
  );
};

export default TaskDetailPanel;