import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../components/auth/api";

/* ---------------- Status Badge ---------------- */

const StatusBadge = ({ status }) => {
  const styles = {
    TODO: "bg-blue-50 text-blue-700",
    PENDING: "bg-yellow-50 text-yellow-700",
    ACCEPTED: "bg-green-50 text-green-700",
    REJECTED: "bg-red-50 text-red-700",
    COMPLETED: "bg-purple-50 text-purple-700",
  };

  const value = status?.toUpperCase() || "N/A";

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
        styles[value] || "bg-gray-100 text-gray-700"
      }`}
    >
      {value}
    </span>
  );
};

/* ---------------- Main Component ---------------- */

export default function TaskAction() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  /* ---------------- Fetch Task ---------------- */

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/employee/task/${id}`);
        setTask(res.data.task);
      } catch (err) {
        console.error("Failed to fetch task", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  /* ---------------- Unified Accept / Reject ---------------- */

  const submitAction = useCallback(
    async (action) => {
      try {
        if (action === "REJECT" && !reason.trim()) {
          alert("Please provide a rejection reason");
          return;
        }

        setActionLoading(true);

        const payload =
          action === "REJECT"
            ? { action: "REJECT", reason }
            : { action: "ACCEPT" };

        const res = await api.post(`/task/action/${id}`, payload);

        /* ---------- ACCEPT FLOW ---------- */
        if (action === "ACCEPT") {
          navigate(`/employee/task/${id}`);
          return;
        }

        /* ---------- REJECT FLOW ---------- */
        if (action === "REJECT") {
          if (res.data?.success === true) {
            alert("Task rejected successfully");
            navigate("/dashboard");
          } else {
            alert("Reassign task");
          }
        }
      } catch (err) {
        alert(err.response?.data?.message || "Action failed");
      } finally {
        setActionLoading(false);
      }
    },
    [id, navigate, reason]
  );

  /* ---------------- States ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading task…
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Task not found
      </div>
    );
  }

  const canAct = ["TODO", "PENDING"].includes(task.status);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 flex justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

        {/* ================= LEFT PANEL ================= */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {task.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Due {new Date(task.dueDate).toLocaleDateString()} • Assigned by{" "}
              <span className="font-medium text-gray-700">
                {task.assignedBy?.name || "HR"}
              </span>
            </p>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Description
            </h3>
            <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-4 leading-relaxed">
              {task.description}
            </div>
          </div>

          {/* Attachment */}
          {task.pdfUrl && (
            <div className="mt-5">
              <a
                href={task.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-black transition"
              >
                View Attachment
              </a>
            </div>
          )}

          {/* ACTION BAR */}
          {canAct && (
            <div className="mt-6 pt-4 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => submitAction("ACCEPT")}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                Accept Task
              </button>

              <button
                onClick={() => {
                  setShowReject(true);
                  setReason("");
                }}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-red-100 text-red-800 rounded-xl text-sm font-semibold hover:bg-red-200 transition disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}

          {/* Reject Reason */}
          {showReject && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for rejection…"
                className="w-full border border-red-300 rounded-lg p-2 text-sm"
                disabled={actionLoading}
              />
              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={() => setShowReject(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitAction("REJECT")}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                >
                  Submit Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5 h-fit sticky top-6">

          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <StatusBadge status={task.status} />
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Priority</p>
            <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
              {task.priority || "NORMAL"}
            </span>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Task ID</p>
            <p className="text-sm font-mono text-gray-800">
              #{task._id}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
