import React, { useEffect, useState } from "react";
import api from "../../auth/api";

export default function NewTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setMsg("");
      try {
        const res = await api.get("/employee/tasks");
        setTasks(res.data.tasks || []);
      } catch (err) {
        setMsg("Could not fetch tasks.");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;
  if (msg) return <p className="p-4 text-red-600">{msg}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Your Tasks</h1>
      <div className="grid gap-4">
        {tasks.length === 0 && (
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-gray-500">
            No tasks found.
          </div>
        )}
        {tasks.map((task) => (
          <div
            key={task._id}
            className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-gray-900">{task.title}</div>
              <div className="text-sm text-gray-500 mt-1">
                Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"} • {task.status}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/employee/task/${task._id}`}
                className="px-3 py-1 rounded-md bg-gray-900 text-white text-sm"
              >
                Open
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
