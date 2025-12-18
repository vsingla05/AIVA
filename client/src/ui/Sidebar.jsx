import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

/* ---------- Icons ---------- */
function IconOverview() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7h18M3 12h6M3 17h6"
      />
    </svg>
  );
}

function IconTasks() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4M3 7h18M3 12h6M3 17h6"
      />
    </svg>
  );
}

function IconBell() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z"
      />
    </svg>
  );
}

function IconChat() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h8M8 14h5m9-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 20.25a7.5 7.5 0 0115 0"
      />
    </svg>
  );
}

/* ---------- Reusable Nav Item ---------- */
function NavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2 rounded-md transition
        ${
          isActive
            ? "bg-gray-100 font-medium text-gray-900"
            : "text-gray-700 hover:bg-gray-50"
        }`
      }
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon />}
        <span>{label}</span>
      </div>

      {badge && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-900 text-white">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

/* ---------- Sidebar ---------- */
export default function Sidebar() {
  const notifications = useSelector(
    (state) =>
      state.notifications?.items ??
      state.notifications?.list ??
      state.notifications ??
      []
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Optional: pull employee info from auth slice
  const user = useSelector((state) => state.auth?.user);

  return (
    <aside className="w-72 bg-white border-r border-gray-100 min-h-screen sticky top-0 flex flex-col">
      {/* ───────── Profile Section ───────── */}
      <div className="px-5 py-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <img
            src={user?.imageUrl || "https://via.placeholder.com/48"}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {user?.name || "Employee"}
            </p>
            <p className="text-xs text-gray-500">{user?.role || "EMPLOYEE"}</p>
          </div>
        </div>
      </div>

      {/* ───────── Navigation ───────── */}
      <div className="px-4 py-6">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">
          Workspace
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem to="/dashboard" icon={IconOverview} label="Overview" />
          <NavItem to="/task-page" icon={IconTasks} label="Tasks" />
          <NavItem
            to="/notifications"
            icon={IconBell}
            label="Notifications"
            badge={unreadCount > 0 ? unreadCount : null}
          />
          <NavItem to="/chat" icon={IconChat} label="Smart Chat" badge="AI" />
          <NavItem to="/employee/details" icon={IconProfile} label="Profile" />
        </nav>

        {/* ───────── Status ───────── */}
        <div className="mt-8">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Status
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="w-2 h-2 rounded-full bg-gray-700" />
            Online
          </div>
        </div>
      </div>

      {/* ───────── Footer ───────── */}
      <div className="mt-auto px-4 py-6 text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} SmartOffice
      </div>
    </aside>
  );
}
