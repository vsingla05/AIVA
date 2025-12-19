// client/src/components/manager/ManagerDashboardOverview.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../components/auth/api";

/* ───────────────────────────────
   Status Badge
─────────────────────────────── */
const StatusBadge = ({ status }) => {
  const styles = {
    "Completed": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    "In Progress": "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
    "Delayed": "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    "Rejected": "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20",
  };

  return (
    <span
      className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${
        styles[status] || "bg-gray-50 text-gray-600 ring-1 ring-gray-200"
      }`}
    >
      {status}
    </span>
  );
};

export default function ManagerDashboardOverview() {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ───────────────────────────────
     Fetch Overview Data
  ─────────────────────────────── */
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get("/manager/overview");
        setStats(res.data.stats);
        setRecentTasks(res.data.recentTasks);
      } catch (err) {
        console.error("Failed to load manager overview");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Loading dashboard overview…
      </div>
    );
  }

  /* ───────────────────────────────
     Cards Mapping
  ─────────────────────────────── */
  const cards = [
    { label: "Total Tasks", value: stats.totalTasks },
    { label: "Completed", value: stats.completedTasks },
    { label: "In Progress", value: stats.inProgressTasks },
    { label: "Delayed", value: stats.delayedTasks },
    { label: "Rejected", value: stats.rejectedTasks },
    { label: "Employees", value: stats.totalEmployees },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">
      <main className="p-8 max-w-7xl mx-auto w-full">

        {/* Header */}
        <section className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Overview
            </h1>
            <p className="text-slate-500 mt-1">
              Real-time snapshot of your team and tasks
            </p>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-28"
            >
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {c.label}
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {c.value}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Recent Tasks */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800">
              Recent Tasks
            </h3>
          </div>

          {!recentTasks.length && (
            <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
              No recent tasks
            </div>
          )}

          <div className="flex flex-col gap-3">
            {recentTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md flex items-center justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    📄
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-xs text-slate-500 font-medium">
                        Due: {new Date(task.due).toLocaleDateString()}
                      </p>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <p className="text-xs text-slate-500">
                        {task.assignee}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <StatusBadge status={task.status} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
