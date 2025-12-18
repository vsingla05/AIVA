import React, { useState } from "react";
import {
  Clock,
  AlertCircle,
  TrendingUp
} from "lucide-react";

/* ---------------- MOCK DATA ---------------- */

const mockEmployees = [
  {
    _id: "e1",
    name: "Vansh Singla",
    role: "Software Developer",
    imageUrl: "https://i.pravatar.cc/150?img=11",
    currentLoad: 35,
    availability: { maxWeeklyHours: 40 }
  },
  {
    _id: "e2",
    name: "Elena U.",
    role: "Product Designer",
    imageUrl: "https://i.pravatar.cc/150?img=5",
    currentLoad: 12,
    availability: { maxWeeklyHours: 40 }
  }
];

const mockTasks = [
  {
    _id: "t1",
    title: "Dashboard UI Revamp",
    employeeId: mockEmployees[0],
    status: "READY_FOR_REVIEW",
    priority: "HIGH",
    dueDate: "2025-12-20",
    phases: [
      { status: "DONE" },
      { status: "DONE" },
      { status: "IN_PROGRESS" }
    ]
  },
  {
    _id: "t2",
    title: "API Authentication Fix",
    employeeId: mockEmployees[1],
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    dueDate: "2025-12-18",
    phases: [
      { status: "DONE" },
      { status: "TODO" }
    ]
  },
  {
    _id: "t3",
    title: "Database Migration",
    employeeId: null,
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2025-12-25",
    phases: []
  }
];

/* ---------------- HELPERS ---------------- */

const TaskProgress = ({ phases }) => {
  if (!phases || !phases.length)
    return <span className="text-xs text-gray-400">No phases</span>;

  const done = phases.filter(p => p.status === "DONE").length;
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
          className="h-2 bg-black rounded-full"
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
    DONE: "bg-gray-100 text-gray-600"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

export default function ProjectDashboard() {
  const [activeTab, setActiveTab] = useState("ALL");

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
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

      <div className="grid grid-cols-12 gap-8">
        
        {/* LEFT: PROJECT LIST */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          
          {/* TABS */}
          <div className="flex border-b border-gray-100">
            {["ALL", "IN_PROGRESS", "COMPLETED"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === tab
                    ? "border-b-2 border-black text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* TABLE HEADER */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <div className="col-span-4">Project / Task</div>
            <div className="col-span-3">Assigned To</div>
            <div className="col-span-3">Progress</div>
            <div className="col-span-2 text-right">Deadline</div>
          </div>

          {/* TABLE BODY */}
          <div className="divide-y divide-gray-100">
            {mockTasks.map(task => (
              <div
                key={task._id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition"
              >
                {/* TASK */}
                <div className="col-span-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {task.title}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <StatusBadge status={task.status} />
                    {task.priority === "CRITICAL" && (
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Critical
                      </span>
                    )}
                  </div>
                </div>

                {/* ASSIGNEE */}
                <div className="col-span-3">
                  {task.employeeId ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={task.employeeId.imageUrl}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
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
                <div className="col-span-3">
                  <TaskProgress phases={task.phases} />
                </div>

                {/* DEADLINE */}
                <div className="col-span-2 text-right text-sm text-gray-500 flex items-center justify-end gap-1">
                  <Clock size={14} />
                  {task.dueDate}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: TEAM AVAILABILITY */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">
              Team Availability
            </h3>

            <div className="space-y-6">
              {mockEmployees.map(emp => {
                const percent = Math.round(
                  (emp.currentLoad / emp.availability.maxWeeklyHours) * 100
                );

                return (
                  <div key={emp._id}>
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
                        {emp.currentLoad}/{emp.availability.maxWeeklyHours}h
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
              })}
            </div>

            <button className="w-full mt-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              View All Employees
            </button>
          </div>

          {/* AI INSIGHTS */}
          <div className="bg-gray-900 text-white p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} />
              <h3 className="font-semibold">AI Insights</h3>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Vansh Singla is nearing capacity. Consider reassigning
              "Database Migration" to Elena to avoid delays.
            </p>
            <button className="w-full bg-white text-black py-2 rounded-lg text-sm font-semibold hover:bg-gray-100">
              Optimize Workload
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
