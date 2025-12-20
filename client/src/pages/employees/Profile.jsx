import React, { useEffect, useState } from "react";
import api from "../../components/auth/api";
import {
  Mail, Phone, Calendar, Zap, Star, Trophy, 
  Activity, Clock, User, ExternalLink, Award, BarChart3
} from "lucide-react";

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const format = (num) => (typeof num === "number" ? num.toFixed(2) : "0.00");

  return (
    <main className="p-6 lg:p-12 max-w-[1400px] mx-auto min-h-screen bg-[#F8FAFC] text-slate-900 font-sans tracking-tight">
      
      {/* ─── HEADER: CLEAN & MODERN ─── */}
      <section className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-28 h-28 rounded-[2rem] bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden p-1">
            {employee.imageUrl ? (
              <img src={employee.imageUrl} alt={employee.name} className="w-full h-full object-cover rounded-[1.8rem]" />
            ) : (
              <User size={48} className="text-slate-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
               <h1 className="text-4xl font-black tracking-tight">{employee.name}</h1>
               <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">
                 {employee.role}
               </span>
            </div>
            <p className="text-slate-500 font-bold text-lg mb-3">{employee.department}</p>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 justify-center md:justify-start">
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-700" /> {employee.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-700" /> {employee.phone || "No phone"}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-700" /> Joined {new Date(employee.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <button className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-xs hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-3 shadow-sm uppercase tracking-widest">
          Update Records <ExternalLink size={14} />
        </button>
      </section>

      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PERFORMANCE BENTO (Col 8) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2">Performance Indices</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Score" value={employee.performance.performanceScore} sub="System" icon={<Trophy />} highlight />
            <MetricCard label="Completion" value={`${format(employee.performance.taskCompletionRate)}%`} sub="Tasks" icon={<Activity />} />
            <MetricCard label="Efficiency" value={format(employee.performance.efficiency)} sub="Factor" icon={<Zap />} />
            <MetricCard label="Quality" value={format(employee.performance.avgQualityRating)} sub="Rating" icon={<Star />} />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                 <Clock size={16} className="text-indigo-600"/> Current Capacity
               </h4>
               <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase">{format(employee.currentLoad)} / {employee.availability.maxWeeklyHours} HRS</span>
            </div>
            
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-10 p-1">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out shadow-sm" 
                style={{ width: `${(employee.currentLoad / employee.availability.maxWeeklyHours) * 100}%` }}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-colors">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Leave Credit</p>
                  <p className="text-3xl font-black text-slate-900">{employee.leaveBalance.totalLeave} <span className="text-xs font-bold text-slate-400 tracking-normal">DAYS REMAINING</span></p>
               </div>
               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-colors">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Holiday Calendar</p>
                  <p className="text-3xl font-black text-slate-900">{employee.availability.holidays.length} <span className="text-xs font-bold text-slate-400 tracking-normal">PLANNED BREAKS</span></p>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SKILLS (Col 4) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2">Competency Stack</h3>
          <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm h-full">
            <div className="space-y-8">
              {employee.skills.map((s, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-800">{s.name}</span>
                    <span className="text-[10px] font-bold text-indigo-600">LVL {s.level} / 5</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div 
                        key={step} 
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= s.level ? 'bg-indigo-600' : 'bg-slate-100'}`} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-6 border-t border-slate-100 flex items-center gap-3">
               <div className="p-2 bg-indigo-50 rounded-xl"><Award size={18} className="text-indigo-600" /></div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-tight">Verified Skills</p>
                 <p className="text-xs font-bold text-slate-700">Updated {new Date().toLocaleDateString()}</p>
               </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

const MetricCard = ({ label, value, sub, icon, highlight = false }) => (
  <div className={`p-6 rounded-[2rem] border-2 transition-all ${
    highlight 
    ? 'bg-indigo-600 text-white border-transparent shadow-xl shadow-indigo-200' 
    : 'bg-white text-slate-900 border-slate-200 hover:border-indigo-300 shadow-sm'
  }`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl ${highlight ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>{icon}</div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-indigo-100' : 'text-slate-300'}`}>{sub}</span>
    </div>
    <p className="text-3xl font-black tracking-tighter">{value}</p>
    <p className={`text-[10px] font-bold uppercase mt-1 ${highlight ? 'text-indigo-100' : 'text-slate-400'}`}>{label}</p>
  </div>
);