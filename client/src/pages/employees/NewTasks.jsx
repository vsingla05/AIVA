import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../components/auth/api";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
  Search,
  LayoutGrid,
  ListTodo,
  Layers,
  History,
  ChevronRight
} from "lucide-react";

export default function NewTasks() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/employee/all-tasks").then(res => {
      setStats(res.data.stats || {});
      setTasks(res.data.tasks || []);
      setLoading(false);
    });
  }, []);

  const activeTasks = tasks.filter(t => t.status !== "COMPLETED");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");
  const focusTask = [...activeTasks].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  )[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">

      {/* ───────── HEADER ───────── */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <LayoutGrid size={18} />
          </div>
          <h1 className="text-xl font-black">Tasks Intelligence</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search tasks…"
              className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm outline-none w-72"
            />
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-72px)]">

        {/* ───────── LEFT SIDEBAR ───────── */}
        <aside className="w-72 bg-white border-r border-slate-200 p-6 space-y-10 shrink-0">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
              Quick Filters
            </h3>
            <div className="space-y-2">
              <FilterTab label="All Tasks" count={tasks.length} icon={<ListTodo size={16} />} active />
              <FilterTab label="In Progress" count={activeTasks.length} icon={<Clock size={16} />} />
              <FilterTab label="Completed" count={completedTasks.length} icon={<CheckCircle size={16} />} />
              <FilterTab label="At Risk" count={stats.delayedTasks || 0} icon={<AlertTriangle size={16} />} />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
              Capacity
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 mb-2">Weekly Load</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-2xl font-black">{activeTasks.length}</span>
                <span className="text-xs text-slate-400 pb-1">/ 10 tasks</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600"
                  style={{ width: `${(activeTasks.length / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* ───────── MAIN CONTENT (EXPANDED) ───────── */}
        <section className="flex-1 p-10 space-y-12 overflow-y-auto">

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Metric label="Total" value={stats.totalTaskAssigned} icon={<Layers size={18} />} />
            <Metric label="Closed" value={stats.completedTasks} icon={<CheckCircle size={18} />} />
            <Metric label="Delayed" value={stats.delayedTasks} icon={<AlertTriangle size={18} />} />
            <Metric label="Rejected" value={stats.rejectedTasks} icon={<History size={18} />} />
          </div>

          {/* CURRENT FOCUS */}
          <div className="space-y-4 max-w-4xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Current Focus
            </h3>

            {focusTask ? (
              <TaskRow task={focusTask} navigate={navigate} primary />
            ) : (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                Workspace is clear
              </div>
            )}
          </div>

          {/* ACTIVE TASKS */}
          <div className="space-y-4 max-w-5xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Active Tasks
            </h3>
            {activeTasks.map(task => (
              <TaskRow key={task._id} task={task} navigate={navigate} />
            ))}
          </div>

          {/* COMPLETED */}
          {completedTasks.length > 0 && (
            <div className="space-y-4 max-w-5xl opacity-80">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Recently Completed
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedTasks.slice(0, 4).map(task => (
                  <div
                    key={task._id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between"
                  >
                    <span className="font-bold truncate">{task.title}</span>
                    <CheckCircle size={14} className="text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* ───────── HELPERS ───────── */

function TaskRow({ task, navigate, primary }) {
  return (
    <div
      onClick={() => navigate(`/task/${task._id}/action`)}
      className={`bg-white border rounded-2xl p-6 flex items-center justify-between cursor-pointer transition ${
        primary
          ? "border-indigo-400 shadow-lg"
          : "border-slate-200 hover:shadow-md"
      }`}
    >
      <div>
        <h3 className={`font-black ${primary ? "text-lg" : "text-base"}`}>
          {task.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <CalendarIcon size={12} />
          Due {new Date(task.dueDate).toLocaleDateString()}
        </p>
      </div>
      <ChevronRight className="text-slate-400" />
    </div>
  );
}

function FilterTab({ label, count, icon, active }) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${
        active ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <span className="text-xs font-black opacity-40">{count}</span>
    </div>
  );
}

function Metric({ label, value, icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="text-xl font-black">{value ?? 0}</p>
      </div>
    </div>
  );
}
