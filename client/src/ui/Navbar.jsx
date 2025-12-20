import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { 
  ChevronDown, User as UserIcon, Settings, 
  LogOut, LayoutDashboard, Bell 
} from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const dispatch = useDispatch();

  const { user, isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const avatarUrl = user?.imageUrl
    ? user.imageUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.name || "User"
      )}&background=6366F1&color=ffffff&rounded=true`;

  return (
    <header className="h-24 px-10 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 flex items-center justify-between">
      
      {/* ─── LEFT: BRANDING & CONTEXT ─── */}
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-xl shadow-slate-200">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">
            Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-pulse" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Employee Workspace
            </p>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: USER ACTIONS ─── */}
      {isLoggedIn && user && (
        <div className="flex items-center gap-6">
          
          {/* Notification Quick-Access */}
          <button className="p-3 text-slate-400 hover:text-[#6366F1] hover:bg-indigo-50 rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>

          <div className="h-8 w-[1px] bg-slate-100" />

          {/* Profile Dropdown */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((s) => !s)}
              className={`flex items-center gap-4 px-2 py-2 rounded-[1.2rem] transition-all ${
                open ? "bg-slate-50" : "hover:bg-slate-50"
              }`}
            >
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt="profile"
                  className="w-11 h-11 rounded-xl shadow-md border-2 border-white object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div className="text-left hidden lg:block">
                <div className="text-sm font-black text-slate-900 leading-tight">
                  {user.name || "Vansh Singla"}
                </div>
                <div className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest">
                  {user.role || "EMPLOYEE"}
                </div>
              </div>

              <ChevronDown 
                size={18} 
                className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-[#6366F1]" : ""}`} 
              />
            </button>

            {/* Dropdown Menu - Styled like Dashboard Cards */}
            {open && (
              <div className="absolute right-0 mt-4 w-56 bg-white border border-slate-100 rounded-[1.8rem] shadow-2xl shadow-indigo-100/50 py-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-3 border-b border-slate-50 mb-2">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Account Management</p>
                </div>
                
                <DropdownItem icon={<UserIcon size={16}/>} label="My Profile" />
                <DropdownItem icon={<Settings size={16}/>} label="Workspace Settings" />
                
                <div className="mx-4 my-2 border-t border-slate-50" />
                
                <button
                  onClick={() => {
                    dispatch(logout());
                    window.location.href = "/login";
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// Helper Sub-component for Dropdown Items
function DropdownItem({ icon, label }) {
  return (
    <button className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-600 hover:text-[#6366F1] hover:bg-indigo-50 transition-all">
      <span className="text-slate-400 group-hover:text-[#6366F1]">{icon}</span>
      {label}
    </button>
  );
}