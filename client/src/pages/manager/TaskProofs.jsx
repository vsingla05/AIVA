import { useEffect, useState } from "react";
import api from "../../components/auth/api";

/* -------------------- BADGE -------------------- */
const StatusBadge = ({ status }) => {
  const styles = {
    READY_FOR_REVIEW: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status?.replaceAll("_", " ")}
    </span>
  );
};

/* -------------------- MODAL -------------------- */
const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */
export default function TaskProofs() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rejectModal, setRejectModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* -------------------- FETCH -------------------- */
  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const res = await api.get("/task/send-proofs");
        setTasks(res.data.tasks || []);
      } catch (err) {
        console.error("Failed to fetch task proofs");
      } finally {
        setLoading(false);
      }
    };
    fetchProofs();
  }, []);

  /* -------------------- MANAGER ACTION -------------------- */
  const managerAction = async (task, action) => {
    try {
      setSubmitting(true);

      await api.post(
        `/task/manager-action/${task.taskId}/${task.employeeId}`,
        { action, reason }
      );

      setTasks((prev) => prev.filter((t) => t.taskId !== task.taskId));
      setRejectModal(false);
      setReason("");
    } catch (err) {
      alert("Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading approvals…</div>;
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="text-sm text-gray-500">
          Review submitted task proofs
        </p>
      </div>

      {/* EMPTY */}
      {!tasks.length && (
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
          No tasks pending review
        </div>
      )}

      {/* TASK LIST */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.taskId}
            className="bg-white rounded-2xl shadow-sm border p-5 flex justify-between items-center"
          >
            {/* LEFT */}
            <div>
              <h3 className="font-semibold text-gray-900">
                {task.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Employee: <span className="font-medium">{task.employee.name}</span>
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              <StatusBadge status={task.proof.status} />

              {/* VIEW */}
              {task.proof.file && (
                <a
                  href={task.proof.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  View
                </a>
              )}

              {/* ACCEPT */}
              <button
                onClick={() => managerAction(task, "accept")}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
              >
                Accept
              </button>

              {/* REJECT */}
              <button
                onClick={() => {
                  setSelectedTask(task);
                  setRejectModal(true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* REJECT MODAL */}
      <Modal
        open={rejectModal}
        title="Reject Task Proof"
        onClose={() => setRejectModal(false)}
      >
        <textarea
          rows="4"
          placeholder="Reason for rejection"
          className="w-full border rounded-lg p-3 text-sm"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setRejectModal(false)}
            className="px-4 py-2 bg-gray-100 rounded-lg"
          >
            Cancel
          </button>

          <button
            disabled={!reason || submitting}
            onClick={() => managerAction(selectedTask, "reject")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
          >
            {submitting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
