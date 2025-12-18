import React, { useEffect, useState } from "react";
import api from "../../components/auth/api";

/* ───────────────────────────────
   Icons (Inline SVGs to keep it dependency-free)
─────────────────────────────── */
const Icons = {
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ),
  Briefcase: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  User: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  )
};

/* ───────────────────────────────
   Helpers
─────────────────────────────── */
const format = (num) => (typeof num === "number" ? num.toFixed(2) : "0.00");

/* ───────────────────────────────
   Components
─────────────────────────────── */

const Card = ({ title, children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col h-full ${className}`}>
    {title && (
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
          {title}
        </h3>
      </div>
    )}
    {children}
  </div>
);

// A specialized box for metrics to give them visual weight
const StatBox = ({ label, value, subtext, icon: Icon }) => (
  <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-between border border-gray-100 hover:border-gray-200 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      {Icon && <div className="text-gray-400"><Icon /></div>}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

const ProgressBar = ({ label, value, max, sublabel }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="group">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 text-xs tabular-nums">{sublabel || `${value}/${max}`}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gray-900 h-2 rounded-full transition-all duration-500 ease-out group-hover:bg-black"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/* ───────────────────────────────
   Main Component
─────────────────────────────── */

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data simulation if API fails or for preview
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get("/employee/me");
        setEmployee(res.data.employee);
      } catch (err) {
        console.error("Failed to load employee", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 animate-pulse">Loading...</div>;
  if (!employee) return <div className="min-h-screen flex items-center justify-center text-gray-800 font-medium">Employee not found</div>;

  const {
    name,
    email,
    phone,
    imageUrl,
    department,
    role,
    joinDate,
    leaveBalance,
    skills = [],
    performance,
    taskStats,
    availability,
    currentLoad,
  } = employee;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Profile</h1>
            <p className="text-gray-500 mt-1">Manage your personal information and view performance.</p>
          </div>
          <div className="flex gap-3">
             {/* Optional Action Buttons could go here */}
          </div>
        </div>

        {/* ─── Profile Hero Card ─── */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="relative">
             <img
                src={imageUrl || "https://via.placeholder.com/150"}
                alt={name}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-gray-50 shadow-inner"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-gray-900 border-4 border-white rounded-full"></span>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{name}</h2>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wide border border-gray-200">
                  {role}
                </span>
              </div>
              <p className="text-gray-500 text-lg">{department}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
               <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-900"><Icons.Mail /></div>
                  <span className="truncate">{email}</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-900"><Icons.Phone /></div>
                  <span>{phone || "No phone"}</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-900"><Icons.Calendar /></div>
                  <span>Joined {new Date(joinDate).toLocaleDateString()}</span>
               </div>
            </div>
          </div>
        </div>


        {/* ─── Dashboard Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Performance (Main Stats) */}
          <Card title="Performance" className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Score" value={performance.performanceScore} icon={Icons.Activity} />
              <StatBox label="Completion" value={`${format(performance.taskCompletionRate)}%`} />
              <StatBox label="Efficiency" value={format(performance.efficiency)} />
              <StatBox label="Quality" value={format(performance.avgQualityRating)} subtext="/ 5.0 Rating" />
            </div>

            <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Current Workload</h4>
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-6">
                   <ProgressBar 
                      label="Weekly Hours" 
                      value={currentLoad} 
                      max={availability.maxWeeklyHours} 
                      sublabel={`${format(currentLoad)} / ${availability.maxWeeklyHours} hrs`}
                   />
                   <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                         <span className="text-xs text-gray-500 uppercase block mb-1">Leave Balance</span>
                         <span className="text-xl font-bold text-gray-900">{leaveBalance.totalLeave} <span className="text-sm font-normal text-gray-400">days</span></span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                         <span className="text-xs text-gray-500 uppercase block mb-1">Holidays</span>
                         <span className="text-xl font-bold text-gray-900">{availability.holidays.length} <span className="text-sm font-normal text-gray-400">planned</span></span>
                      </div>
                   </div>
                </div>
            </div>
          </Card>

          {/* Column 2: Skills & Availability */}
          <div className="space-y-6">
             <Card title="Skills">
                <div className="space-y-6">
                  {skills.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No skills recorded.</p>
                  ) : (
                    skills.map((s, i) => (
                      <ProgressBar key={i} label={s.name} value={s.level} max={5} sublabel={`${s.level} / 5`} />
                    ))
                  )}
                </div>
             </Card>
          </div>
        </div>

        {/* ─── Task Statistics (Full Width) ─── */}
        <Card title="Task Analytics">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
               <div className="bg-black text-white rounded-xl p-4 flex flex-col justify-between shadow-lg">
                  <p className="text-xs opacity-70 uppercase tracking-wide">Assigned</p>
                  <p className="text-3xl font-bold">{taskStats.totalTaskAssigned}</p>
               </div>
               
               <StatBox label="Completed" value={taskStats.completedTasks} />
               <StatBox label="Delayed" value={taskStats.delayedTasks} />
               <StatBox label="Rejected" value={taskStats.rejectedTasks} />
               
               <div className="col-span-2 lg:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Estimated vs Actual</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-2xl font-bold text-gray-900">{format(taskStats.totalActualHours)}h</p>
                      <span className="text-sm text-gray-400">/ {format(taskStats.totalEstimatedHours)}h</span>
                    </div>
                  </div>
                  <div className="text-gray-300"><Icons.Clock /></div>
               </div>
            </div>
        </Card>

      </div>
    </div>
  );
}