// client/src/components/ui/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';

export default function Navbar({ companyName = 'SmartOffice' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white/60 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white font-semibold shadow">
          {companyName[0]}
        </div>
        <div>
          <div className="text-gray-900 font-semibold text-lg">{companyName}</div>
          <div className="text-xs text-gray-500">Employee Dashboard</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 focus:outline-none"
          >
            <img
              src="https://ui-avatars.com/api/?name=E+U&background=222222&color=ffffff&rounded=true"
              alt="profile"
              className="w-9 h-9 rounded-full shadow-sm"
            />
            <div className="text-left">
              <div className="text-sm text-gray-900">Elena U.</div>
              <div className="text-xs text-gray-500">Product Designer</div>
            </div>
            <svg
              className={`w-4 h-4 text-gray-500 transform transition-transform duration-150 ${open ? 'rotate-180' : 'rotate-0'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg py-2 animate-fade">
              <button
                onClick={() => alert('Profile — not implemented (dummy)')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Profile
              </button>
              <button
                onClick={() => alert('Settings — not implemented (dummy)')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Settings
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => {
                  // dummy logout; you can wire real logout later
                  alert('Logged out (dummy).');
                  window.location.reload();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}