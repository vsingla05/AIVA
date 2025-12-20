import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../components/auth/api";
import { 
  CalendarDays, CheckCircle, Clock, Bell, Zap, 
  Target, Plus, Trash2, ChevronRight, LayoutGrid,
  TrendingUp, Star, Search, Filter
} from "lucide-react";

export default function EmployeeDashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [focusList, setFocusList] = useState(() => {
    const saved = localStorage.getItem("workspace_focus_v1");
    return saved ? JSON.parse(saved) : [];
  });
  const [newFocus, setNewFocus] = useState("");

  useEffect(() => {
    api.get("/employee/overview").then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("workspace_focus_v1", JSON.stringify(focusList));
  }, [focusList]);

  const addFocus = (e) => {
    e.preventDefault();
    if (!newFocus.trim()) return;
    setFocusList([...focusList, { id: Date.now(), text: newFocus, done: false }]);
    setNewFocus("");
  };

  const calendar = useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return { firstDay, totalDays, today: now.getDate(), month: now.toLocaleString('default', { month: 'long' }) };
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Designing your day...</p>
      </div>
    </div>
  );

  const { name, currentLoad, stats, todayTasks, performance, notifications, upcomingTasks } = data;

  return (
    <main className="p-6 lg:p-10 max-w-[1600px] mx-auto min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, <span className="text-indigo-600">{name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Here's what's happening with your projects today.</p>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 lg:pb-0">
          <StatHeader label="Efficiency" value={`${Math.round(performance.efficiency)}%`} icon={<TrendingUp size={16}/>} color="text-emerald-600" />
          <StatHeader label="Performance" value={stats.performanceScore} icon={<Star size={16}/>} color="text-amber-500" />
          <StatHeader label="Weekly Load" value={`${currentLoad}h`} icon={<Clock size={16}/>} color="text-indigo-600" />
        </div>
      </header>

      {/* --- MAIN BENTO GRID --- */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Personal Workspace */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          {/* Today's Focus */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target size={16} className="text-indigo-500" /> My Focus
            </h3>
            <form onSubmit={addFocus} className="relative mb-6">
              <input 
                type="text" 
                placeholder="Next goal..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={newFocus}
                onChange={(e) => setNewFocus(e.target.value)}
              />
              <button className="absolute right-2 top-1.5 bg-indigo-600 text-white p-1.5 rounded-xl hover:bg-indigo-700 transition-colors">
                <Plus size={18} />
              </button>
            </form>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {focusList.map((item) => (
                <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={item.done} onChange={() => {/* toggle logic */}} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className={`text-sm font-medium ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Recent Updates</h3>
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div key={i} className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-slate-700 leading-snug">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CENTER COLUMN: Task Management */}
        <div className="col-span-12 lg:col-span-6 space-y-8">
          <section className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <LayoutGrid size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Today's Schedule</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><Filter size={18}/></button>
              </div>
            </div>

            <div className="p-8">
              {todayTasks.length > 0 ? (
                <div className="space-y-4">
                  {todayTasks.map((task) => (
                    <div key={task._id} className="flex items-center gap-6 p-5 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                      <div className="hidden sm:flex flex-col items-center justify-center min-w-[60px] py-2 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Due</span>
                        <span className="text-sm font-black text-slate-700">{new Date(task.dueDate).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${task.priority === 'HIGH' ? 'bg-red-500' : 'bg-indigo-500'}`} />
                          <h4 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{task.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-3">
                          <span className="flex items-center gap-1"><Clock size={12}/> {task.status.replace(/_/g, ' ')}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{task.priority} Priority</span>
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="inline-flex p-4 bg-emerald-50 text-emerald-500 rounded-full mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <p className="text-slate-500 font-semibold">Your schedule is clear for today!</p>
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Section to fill space */}
          <section className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-lg font-bold mb-4">Upcoming Deadlines</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {upcomingTasks.slice(0, 2).map((t, i) => (
                   <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                     <p className="text-xs font-bold text-indigo-100 mb-1">{new Date(t.dueDate).toLocaleDateString()}</p>
                     <p className="text-sm font-bold truncate">{t.title}</p>
                   </div>
                 ))}
               </div>
             </div>
             <Zap className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 rotate-12" />
          </section>
        </div>

        {/* RIGHT COLUMN: Performance & Calendar */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          {/* Modern Calendar */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">{calendar.month}</h3>
              <CalendarDays size={18} className="text-slate-400" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S','M','T','W','T','F','S'].map(d => (
                <div key={d} className="text-[10px] font-bold text-slate-300 py-2">{d}</div>
              ))}
              {Array.from({ length: calendar.firstDay }).map((_, i) => <div key={i} />)}
              {Array.from({ length: calendar.totalDays }).map((_, i) => {
                const day = i + 1;
                const isToday = day === calendar.today;
                return (
                  <div key={day} className={`aspect-square flex items-center justify-center text-xs font-bold rounded-xl transition-all ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {day}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Performance Breakdown */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Monthly Stats</h3>
            <div className="space-y-6">
              <ProgressStat label="Tasks Completed" value={performance.completed} target={20} color="bg-emerald-500" />
              <ProgressStat label="Efficiency Rate" value={Math.round(performance.efficiency)} target={100} color="bg-indigo-500" />
              <div className="pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">STATUS</span>
                  <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">EXCELLENT</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* --- HELPER COMPONENTS --- */
const StatHeader = ({ label, value, icon, color }) => (
  <div className="bg-white border border-slate-200/60 p-4 px-6 rounded-3xl shadow-sm min-w-[160px] flex items-center gap-4">
    <div className={`p-2 bg-slate-50 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-slate-800 leading-none">{value}</p>
    </div>
  </div>
);

const ProgressStat = ({ label, value, target, color }) => (
  <div>
    <div className="flex justify-between text-xs font-bold mb-2">
      <span className="text-slate-500 uppercase">{label}</span>
      <span className="text-slate-800">{value}/{target}</span>
    </div>
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${(value/target)*100}%` }} />
    </div>
  </div>
);