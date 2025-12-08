import React, { useEffect, useState } from "react";
import { socket } from "../../socket";
import api from "../../components/auth/api";
import { useSelector } from "react-redux";

export default function ViewTaskProof() {
  const [proofList, setProofList] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [notif, setNotif] = useState(null);

  const managerId = useSelector((state) => state.auth.user?._id);

  /* 🔥 Fetch all proof submissions */
  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const res = await api.get("/task/send-proof");
        if (res.data.tasks?.length > 0) setProofList(res.data.tasks);
      } catch (err) {
        console.log("❌ Failed to load proofs:", err.message);
      }
    };
    fetchProofs();
  }, []);

  const handleReview = async (task, type, reason = "") => {
    try {
      console.log("task in fun", task, type, reason)
      await api.post(`/task/${task.taskId}/employee/${task.employeeId}`, {
        action: type,
        reason,
      });

      setProofList((prev) =>
        prev.map((t) =>
          t._id === task._id
            ? { ...t, proof: { ...t.proof, status: type === "accept" ? "APPROVED" : "REJECTED", message: reason } }
            : t
        )
      );

      showToast(`Task ${task.title} marked as ${type === "accept" ? "APPROVED" : "REJECTED"}`, "success");
      setSelectedTask(null);
      setRejectReason("");
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  /* 🔔 Toast popup */
  const showToast = (msg, type = "info") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      
      {/* Toast */}
      {notif && (
        <div className={`fixed top-6 right-6 px-5 py-3 rounded-xl shadow-xl text-white font-medium 
          ${notif.type === "error" ? "bg-red-600" : notif.type === "success" ? "bg-green-600" : "bg-blue-600"} 
          animate-slideDown`}>
          {notif.msg}
        </div>
      )}
      
      <h1 className="text-4xl font-bold text-gray-800 mb-6 tracking-tight">📄 Task Proof Review</h1>

      {/* GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {proofList.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500 text-lg italic">
            No submissions yet...
          </div>
        ) : (
          proofList.map((task, i) => {
            const state = task.proof.status;

            return (
              <div 
                key={i} 
                className="bg-white p-6 rounded-2xl shadow-lg border hover:-translate-y-1 transition transform duration-200"
              >
                <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
                <p className="text-sm text-gray-500 mt-1">By <b>{task.employee.name}</b></p>

                {/* Status Chip */}
                <span className={`mt-3 inline-block px-3 py-1 rounded-full text-xs text-white font-semibold
                  ${state==="READY_FOR_REVIEW"?"bg-yellow-600":
                    state==="APPROVED"?"bg-green-600":"bg-red-600"}`}>
                  {state}
                </span>

                <div className="mt-4 bg-gray-50 rounded-lg p-4 border">
                  <p className="text-sm"><b>Message:</b> {task.proof.message}</p>
                  <a
                    href={task.proof.file}
                    target="_blank"
                    className="mt-2 inline-block text-blue-600 font-semibold hover:underline"
                  >
                    📎 View Submitted File
                  </a>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => handleReview(task, "accept")}
                    disabled={state!=="READY_FOR_REVIEW"}
                    className={`flex-1 py-2 rounded-lg font-medium text-white 
                      ${state!=="READY_FOR_REVIEW"?"bg-gray-400 cursor-not-allowed":"bg-green-600 hover:bg-green-700"}`}>
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedTask(task)}
                    disabled={state!=="READY_FOR_REVIEW"}
                    className={`flex-1 py-2 rounded-lg font-medium text-white 
                      ${state!=="READY_FOR_REVIEW"?"bg-gray-400 cursor-not-allowed":"bg-red-600 hover:bg-red-700"}`}>
                    Reject
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* REJECT MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-700">Reject Task</h3>
            <textarea
              placeholder="Reason for rejection..."
              rows="3"
              value={rejectReason}
              onChange={(e)=>setRejectReason(e.target.value)}
              className="w-full mt-4 p-3 border rounded-lg focus:ring-2 ring-red-400"
            />
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={()=>setSelectedTask(null)} className="px-4 py-2 rounded-lg bg-gray-300">
                Cancel
              </button>
              <button
                onClick={()=>handleReview(selectedTask,"reject",rejectReason)}
                disabled={!rejectReason.trim()}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        .animate-slideDown { animation: slideDown .35s ease forwards; }
        @keyframes slideDown {from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }
        .animate-fadeIn { animation: fadeIn .35s ease; }
        @keyframes fadeIn {from {opacity:0;} to {opacity:1;} }
      `}</style>

    </div>
  );
}