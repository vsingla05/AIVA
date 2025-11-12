import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE });

export default function EmployeeDashboard({ user }) {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    if (!user._id) return;
    async function fetch() {
      try {
        const res = await API.get(`/employee/${user._id}/leaves`);
        setLeaves(res.data);
      } catch (e) {}
    }
    fetch();

    const socket = io(import.meta.env.VITE_SOCKET_URL);
    socket.emit("join", user._id);
    socket.on("leave_update", payload => {
      setLeaves(prev => [payload.leave, ...prev]);
      alert("Update: leave status changed");
    });
    return () => socket.disconnect();
  }, [user._id]);

  return (
    <div style={{ padding: 12, border: "1px solid #eee" }}>
      <h3>Employee Dashboard</h3>
      {leaves.map(l => <div key={l._id} style={{ border: "1px solid #ddd", padding:8, marginBottom:8 }}>
        <div>Type: {l.type} Days: {l.days} Priority: {l.priority}</div>
        <div>Status: {l.status} Outcome: {l.leaveOutcomeType} DeductionDays: {l.salaryDeductionDays}</div>
        <div>Reason: {l.reason}</div>
      </div>)}
    </div>
  );
}
