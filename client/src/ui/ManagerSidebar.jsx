// client/src/components/ui/ManagerSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

/* ───────────────────────────────
   Icons (Clean & Professional)
─────────────────────────────── */
const Icons = {
  Grid: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h18M6 7.5V6a3 3 0 013-3h6a3 3 0 013 3v1.5M4.5 7.5v12A1.5 1.5 0 006 21h12a1.5 1.5 0 001.5-1.5v-12" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3v9H3zM10.5 6h3v15h-3zM18 3h3v18h-3z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Chat: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m9-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Cog: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a7.95 7.95 0 00.1-1 7.95 7.95 0 00-.1-1l2.1-1.6-2-3.4-2.5 1a7.9 7.9 0 00-1.7-1L15 2h-6l-.3 2.9a7.9 7.9 0 00-1.7 1l-2.5-1-2 3.4 2.1 1.6a7.95 7.95 0 000 2l-2.1 1.6 2 3.4 2.5-1a7.9 7.9 0 001.7 1L9 22h6l.3-2.9a7.9 7.9 0 001.7-1l2.5 1 2-3.4-2.1-1.6z" />
    </svg>
  ),
};

/* ───────────────────────────────
   Reusable Nav Item (Light Theme)
─────────────────────────────── */
function NavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center justify-between px-3 py-2.5 mx-2 rounded-lg transition-all
        ${
          isActive
            ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            {Icon && (
              <span className={`${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                <Icon />
              </span>
            )}
            <span className="font-medium text-sm">{label}</span>
          </div>

          {badge && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

/* ───────────────────────────────
   Main Component
─────────────────────────────── */
export default function ManagerSidebar() {
  const pendingRequests = 5;

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 min-h-screen sticky top-0 flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="text-lg font-bold text-slate-800">
            Manager<span className="text-blue-600">Panel</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="py-6 flex-1 space-y-8">

        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-5 mb-2">
            Overview
          </div>
          <nav className="flex flex-col gap-1">
            <NavItem to="/manager-dashboard" icon={Icons.Grid} label="Dashboard" />
            <NavItem to="/manager/employees" icon={Icons.Users} label="Employees" />
            <NavItem to="/manager/projects" icon={Icons.Briefcase} label="Projects" />
          </nav>
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-5 mb-2">
            Management
          </div>
          <nav className="flex flex-col gap-1">
            <NavItem to="/manager/analytics" icon={Icons.Chart} label="Analytics" />
            <NavItem to="/manager/action" icon={Icons.Check} label="Approvals" badge={pendingRequests} />
            <NavItem to="/manager/chat" icon={Icons.Chat} label="AI Assistant" badge="AI" />
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200">
        <NavItem to="/manager/settings" icon={Icons.Cog} label="Settings" />
      </div>
    </aside>
  );
}
