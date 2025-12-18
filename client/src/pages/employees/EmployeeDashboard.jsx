import React from "react";
import { motion } from "framer-motion";

/* ----------------- Dummy data ----------------- */
const dummyTasks = [
  { _id: "693d3ff24091617d351e80cd", title: "Prepare Q1 report", due: "2026-01-15", status: "In Progress" },
  { _id: "693d3ff24091617d351e80ce", title: "Design review", due: "2025-12-25", status: "New" },
  { _id: "693d3ff24091617d351e80cf", title: "Client research", due: "2026-02-01", status: "New" },
];

const dummyNotifications = [
  { id: 1, text: "HR approved your leave request", time: "2h ago" },
  { id: 2, text: "New task assigned: Design review", time: "1d ago" },
  { id: 3, text: "System maintenance scheduled", time: "3d ago" },
];

/* ----------------- Status Badge ----------------- */
function StatusBadge({ status }) {
  const map = {
    "New": "bg-blue-50 text-blue-700 border-blue-200",
    "In Progress": "bg-yellow-50 text-yellow-700 border-yellow-200",
    "Completed": "bg-green-50 text-green-700 border-green-200",
    "Delayed": "bg-orange-50 text-orange-700 border-orange-200",
    "Rejected": "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full border font-medium ${
        map[status] || "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

/* ----------------- Dashboard ----------------- */
export default function EmployeeDashboard() {
  return (
    <div className="flex-1 flex flex-col">
      <main className="p-6">

        {/* -------- Header -------- */}
        <section className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, Elena
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Your summary for today
          </p>
        </section>

        {/* -------- KPI Cards -------- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Open Tasks", value: dummyTasks.length },
            { label: "Notifications", value: dummyNotifications.length },
            { label: "Performance", value: "A−" },
          ].map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
             Topics
              transition={{ duration: 0.25 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <div className="text-sm text-gray-500">{c.label}</div>
              <div className="text-3xl font-semibold text-gray-900 mt-2">
                {c.value}
              </div>
            </motion.div>
          ))}
        </section>

        {/* -------- New Tasks -------- */}
        {/* <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">New Tasks</h3>
            <button className="text-sm text-gray-600 hover:text-gray-800">
              View all
            </button>
          </div>

          <div className="grid gap-4">
            {dummyTasks.map((t, i) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {t.title}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">
                      Due {t.due}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                </div>

                <button className="px-3 py-1 rounded-md bg-gray-900 text-white text-sm">
                  Open
                </button>
              </motion.div>
            ))}
          </div>
        </section> */}

        {/* -------- Notifications -------- */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Notifications
            </h3>
            <button className="text-sm text-gray-600 hover:text-gray-800">
              Manage
            </button>
          </div>

          <div className="space-y-2">
            {dummyNotifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex justify-between"
              >
                <div>
                  <div className="text-sm text-gray-800">{n.text}</div>
                  <div className="text-xs text-gray-500 mt-1">{n.time}</div>
                </div>
                <button className="text-sm text-gray-600 hover:text-gray-800">
                  ⋯
                </button>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
