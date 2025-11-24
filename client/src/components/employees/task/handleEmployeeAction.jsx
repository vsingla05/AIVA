import { useEffect, useState } from "react";
import api from "../../auth/api";
import { motion } from "framer-motion";
import { socket } from "../../../socket";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function EmployeeTaskAction() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const user = useSelector((state) => state.auth.userDetails);
  const navigate = useNavigate();

  /* ---------------------------------------------
     SOCKET JOIN + REAL-TIME TASK LISTEN
  --------------------------------------------- */
  useEffect(() => {
    if (user?._id) {
      socket.emit("joinRoom", user._id);
    }

    socket.on("newTaskAssigned", (incomingTask) => {
      setTask(incomingTask);
      setLoading(false);
    });

    return () => socket.off("newTaskAssigned");
  }, [user]);

  /* ---------------------------------------------
     LOAD EXISTING TASK ON PAGE LOAD
  --------------------------------------------- */

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get("/task/latest");
        setTask(res.data.task);
      } catch {
        setError("Could not fetch task.");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, []);

  /* ---------------------------------------------
     ACCEPT TASK (ONE API CALL)
  --------------------------------------------- */
  const handleAccept = async () => {
    try {
      const res = await api.post(`/task/action/${task.taskId}`, {
        action: "accept",
      });

      alert("Task accepted successfully!");

      navigate(`/task-overview/${task.taskId}`, {
        state: { task: res.data.task },
      });
    } catch (err) {
      alert("Failed to accept task");
    }
  };

  /* ---------------------------------------------
     REJECT TASK → SHOW MODAL
  --------------------------------------------- */
  const openRejectModal = () => {
    setShowRejectModal(true);
  };

  /* ---------------------------------------------
   SUBMIT REJECTION
--------------------------------------------- */
  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      alert("Reason is required!");
      return;
    }

    try {
      const res = await api.post(`/task/action/${task.taskId}`, {
        action: "reject",
        reason: rejectReason,
      });

      if (res.status === 200) {
        // CASE 1: Rejection FAILED → manager stays on task view
        if (res.data.success === false) {
          alert("Rejection failed! Employee still has the task.");

          return navigate(`/task-overview/${task.taskId}`, {
            state: { task: res.data.task }, // updated task state from backend
          });
        }

        // CASE 2: Rejection SUCCESS → Move manager back to dashboard
        alert("Task rejected successfully!");
        return navigate("/");
      }
    } catch (err) {
      alert("Failed to reject task");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-gray-100">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-xl"
      >
        {/* Task Card */}
        <div className="bg-white p-6 rounded-xl shadow-xl space-y-4">
          {error && <p className="text-red-500">{error}</p>}

          {/* TITLE */}
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>

          {/* DESCRIPTION */}
          <p className="text-gray-700">{task.description}</p>

          {/* PRIORITY + DUE DATE */}
          <div className="grid grid-cols-2 gap-4 mt-4 text-gray-700">
            <div>
              <p className="text-sm font-semibold">Priority</p>
              <p className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-xl inline-block mt-1 uppercase">
                {task.priority}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">Due Date</p>
              <p className="mt-1">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* PDF BUTTON */}
          {task.pdfUrl && (
            <div className="mt-4">
              <a
                href={task.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl inline-block"
              >
                📄 Open Task PDF
              </a>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handleAccept}
              className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition"
            >
              Accept
            </button>

            <button
              onClick={openRejectModal}
              className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
            >
              Reject
            </button>
          </div>
        </div>

        {/* REJECT MODAL */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white w-96 p-6 rounded-xl shadow-xl">
              <h2 className="text-xl font-bold">Reason for Rejection</h2>

              <textarea
                className="w-full border rounded-lg p-2 mt-3"
                rows="4"
                placeholder="Write your reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>

                <button
                  onClick={submitRejection}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
