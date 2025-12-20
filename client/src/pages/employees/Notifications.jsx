import React, { useState, useEffect, useCallback } from "react";
import api from "../../components/auth/api";
import { 
  Bell, 
  CheckCircle2, 
  Circle, 
  Filter, 
  Trash2, 
  Search, 
  Inbox, 
  Activity, 
  Clock,
  ChevronRight,
  Zap
} from "lucide-react";

/* ===== Utils ===== */
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const units = [
    [31536000, "y"], [2592000, "mo"], [86400, "d"], [3600, "h"], [60, "m"],
  ];
  for (const [unit, label] of units) {
    const value = Math.floor(seconds / unit);
    if (value > 0) return `${value}${label} ago`;
  }
  return "Just now";
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get("/employee/notifications"),
        api.get("/employee/notifications/unread-count"),
      ]);
      setNotifications(notifRes.data.notifications || []);
      setUnreadCount(countRes.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/employee/notification/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="p-6 lg:p-10 max-w-[1600px] mx-auto min-h-screen bg-[#F8FAFC] text-slate-900 font-sans tracking-tight">
      
      {/* ─── HEADER ─── */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Notification Center</h1>
          <p className="text-slate-500 font-bold">Manage your updates and workspace alerts.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search alerts..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-sm"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        
        {/* ─── LEFT: CATEGORIES (Col 3) ─── */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Inbox Channels</h3>
            <div className="space-y-2">
              <SidebarTab 
                label="All Messages" 
                count={notifications.length} 
                active={filter === "all"} 
                onClick={() => setFilter("all")}
                icon={<Inbox size={18}/>} 
              />
              <SidebarTab 
                label="Unread" 
                count={unreadCount} 
                active={filter === "unread"} 
                onClick={() => setFilter("unread")}
                icon={<Bell size={18}/>} 
                color="text-indigo-600"
              />
              <SidebarTab label="System Alerts" count={0} icon={<Zap size={18}/>} />
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Workspace Health</p>
              <h4 className="text-2xl font-black mb-4">{( (1 - (unreadCount/notifications.length || 0)) * 100).toFixed(0)}%</h4>
              <p className="text-xs font-bold opacity-80 leading-relaxed">You are staying on top of your communications.</p>
            </div>
            <Activity size={100} className="absolute -right-6 -bottom-6 opacity-10" />
          </div>
        </aside>

        {/* ─── CENTER: FEED (Col 6) ─── */}
        <section className="col-span-12 lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Recent Activity</h3>
             <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
               {filter} feed
             </span>
          </div>

          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`group bg-white border rounded-[2rem] p-6 flex items-start gap-6 transition-all hover:border-indigo-400 hover:shadow-lg ${
                    notif.isRead ? "border-slate-100 opacity-80" : "border-slate-200 shadow-sm"
                  }`}
                >
                  <div className={`mt-1 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    notif.isRead ? "bg-slate-50 text-slate-400" : "bg-indigo-50 text-indigo-600"
                  }`}>
                    {notif.isRead ? <CheckCircle2 size={20} /> : <Bell size={20} />}
                  </div>

                  <div className="flex-1">
                    <p className={`text-base leading-snug ${notif.isRead ? "text-slate-500 font-medium" : "text-slate-900 font-black"}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                         <Clock size={12}/> {timeAgo(notif.createdAt)}
                       </span>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-24 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Inbox size={32} />
                </div>
                <p className="text-slate-400 font-bold">Your workspace is quiet for now.</p>
              </div>
            )}
          </div>
        </section>

        {/* ─── RIGHT: SUMMARY (Col 3) ─── */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-2 text-indigo-600">
               <Activity size={16} /> Statistics
            </h3>
            
            <div className="space-y-8">
               <SummaryItem label="Unread Count" value={unreadCount} sub="High priority" />
               <SummaryItem label="Total Alerts" value={notifications.length} sub="Lifetime" />
               
               <div className="pt-6 border-t border-slate-100">
                  <button 
                    onClick={() => api.put("/employee/notifications/read-all")}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all"
                  >
                    Clear All Read
                  </button>
               </div>
            </div>
          </section>
        </aside>

      </div>
    </main>
  );
}

/* ─── SUB-COMPONENTS ─── */

function SidebarTab({ label, count, active, onClick, icon, color = "text-slate-400" }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
        active ? "bg-slate-900 text-white shadow-lg" : "hover:bg-slate-50 text-slate-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-indigo-400" : color}>{icon}</span>
        <span className="text-sm font-black">{label}</span>
      </div>
      <span className={`text-xs font-black ${active ? "opacity-50" : "text-slate-300"}`}>{count}</span>
    </button>
  );
}

function SummaryItem({ label, value, sub }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="font-black text-3xl text-slate-900">{value}</p>
        <span className="text-[10px] font-bold text-slate-300 uppercase">{sub}</span>
      </div>
    </div>
  );
}