import { useEffect, useState } from "react";
import api from "../../components/auth/api";

/* -------------------- BADGE -------------------- */
const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800",
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

/* -------------------- MAIN -------------------- */
export default function Approvals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rejectModal, setRejectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* -------------------- FETCH TASKS + LEAVES -------------------- */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tasksRes, leavesRes] = await Promise.all([
          api.get("/task/send-proofs"),
          api.get("/leaves/send-pending-leaves"),
        ]);

        const taskItems =
          (tasksRes.data.tasks || []).map((t) => ({
            type: "TASK",
            ...t,
          }));

        const leaveItems =
          (leavesRes.data.leaves || []).map((l) => ({
            type: "LEAVE",
            ...l,
          }));

        setItems([...taskItems, ...leaveItems]);
      } catch (err) {
        console.error("Failed to fetch approvals");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  /* -------------------- MANAGER ACTION -------------------- */
  const managerAction = async (item, action) => {
    try {
      setSubmitting(true);

      const payload = {
        action: action.toLowerCase(), // "accept" | "reject"
      };

      // send reason ONLY for reject
      if (action === "REJECT") {
        payload.reason = reason;
      }

      if (item.type === "TASK") {
        await api.post(
          `/task/${item.taskId}/${item.employeeId}`,
          payload
        );
      }

      if (item.type === "LEAVE") {
        await api.post(
          `/leaves/${item._id}/decision`,
          payload
        );
      }

      // remove item from UI
      setItems((prev) =>
        prev.filter(
          (i) => i._id !== item._id && i.taskId !== item.taskId
        )
      );

      setRejectModal(false);
      setSelectedItem(null);
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
          Review pending tasks and leave requests
        </p>
      </div>

      {!items.length && (
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
          No pending approvals
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item._id || item.taskId}
            className="bg-white rounded-2xl shadow-sm border p-5 flex justify-between items-center"
          >
            {/* LEFT */}
            <div>
              <h3 className="font-semibold text-gray-900">
                {item.type === "TASK" ? item.title : "Leave Request"}
              </h3>

              {item.type === "TASK" ? (
                <>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    Employee: <b>{item.employee.name}</b>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm">
                    {new Date(item.startDate).toLocaleDateString()} →{" "}
                    {new Date(item.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    Days: <b>{item.days}</b> | Priority: <b>{item.priority}</b>
                  </p>
                  <p className="text-sm">
                    Employee: <b>{item.employee.name}</b>
                  </p>
                </>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              <StatusBadge status={item.status} />

              {item.type === "TASK" && item.proof?.file && (
                <a
                  href={item.proof.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm border rounded-lg"
                >
                  View
                </a>
              )}

              <button
                onClick={() => managerAction(item, "APPROVE")}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg"
              >
                Approve
              </button>

              <button
                onClick={() => {
                  setSelectedItem(item);
                  setRejectModal(true);
                }}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg"
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
        title="Reject"
        onClose={() => {
          setRejectModal(false);
          setReason("");
        }}
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
            onClick={() => {
              setRejectModal(false);
              setReason("");
            }}
            className="px-4 py-2 bg-gray-100 rounded-lg"
          >
            Cancel
          </button>

          <button
            disabled={!reason || submitting}
            onClick={() => managerAction(selectedItem, "REJECT")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
          >
            {submitting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
