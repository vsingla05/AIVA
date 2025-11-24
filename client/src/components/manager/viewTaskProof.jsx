import React, { useEffect, useState } from "react";
import { socket } from "../../socket"; 
import api from "../../components/auth/api";

export default function viewTaskProof() {
  const [proofList, setProofList] = useState([]);
  const [notif, setNotif] = useState(null);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedProof, setSelectedProof] = useState(null);

  // Listen for incoming proofs
  useEffect(() => {
    socket.emit("managerJoin");

    socket.on("newProofSubmitted", (proofData) => {
      setProofList((prev) => [proofData, ...prev]);
      setNotif({
        title: "New Proof Submitted",
        message: `${proofData.employeeName} submitted proof for "${proofData.taskTitle}".`,
      });

      setTimeout(() => setNotif(null), 3500);
    });

    return () => socket.off("newProofSubmitted");
  }, []);


  /* --------------------------------------------------------
     UNIFIED REVIEW HANDLER (ACCEPT + REJECT)
  --------------------------------------------------------- */
  const handleReviewAction = async (proof, actionType, reason = "") => {
    try {
      const res = await api.post(
        `/manager/task/${proof.taskId}/${proof.employeeId}`,
        {
          action: actionType,  
          reason: reason,       
        }
      );

      // Decide if accept or reject
      const isAccept = actionType === "accept";

      // Notification
      setNotif({
        title: isAccept ? "Task Approved" : "Task Rejected",
        message: `Task "${proof.taskTitle}" has been ${isAccept ? "approved" : "rejected"}.`,
      });

      // Update UI instantly
      setProofList((prev) =>
        prev.map((p) =>
          p.taskId === proof.taskId
            ? {
                ...p,
                proof: {
                  ...p.proof,
                  status: isAccept ? "APPROVED" : "REJECTED",
                  message: reason,
                },
              }
            : p
        )
      );

      // Close modal on reject
      if (!isAccept) {
        setRejectModalOpen(false);
        setRejectReason("");
        setSelectedProof(null);
      }

    } catch (err) {
      setNotif({
        title: "Error",
        message:
          err.response?.data?.message ||
          `Failed to ${actionType} this task.`,
      });
    }
  };

  // Approve
  const onApproveClick = (proof) => {
    handleReviewAction(proof, "accept");
  };

  // Reject Submit
  const onRejectConfirm = () => {
    if (!rejectReason.trim()) {
      alert("Reason is required");
      return;
    }
    handleReviewAction(selectedProof, "reject", rejectReason);
  };

  // Open Reject Modal
  const openRejectModal = (proof) => {
    setSelectedProof(proof);
    setRejectModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Notification */}
      {notif && (
        <div
          className={`fixed top-6 right-6 shadow-lg border-l-4 p-4 rounded-lg z-50 bg-white ${
            notif.title === "Error" ? "border-red-600" : "border-blue-600"
          }`}
        >
          <h3
            className={`font-semibold ${
              notif.title === "Error" ? "text-red-700" : "text-blue-700"
            }`}
          >
            {notif.title}
          </h3>
          <p className="text-gray-700 mt-1">{notif.message}</p>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {proofList.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500 text-lg">
            No proofs submitted yet.
          </div>
        ) : (
          proofList.map((proof, index) => {
            const isReviewed = proof.proof.status !== "PENDING"; // Disable buttons

            return (
              <div
                key={index}
                className="bg-white shadow-lg rounded-xl p-5 border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {proof.taskTitle}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Submitted by:{" "}
                  <span className="font-medium text-gray-700">
                    {proof.employeeName}
                  </span>
                </p>

                {/* Proof Card */}
                <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        proof.proof.status === "PENDING"
                          ? "bg-yellow-600"
                          : proof.proof.status === "APPROVED"
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {proof.proof.status}
                    </span>
                  </p>

                  {proof.proof.message && (
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Message:</strong> {proof.proof.message}
                    </p>
                  )}

                  <p className="mt-2 text-sm">
                    <a
                      href={proof.proof.file}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      📄 View Proof File
                    </a>
                  </p>
                </div>

                {/* APPROVE + REJECT BUTTONS */}
                <div className="mt-4 flex gap-3">
                  <button
                    disabled={isReviewed}
                    onClick={() => onApproveClick(proof)}
                    className={`px-4 py-2 rounded-lg text-white ${
                      isReviewed
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    Approve
                  </button>

                  <button
                    disabled={isReviewed}
                    onClick={() => openRejectModal(proof)}
                    className={`px-4 py-2 rounded-lg text-white ${
                      isReviewed
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold">Reject Task</h3>
            <p className="text-sm text-gray-500 mt-1">
              Provide a reason for rejection:
            </p>

            <textarea
              className="w-full mt-3 p-3 border rounded-lg"
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
            ></textarea>

            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                onClick={onRejectConfirm}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
