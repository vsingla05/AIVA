import React, { useEffect, useState } from "react";
import api from "../../auth/api";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function EmployeeTaskAction({ taskId, initialStatus, initialRejectionReason }) {
  const [task, setTask] = useState(null);
  const [status, setStatus] = useState(initialStatus || "PENDING");
  const [reason, setReason] = useState(initialRejectionReason || "");
  const [showReason, setShowReason] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const user = useSelector((state) => state.auth.userDetails);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get("/task/latest");
        setTask(res.data.task);
        setStatus(res.data.task.status);
        console.log(task)
      } catch {
        setMsg("Could not fetch task.");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, []);

  useEffect(() => {
    setStatus(initialStatus || "PENDING");
    setReason(initialRejectionReason || "");
  }, [initialStatus, initialRejectionReason]);

  const handleAccept = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await api.post(`/employee/task/${taskId}/accept`);
      setStatus("ACCEPTED");
      setMsg("Task accepted successfully.");
      navigate(`/task-overview/${taskId}`, {
        state: { task: res.data.task },
      });
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to accept task.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setMsg("Please provide a reason for rejection.");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const res = await api.post(`/employee/task/${taskId}/reject`, { reason });
      setStatus("REJECTED");
      setMsg("Task rejected.");
      navigate("/");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to reject task.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "ACCEPTED")
    return (
      <div className="p-4 rounded bg-green-50 border border-green-200 text-green-700 max-w-3xl mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2">Task Accepted</h2>
        <p>You have accepted this task.</p>
      </div>
    );

  if (status === "REJECTED")
    return (
      <div className="p-4 rounded bg-red-50 border border-red-200 text-red-700 max-w-3xl mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2">Task Rejected</h2>
        <p>You have rejected this task.<br />
        <span className="font-semibold">Reason:</span> {reason}</p>
      </div>
    );

  if (loading) return <p>Loading...</p>;
  if (!task) return <p className="text-red-600">No task found.</p>;

  return (
    <div className="min-h-[80vh] bg-gray-50 py-10 px-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-200"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black">{task.title}</h1>
            <div className="flex items-center gap-4 text-gray-700 mt-2">
              <span className="text-sm font-semibold">Due Date:</span>
              <span className="bg-gray-100 text-black px-3 py-1 rounded-lg">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-xs text-gray-500">Assigned by: <span className="font-semibold">{task.assignedBy?.name || "HR"}</span></span>
            <span className="text-xs text-gray-500">Task ID: <span className="font-mono">{task._id?.slice(-6) || "N/A"}</span></span>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-4 border-gray-200" />

        {/* Instructions/Context */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Instructions</h2>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>Review the task details carefully before taking action.</li>
            <li>Once you accept or reject, you cannot change your decision.</li>
            <li>If you reject, please provide a clear reason for transparency.</li>
            <li>Download the attached file for full task details if available.</li>
          </ul>
        </div>

        {/* OPEN BUTTON */}
        {!detailsOpen && (
          <button
            className="mt-4 px-6 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition"
            onClick={() => setDetailsOpen(true)}
          >
            Open Task Details
          </button>
        )}

        {/* DETAILS */}
        {detailsOpen && (
          <>
            {/* PRIORITY */}
            <div className="flex items-center gap-4 text-gray-700 mb-2">
              <span className="text-sm font-semibold">Priority:</span>
              <span className="bg-gray-200 text-black px-3 py-1 rounded-lg uppercase">
                {task.priority}
              </span>
            </div>

            {/* ATTACHED FILE */}
            {task.pdfUrl && (
              <div className="mb-2">
                <a
                  href={task.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition"
                >
                  📄 View Attached File
                </a>
              </div>
            )}

            {/* DESCRIPTION */}
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-800 mb-1">Description</h3>
              <p className="text-gray-800">{task.description}</p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mt-8">
              <button
                onClick={handleAccept}
                className="flex-1 px-6 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition"
                disabled={loading}
              >
                Accept
              </button>
              <button
                onClick={() => setShowReason(true)}
                className="flex-1 px-6 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-black transition"
                disabled={loading}
              >
                Reject
              </button>
            </div>
          </>
        )}

        {/* REJECT REASON INPUT */}
        {showReason && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-2 text-black">Reason for Rejection</h2>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 mt-3"
              rows="4"
              placeholder="Write your reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded-lg"
                onClick={() => setShowReason(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
                disabled={loading}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        )}

        {/* Error/Info Message */}
        {msg && (
          <div className="mt-4 text-sm text-red-600">{msg}</div>
        )}
      </motion.div>
    </div>
  );
}
