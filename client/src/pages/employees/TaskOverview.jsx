import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../components/auth/api";

/* ---------- Small UI ---------- */
const Badge = ({ children }) => (
  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
    {children}
  </span>
);

const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* ---------- Main ---------- */
export default function TaskOverview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phaseModal, setPhaseModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [proofModal, setProofModal] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [busy, setBusy] = useState(false);

  /* ---------- Fetch ---------- */
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/employee/task/${id}`);
        setTask(res.data.task);
      } catch {
        setTask(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  }

  if (!task) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Task not found</div>;
  }

  const phases = task.phases || [];
  const completed = phases.filter(p => p.status === "DONE").length;
  const progress = phases.length ? Math.round((completed / phases.length) * 100) : 0;
  const canSubmitProof = phases.every(p => p.status === "DONE");

  /* ---------- Actions ---------- */
  const completePhase = async () => {
    try {
      setBusy(true);
      const res = await api.post(`/task/${id}/phase/${selectedPhase._id}`);
      setTask(res.data.task || res.data);
      setPhaseModal(false);
    } finally {
      setBusy(false);
    }
  };

  const submitProof = async () => {
    if (!proofFile) return;
    try {
      setBusy(true);
      const form = new FormData();
      form.append("file", proofFile);
      await api.post(`/task/${id}/finalSubmit`, form);
      navigate("/dashboard");
    } finally {
      setBusy(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gray-50 px-8 py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

        {/* ================= LEFT ================= */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Due {new Date(task.dueDate).toLocaleDateString()} • Assigned by{" "}
              <span className="font-medium text-gray-700">
                {task.assignedBy?.name || "HR"}
              </span>
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              {task.description}
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-gray-800 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}% completed</p>
          </div>

          {/* Phases */}
          <div className="grid sm:grid-cols-2 gap-4">
            {phases.map(phase => (
              <div
                key={phase._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{phase.title}</h4>
                    <p className="text-xs text-gray-500">
                      Due {new Date(phase.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  {phase.status === "DONE" ? (
                    <Badge>Completed</Badge>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPhase(phase);
                        setPhaseModal(true);
                      }}
                      className="text-xs px-3 py-1 rounded-md bg-gray-900 text-white hover:bg-black"
                    >
                      Complete
                    </button>
                  )}
                </div>

                {phase.description && (
                  <p className="text-sm text-gray-600 mt-2">{phase.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 h-fit">

          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <Badge>{task.status}</Badge>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Priority</p>
            <Badge>{task.priority || "NORMAL"}</Badge>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Task ID</p>
            <p className="font-mono text-sm text-gray-700">#{task._id}</p>
          </div>

          <button
            disabled={!canSubmitProof}
            onClick={() => setProofModal(true)}
            className={`w-full py-2.5 rounded-lg text-sm font-medium ${
              canSubmitProof
                ? "bg-gray-900 text-white hover:bg-black"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Submit Final Proof
          </button>
        </div>
      </div>

      {/* Phase Modal */}
      <Modal open={phaseModal} title="Complete Phase" onClose={() => setPhaseModal(false)}>
        <p className="text-sm text-gray-700 mb-4">
          Mark <b>{selectedPhase?.title}</b> as completed?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setPhaseModal(false)} className="px-4 py-2 bg-gray-100 rounded-md">
            Cancel
          </button>
          <button
            onClick={completePhase}
            disabled={busy}
            className="px-4 py-2 bg-gray-900 text-white rounded-md"
          >
            Confirm
          </button>
        </div>
      </Modal>

      {/* Proof Modal */}
      <Modal open={proofModal} title="Submit Final Proof" onClose={() => setProofModal(false)}>
        <input type="file" onChange={e => setProofFile(e.target.files[0])} />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={() => setProofModal(false)} className="px-4 py-2 bg-gray-100 rounded-md">
            Cancel
          </button>
          <button
            onClick={submitProof}
            disabled={busy}
            className="px-4 py-2 bg-gray-900 text-white rounded-md"
          >
            Submit
          </button>
        </div>
      </Modal>
    </div>
  );
}
