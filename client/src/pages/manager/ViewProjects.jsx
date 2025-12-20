import React, { useEffect, useState } from "react";
import { Clock, AlertCircle, TrendingUp } from "lucide-react";
import api from "../../components/auth/api";

/* ---------------- HELPERS ---------------- */

const TaskProgress = ({ phases }) => {
  if (!phases || phases.length === 0) {
    return <span className="text-xs text-gray-400">No phases</span>;
  }

  const done = phases.filter((p) => p.status === "DONE").length;
  const percent = Math.round((done / phases.length) * 100);

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700">{percent}%</span>
        <span className="text-gray-400">
          {done}/{phases.length} Phases
        </span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full">
        <div
          className="h-2 bg-black rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    TODO: "bg-gray-100 text-gray-600",
    IN_PROGRESS: "bg-gray-200 text-gray-700",
    READY_FOR_REVIEW: "bg-gray-200 text-gray-700",
    DONE: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

export default function ViewProjects() {
  const [projects, setProjects] = useState([]);
  const [fallbackEmployees, setFallbackEmployees] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);

  /* ---------------- API ---------------- */

  const loadFallbackEmployees = async (taskId) => {
    try {
      setSelectedTaskId(taskId);
      const res = await api.get(`/manager/${taskId}/fallbacks`);
      setFallbackEmployees(res.data?.fallbackEmployees || []);
    } catch {
      setFallbackEmployees([]);
    }
  };

  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/manager/send-all-projects");
      const tasks = res.data?.tasks || [];

      setProjects(tasks);

      if (tasks.length > 0) {
        loadFallbackEmployees(tasks[0]._id);
      } else {
        setFallbackEmployees([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  /* ---------------- FILTER ---------------- */

  const filteredProjects = projects.filter((task) =>
    activeTab === "ALL" ? true : task.status === activeTab
  );

  /* ---------------- RENDER ---------------- */

  return (
    <div className="p-8 bg-gray-50">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Projects & Workflow
          </h1>
          <p className="text-sm text-gray-500">
            Manage assignments, track progress, and timelines
          </p>
        </div>

        <button className="bg-black text-white px-5 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition">
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL */}
        {/* LEFT PANEL */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-gray-200 flex flex-col max-h-[75vh]">
          {/* TABS (Stays Fixed at Top) */}
          <div className="flex border-b border-gray-100 flex-shrink-0">
            {["ALL", "TODO", "IN_PROGRESS", "READY_FOR_REVIEW", "DONE"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === tab
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.replace(/_/g, " ")}
                </button>
              )
            )}
          </div>

          {/* TABLE HEADER (Stays Fixed) */}
          <div className="flex gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">
            <div className="w-[28%]">Project / Task</div>
            <div className="w-[22%]">Assigned To</div>
            <div className="flex-1">Progress</div>
            <div className="w-[120px] text-right">Deadline</div>
          </div>

          {/* TASK LIST (This area scrolls) */}
          <div className="divide-y divide-gray-100 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-6 text-gray-400">Loading projects...</div>
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((task) => (
                <div
                  key={task._id}
                  onClick={() => loadFallbackEmployees(task._id)}
                  className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition
            ${selectedTaskId === task._id ? "bg-gray-100" : "hover:bg-gray-50"}
          `}
                >
                  {/* ... [Rest of your task rendering code remains the same] ... */}

                  {/* TASK TITLE */}
                  <div className="w-[28%] min-w-[220px]">
                    <p className="text-sm font-semibold text-gray-900">
                      {task.title}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <StatusBadge status={task.status} />
                    </div>
                  </div>

                  {/* ASSIGNEE */}
                  <div className="w-[22%] min-w-[180px]">
                    {task.employeeId ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={task.employeeId.imageUrl}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {task.employeeId.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {task.employeeId.role}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Unassigned
                      </span>
                    )}
                  </div>

                  {/* PROGRESS */}
                  <div className="flex-1 min-w-[140px]">
                    <TaskProgress phases={task.phases} />
                  </div>

                  {/* DEADLINE */}
                  <div className="w-[120px] text-right text-sm text-gray-500 flex items-center justify-end gap-1">
                    <Clock size={14} />
                    {task.dueDate
                      ? new Date(task.dueDate).toISOString().slice(0, 10)
                      : "--"}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-gray-400">No tasks in this section</div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Fallback Employees</h3>

            {fallbackEmployees.length > 0 ? (
              fallbackEmployees.map((emp) => {
                const percent = Math.round(
                  (emp.currentLoad / emp.maxWeeklyHours) * 100
                );

                return (
                  <div key={emp._id} className="mb-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={emp.imageUrl}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.role}</p>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-gray-700">
                        {emp.currentLoad}/{emp.maxWeeklyHours}h
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 h-1.5 rounded-full">
                      <div
                        className="h-1.5 bg-black rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400">
                No fallback employees found
              </p>
            )}
          </div>

          {/* AI INSIGHTS */}
          <div className="bg-gray-900 text-white p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} />
              <h3 className="font-semibold">AI Insights</h3>
            </div>
            <p className="text-sm text-gray-300">
              Tasks are categorized by status and fallback employees are
              dynamically selected to prevent delivery delays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
