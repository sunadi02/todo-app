import React from 'react';
import { Star, Check, Plus, Trash2 } from 'lucide-react';

const TaskDetailPanel = ({
  selectedTask,
  setSelectedTask,
  updateTaskField,
  handleDeleteTask,
  setShowPanel,
  panelWidth = 400
}) => {
  if (!selectedTask) return null;

  return (
    <div
      className="right-panel bg-slate-500/40 border-l border-slate-100 shadow-lg p-6 fixed right-0 top-0 h-full overflow-y-auto z-50 backdrop-blur"
      style={{ width: panelWidth }}
    >
      {/* Resizer line */}
      <div
        className="absolute left-0 top-0 h-full w-2 cursor-ew-resize z-50"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = panelWidth;

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

      {/* Panel content */}
      <div className="pl-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Task Details</h2>
          <button
            onClick={() => setShowPanel(false)}
            className="text-slate-100 hover:text-red-500 text-xl font-bold"
            title="Close"
          >
            ✖
          </button>
        </div>

        <div className="pl-2 space-y-6">
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
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-lg font-semibold bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Completion toggle and star */}
          <div className="flex items-center gap-4">
            <div
              onClick={() =>
                updateTaskField("completed", !selectedTask.completed)
              }
              className={`w-7 h-7 flex items-center justify-center border-2 rounded-full cursor-pointer transition-colors duration-200
                ${selectedTask.completed ? "bg-green-500 border-green-500" : "border-slate-300 hover:border-green-400"}`}
              title="Toggle Complete"
            >
              {selectedTask.completed && <Check size={16} className="text-white" />}
            </div>

            <Star
              size={24}
              className={`cursor-pointer transition-colors duration-200
                ${selectedTask?.isImportant ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`}
              onClick={() =>
                updateTaskField("isImportant", !selectedTask.isImportant)
              }
              title="Toggle Important"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold mb-1 block text-slate-700">Description</label>
            <textarea
              className="w-full border border-slate-200 rounded-lg p-2 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedTask.description}
              placeholder="Add a description..."
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, description: e.target.value })
              }
              onBlur={() => updateTaskField("description", selectedTask.description)}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-semibold mb-1 block text-slate-700">Priority</label>
            <select
              value={selectedTask.priority}
              onChange={(e) => updateTaskField("priority", e.target.value)}
              className="border border-slate-200 rounded-lg p-2 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-semibold mb-1 block text-slate-700">Due Date</label>
            <input
              type="date"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            <label className="text-sm font-semibold mb-1 block text-slate-700">Steps</label>
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
                    className={`w-5 h-5 rounded-full border-2 cursor-pointer flex items-center justify-center transition-colors duration-200
                      ${step.done ? "bg-green-500 border-green-500" : "border-slate-300 hover:border-green-400"}`}
                  >
                    {step.done && <Check size={13} className="text-white" />}
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
                    className="border border-slate-200 px-2 py-1 rounded-lg w-full bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
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

            <button
              type="button"
              className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
              onClick={() => {
                const newSteps = [...(selectedTask.steps || []), { text: "", done: false }];
                setSelectedTask({ ...selectedTask, steps: newSteps });
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
          setShowPanel(false);
        }}
        className="mt-8 mx-auto w-full flex items-center justify-center text-white bg-red-500 hover:bg-red-600 py-2 px-4 rounded-lg shadow transition-colors"
      >
        <Trash2 size={18} className="mr-2" /> Delete Task
      </button>
    </div>
  );
};

export default TaskDetailPanel;