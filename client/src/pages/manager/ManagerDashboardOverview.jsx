import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, Users, Target, Activity, 
  ChevronRight, Clock, TrendingUp,
  LayoutDashboard, FileText, CheckCircle2
} from "lucide-react";
import api from "../../components/auth/api";

/* ─── Status Badge ─── */
const StatusBadge = ({ status }) => {
  const styles = {
    "Completed": "bg-black text-white",
    "In Progress": "bg-slate-100 text-slate-900",
    "Delayed": "bg-slate-200 text-slate-600",
    "Rejected": "border border-slate-200 text-slate-400",
  };

  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${styles[status] || "bg-slate-50 text-slate-500"}`}>
      {status}
    </span>
  );
};

export default function ManagerDashboardOverview() {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get("/manager/overview");
        setStats(res.data.stats);
        setRecentTasks(res.data.recentTasks);
      } catch (err) {
        console.error("Failed to load manager overview");
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Activity className="animate-pulse text-slate-300" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Database...</p>
        </div>
      </div>
    );
  }

  // Calculate dynamic metrics from your real data
  const completionRate = stats.totalTasks > 0 ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(0) : 0;

  return (
    <div className="flex-1 bg-[#FDFDFD] min-h-screen">
      <main className="p-8 max-w-[1400px] mx-auto w-full">

        {/* ─── HEADER ─── */}
        <section className="mb-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-8 bg-black rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intelligence Hub</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
              Command Overview
            </h1>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">System Status</p>
             <p className="text-xs font-bold text-emerald-500 uppercase tracking-tight">Active & Synchronized</p>
          </div>
        </section>

        {/* ─── REAL DATA KPI CARDS ─── */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Main High-Contrast Card */}
          <div className="bg-black p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col justify-between h-56 relative overflow-hidden group">
            <Target className="absolute -right-6 -top-6 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Total Workload</p>
              <h4 className="text-6xl font-black tracking-tighter mt-2">{stats.totalTasks}</h4>
            </div>
            <p className="text-xs font-bold opacity-60">Currently assigned across {stats.totalEmployees} employees</p>
          </div>

          <MetricCard label="Efficiency" value={`${completionRate}%`} sub="Completion Ratio" icon={<CheckCircle2 size={20}/>} />
          <MetricCard label="Employees" value={stats.totalEmployees} sub="Active Personnel" icon={<Users size={20}/>} />
          <MetricCard label="Delayed" value={stats.delayedTasks} sub="Immediate Attention" icon={<Clock size={20}/>} isAlert={stats.delayedTasks > 0} />
        </section>

        {/* ─── MAIN CONTENT ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Recent Tasks List (Real Data) */}
          <div className="xl:col-span-2">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Recent Workstream</h3>
                <button className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronRight size={18}/></button>
              </div>

              {!recentTasks.length ? (
                <div className="py-20 text-center font-bold text-slate-300 uppercase text-[10px] tracking-widest">No Active Records</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {recentTasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group flex items-center justify-between p-5 rounded-2xl border border-slate-50 hover:border-slate-900 transition-all cursor-default"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-all">
                          <FileText size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{task.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400">
                            <span>{task.assignee}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span>Due {new Date(task.due).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Calendar / Schedule (Derived from real tasks) */}
          <div className="space-y-8">
            <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Calendar size={18} className="text-slate-400" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Deadlines</h3>
              </div>
              
              <div className="space-y-6">
                {recentTasks.slice(0, 3).map((task, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest w-12 pt-1">
                      {new Date(task.due).getDate()} {new Date(task.due).toLocaleString('default', { month: 'short' })}
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight line-clamp-1">{task.title}</h5>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 italic">{task.assignee}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-10 py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                Full Schedule
              </button>
            </section>

            {/* Performance Analytics Block */}
            <section className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Capacity Index</p>
               <div className="flex items-end gap-2 mb-4">
                  <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{((stats.inProgressTasks / (stats.totalTasks || 1)) * 100).toFixed(0)}%</h4>
                  <TrendingUp size={16} className="text-emerald-500 mb-2" />
               </div>
               <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black transition-all duration-1000" 
                    style={{ width: `${(stats.inProgressTasks / (stats.totalTasks || 1)) * 100}%` }}
                  />
               </div>
               <p className="text-[10px] font-bold text-slate-500 mt-4 leading-relaxed uppercase">Current active development workload relative to total backlog.</p>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

/* ─── SUB-COMPONENTS ─── */

function MetricCard({ label, value, sub, icon, isAlert = false }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all h-56 flex flex-col justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAlert ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400"}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className={`text-4xl font-black tracking-tighter ${isAlert ? "text-rose-600" : "text-slate-900"}`}>{value}</h4>
        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase opacity-60">{sub}</p>
      </div>
    </div>
  );
}