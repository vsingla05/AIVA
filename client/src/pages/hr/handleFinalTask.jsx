import { useState, useEffect } from "react";
import api from "../../components/auth/api";

export default function HandleFinalTask() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState(""); // for input
  const [rejectingTaskId, setRejectingTaskId] = useState(null); // track which task HR is rejecting

  useEffect(() => {
    const fetchProof = async () => {
      try {
        const res = await api.get("/task/fetchProofs");
        if (res.status === 200) {
          setTasks(res.data.tasks); 
        }
      } catch (err) {
        console.log("error in handlefinaltask", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProof();
  }, []);

  const handleDecision = async (taskId, decision, reason = "") => {
    try {
      const res = await api.post(`/task/${taskId}/review`, {
        status: decision, // "APPROVED" or "REJECTED"
        message: reason,  // include reason if rejected
      });
      if (res.status === 200) {
        // Update local state after decision
        setTasks((prev) =>
          prev.map((t) =>
            t._id === taskId
              ? { ...t, proof: { ...t.proof, status: decision, comments: reason } }
              : t
          )
        );
        setRejectReason("");
        setRejectingTaskId(null);
      }
    } catch (err) {
      console.log("error updating proof status:", err.message);
    }
  };

  if (loading) return <h1>Loading...</h1>;

  return (
    <div>
      <h2>Submitted Proofs</h2>
      {tasks.length === 0 && <p>No proofs submitted yet.</p>}

      {tasks.map((task) => (
        <div
          key={task._id}
          style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem 0" }}
        >
          <h3>{task.title}</h3>
          <p><b>Assigned By:</b> {task.assignedBy?.name || "N/A"}</p>
          <p><b>Comments:</b> {task.proof?.comments || "No comments"}</p>
          <p><b>Status:</b> {task.proof?.status}</p>

          {task.proof?.file && (
            <a href={task.proof.file} target="_blank" rel="noopener noreferrer">
              View Proof File
            </a>
          )}

          <div style={{ marginTop: "0.5rem" }}>
            <button
              onClick={() => handleDecision(task._id, "APPROVED")}
              disabled={task.proof?.status === "APPROVED"}
            >
              Accept
            </button>

            <button
              onClick={() => setRejectingTaskId(task._id)}
              disabled={task.proof?.status === "REJECTED"}
              style={{ marginLeft: "0.5rem" }}
            >
              Reject
            </button>
          </div>

          {/* Show reject reason input only if HR clicked reject */}
          {rejectingTaskId === task._id && (
            <div style={{ marginTop: "0.5rem" }}>
              <textarea
                placeholder="Enter reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: "0.5rem" }}
              />
              <button
                onClick={() => handleDecision(task._id, "REJECTED", rejectReason)}
                disabled={!rejectReason.trim()}
                style={{ marginTop: "0.5rem" }}
              >
                Submit Rejection
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
