// client/src/components/ui/ManagerNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function ManagerNavbar({ pageTitle = "Dashboard" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      
      {/* Left: Breadcrumbs / Title */}
      <div>
         <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span>Home</span>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-blue-600">Manager</span>
         </div>
         <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {pageTitle}
         </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        
        {/* Search Input (Subtle Gray) */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all w-64">
           <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm ml-2 text-gray-700 placeholder-gray-400 w-full"
           />
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-gray-100 hidden md:block"></div>

        {/* Profile Dropdown (Moved here from Sidebar) */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-3 p-1 pl-2 rounded-full hover:bg-gray-50 transition-colors focus:outline-none border border-transparent hover:border-gray-200"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-900">{user?.name || "Manager"}</div>
              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Admin Access</div>
            </div>
            
            <div className="relative">
              <img
                src={user?.imageUrl || "https://ui-avatars.com/api/?name=Manager&background=2563eb&color=fff"}
                alt="profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
          </button>

          {/* Menu Dropdown */}
          {open && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-lg shadow-xl py-1 animate-fade-in origin-top-right">
              <div className="px-4 py-2 border-b border-gray-50 text-xs text-gray-400">
                Manage Account
              </div>
              <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors">
                 Profile Settings
              </button>
              <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors">
                 Team Settings
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}