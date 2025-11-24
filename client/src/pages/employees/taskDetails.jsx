import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../components/auth/api";

// --- Small UI components ---
const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${className}`}>
    {children}
  </span>
);

const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

const Notification = ({ notif, onClose }) => {
  if (!notif) return null;
  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className={`px-4 py-3 rounded-lg shadow-lg ${notif.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
        <div className="flex items-center gap-3">
          <div className="font-medium">{notif.title}</div>
          <div className="text-sm text-gray-700">{notif.message}</div>
          <button onClick={onClose} className="ml-3 text-gray-500">✕</button>
        </div>
      </div>
    </div>
  );
};

export default function TaskOverviewCard() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const initialTask = state?.task || null;

  const [task, setTask] = useState(initialTask);
  const [loading, setLoading] = useState(!initialTask);
  const [notif, setNotif] = useState(null);

  const [phaseModalOpen, setPhaseModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);

  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  const [isCompletingPhase, setIsCompletingPhase] = useState(false);

  // Load task if not present via navigation state
  useEffect(() => {
    if (task) return;

    const fetchTask = async () => {
      try {
        setLoading(true);
        const id = window.location.pathname.split('/').pop();
        const res = await api.get(`/task/${id}`);
        setTask(res.data.task || res.data);
      } catch (err) {
        setNotif({ type: 'error', title: 'Error', message: 'Failed to load task' });
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [task]);

  // Calculate progress
  const progress = (() => {
    const total = task?.phases?.length || 0;
    if (total === 0) return 0;

    const done = task.phases.filter((p) => !!p.completedAt).length;
    return Math.round((done / total) * 100);
  })();

  const openPhaseConfirm = (phase) => {
    if (phase.completedAt) return;
    setSelectedPhase(phase);
    setPhaseModalOpen(true);
  };

  // Mark phase complete
  const completePhase = async () => {
    try {
      setIsCompletingPhase(true);

      const res = await api.post(`/task/${task.id}/phase/${selectedPhase._id}`);
      const updated = res.data.task || res.data;

      setTask(updated);
      setNotif({ type: 'success', title: 'Phase Completed', message: `${selectedPhase.title} marked as completed.` });
      setPhaseModalOpen(false);
      setSelectedPhase(null);

    } catch (err) {
      setNotif({ type: 'error', title: 'Error', message: 'Could not complete phase.' });
    } finally {
      setIsCompletingPhase(false);
    }
  };

  // Final Proof Upload
  const handleProofChange = (e) => setProofFile(e.target.files[0]);

  const submitProof = async () => {
    if (!proofFile) {
      setNotif({ type: 'error', title: 'Missing File', message: 'Please select a file.' });
      return;
    }

    try {
      setIsSubmittingProof(true);

      const form = new FormData();
      form.append('file', proofFile);

      const res = await api.post(`/task/${task.id}/finalSubmit`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updated = res.data.updatedTask || res.data.task || res.data;

      setTask(updated);
      setProofModalOpen(false);
      setProofFile(null);

      setNotif({ type: 'success', title: 'Submitted', message: 'Your proof has been submitted.' });

    } catch (err) {
      setNotif({ type: 'error', title: 'Upload Failed', message: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // --- Conditions for final proof button ---
  const allPhasesDone = task?.phases?.every((p) => p.completedAt);
  const proof = task?.proof;
  const proofStatus = proof?.status;

  const canSubmitProof =
    allPhasesDone &&
    (proofStatus === undefined ||
      proofStatus === "REJECTED"); // ONLY allow submit if new OR rejected

  const proofButtonText =
    proofStatus === "PENDING"
      ? "Waiting for Review"
      : proofStatus === "APPROVED"
      ? "Approved"
      : proofStatus === "REJECTED"
      ? "Re-submit Proof"
      : "Submit Task";

  const proofButtonDisabled =
    !canSubmitProof || proofStatus === "PENDING" || proofStatus === "APPROVED";

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading…</div>;
  }

  if (!task) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>No task found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Notification notif={notif} onClose={() => setNotif(null)} />

      <div className="max-w-4xl mx-auto">

        {/* Header Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl p-6 shadow-lg mb-6">
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <p className="opacity-90 text-sm mt-1">{task.description}</p>

          <div className="mt-4">
            <div className="w-full bg-white/30 rounded-full h-3">
              <div className="h-3 bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-sm mt-1">{progress}% Completed</div>
          </div>

          {/* Task Status */}
          <div className="mt-3 flex gap-2">
            <Badge className="bg-white/20 text-white">{task.status}</Badge>
            <Badge className="bg-white/20 text-white">{task.priority}</Badge>
            <span className="text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Rejection Message */}
        {proofStatus === "REJECTED" && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl mb-4">
            <h3 className="font-semibold">Your previous proof was rejected.</h3>
            <p className="text-sm mt-1">{proof?.message}</p>
          </div>
        )}

        {/* Phases */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Phases</h2>

            <button
              onClick={() => setProofModalOpen(true)}
              disabled={proofButtonDisabled}
              className={`px-4 py-2 rounded-md font-medium ${
                proofButtonDisabled
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {proofButtonText}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {task.phases.map((phase) => (
              <div key={phase._id} className={`p-4 border rounded-xl ${phase.completedAt ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{phase.title}</h3>
                    <p className="text-xs text-gray-500">Due: {new Date(phase.dueDate).toLocaleDateString()}</p>
                  </div>

                  {!phase.completedAt && (
                    <button
                      onClick={() => openPhaseConfirm(phase)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm"
                    >
                      Complete
                    </button>
                  )}

                  {phase.completedAt && (
                    <span className="text-green-700 font-medium text-sm">Done</span>
                  )}
                </div>

                {phase.description && <p className="text-sm text-gray-600 mt-2">{phase.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase Completion Modal */}
      <Modal open={phaseModalOpen} title="Confirm Phase Completion" onClose={() => setPhaseModalOpen(false)}>
        <p>Are you sure you want to mark "{selectedPhase?.title}" as completed?</p>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={() => setPhaseModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-md">Cancel</button>
          <button
            onClick={completePhase}
            disabled={isCompletingPhase}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            {isCompletingPhase ? "Saving..." : "Complete Phase"}
          </button>
        </div>
      </Modal>

      {/* Proof Upload Modal */}
      <Modal open={proofModalOpen} title="Submit Final Proof" onClose={() => setProofModalOpen(false)}>
        <input type="file" onChange={handleProofChange} />

        <p className="text-sm text-gray-500 mt-2">Upload PDF, Image, or Document</p>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={() => setProofModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-md">Cancel</button>
          <button
            onClick={submitProof}
            disabled={isSubmittingProof}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            {isSubmittingProof ? "Submitting..." : "Submit Proof"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
