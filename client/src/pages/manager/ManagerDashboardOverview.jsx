// client/src/components/manager/ManagerDashboardOverview.jsx
import React from "react";
import { motion } from "framer-motion";

/* ───────────────────────────────
   Data & Config
─────────────────────────────── */
const stats = [
  { label: "Total Tasks", value: 128, trend: "+12%" },
  { label: "Completed", value: 102, trend: "+5%" },
  { label: "In Progress", value: 18, trend: "0%" },
  { label: "Delayed", value: 5, trend: "-2%" },
  { label: "Rejected", value: 3, trend: "0%" },
  { label: "Employees", value: 24, trend: "+1" },
];

const recentTasks = [
  { id: 1, title: "Finalize Q2 Budget", status: "In Progress", due: "2024-06-30", assignee: "Alice Johnson" },
  { id: 2, title: "Review Marketing Plan", status: "Completed", due: "2024-06-15", assignee: "Bob Smith" },
  { id: 3, title: "Onboard New Designer", status: "Delayed", due: "2024-06-10", assignee: "Charlie Davis" },
];

/* ───────────────────────────────
   Sub-components
─────────────────────────────── */

const StatusBadge = ({ status }) => {
  // Updated to modern "Ring" styles for crisper look
  const styles = {
    "Completed": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    "In Progress": "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
    "Delayed": "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    "Rejected": "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20",
  };

  return (
    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${styles[status] || "bg-gray-50 text-gray-600 ring-1 ring-gray-200"}`}>
      {status}
    </span>
  );
};

export default function ManagerDashboardOverview() {
  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">
      <main className="p-8 max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <section className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
            <p className="text-slate-500 mt-1">Here is what's happening with your projects today.</p>
          </div>
          <div className="flex gap-3">
             <button className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 transition-colors">
                Download Report
             </button>
             <button className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm shadow-blue-200 transition-all">
                + New Task
             </button>
          </div>
        </section>

        {/* KPI Cards Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {stats.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              // Changed from dark gradient to clean White/Slate card
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-28"
            >
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {c.label}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{c.value}</div>
                {/* Optional Trend Indicator */}
                <div className={`text-[10px] font-medium mt-1 ${c.trend.includes('+') ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {c.trend !== "0%" ? c.trend : "—"} from last month
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Recent Tasks List */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800">Recent Tasks</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              View all tasks 
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
          
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
                  {/* Icon Placeholder */}
                  <div className="mt-1 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5">
                       <p className="text-xs text-slate-500 font-medium">Due: {task.due}</p>
                       <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                       <p className="text-xs text-slate-500">{task.assignee}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <StatusBadge status={task.status} />
                  
                  {/* Minimal Action Button */}
                  <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}