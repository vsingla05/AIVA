import api from "../../components/auth/api";
import { useState, useEffect } from "react";

export default function ManagerDashboard({ user }) {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get(`api/v1/employee/managers/pending`);
        setPending(res.data);
      } catch (e) {}
    }
    fetch();

  }, [user._id]);

  async function action(leaveId, action) {
    try {
      await API.post("/leave/manager-action", { managerId: user._id, leaveId, action });
      setPending(prev => prev.filter(p => p._id !== leaveId));
    } catch (e) { console.error(e); alert("error"); }
  }

  return (
    <div style={{ padding: 12, border: "1px solid #eee" }}>
      <h3>Manager Dashboard</h3>
      {pending.map(l => <div key={l._id} style={{ border: "1px solid #ddd", padding:8, marginBottom:8 }}>
        <div>Employee: {String(l.employeeId)} Days: {l.days} Priority: {l.priority}</div>
        <div>Reason: {l.reason}</div>
        <div>
          <button onClick={() => action(l._id, "APPROVE")}>Approve</button>
          <button onClick={() => action(l._id, "REJECT")}>Reject</button>
        </div>
      </div>)}
    </div>
  );
}
