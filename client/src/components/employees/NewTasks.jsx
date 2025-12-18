// client/src/pages/NewTasks.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../auth/api";

export default function NewTasks() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    delayed: 0,
    rejected: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNewTasks = async () => {
      try {
        const res = await api.get("/employee/all-tasks");
        console.log(res.data)
        if (!res.data.success) {
          throw new Error("Failed to fetch");
        }

        setStats(res.data.stats);  
        setTasks(res.data.tasks);  
      } catch (err) {
        console.error(err);
        setError("Unable to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchNewTasks();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading tasks...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-8">

      {/* ===== TOP STATS ===== */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={stats.totalTaskAssigned} />
        <StatCard label="Completed" value={stats.completedTasks} />
        <StatCard label="Delayed" value={stats.delayedTasks} />
        <StatCard label="Rejected" value={stats.rejectedTasks} />
      </section>

      {/* ===== TASK LIST ===== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">New Tasks</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-6 text-sm text-gray-500">
            No new tasks available.
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((t) => (
              <div
                key={t._id}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Due {new Date(t.dueDate).toLocaleDateString()} • {t.status}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/task/${t._id}/action`)}
                  className="px-4 py-1.5 rounded-md bg-gray-900 text-white text-sm hover:bg-black transition"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ===== Reusable Stat Card ===== */
function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-2">
        {value}
      </p>
    </div>
  );
}
