import React from "react";
import useFetchEmployees from "../../hooks/useFetchAllEmployees";
import { Mail } from "lucide-react";

export default function Employees() {
  const { employees, loading, error } = useFetchEmployees();

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center text-slate-400 animate-pulse">
        Loading workforce…
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Failed to load employees
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Employees
          </h1>
          <p className="mt-1 text-slate-500">
            Manage availability, workload and performance
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold">
          {employees.length} Members
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {employees.map((emp) => {
          const maxHours = emp.availability?.maxWeeklyHours || 40;
          const loadPercent = Math.min(
            (emp.currentLoad / maxHours) * 100,
            100
          );

          return (
            <div
              key={emp._id}
              className="group relative rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Status */}
              <span
                className={`absolute top-5 right-5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${
                  emp.isAssigned
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {emp.isAssigned ? "Assigned" : "Available"}
              </span>

              {/* Profile */}
              <div className="flex items-center gap-4">
                <img
                  src={
                    emp.imageUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      emp.name
                    )}&background=0f172a&color=ffffff`
                  }
                  alt={emp.name}
                  className="h-14 w-14 rounded-2xl object-cover shadow-md"
                />

                <div>
                  <h3 className="font-semibold text-lg text-slate-900">
                    {emp.name}
                  </h3>
                  <p className="text-sm text-indigo-600 font-medium">
                    {emp.department}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-500 truncate">
                <Mail size={14} />
                {emp.email}
              </div>

              {/* Workload */}
              <div className="mt-6">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Workload</span>
                  <span className="text-slate-700">
                    {emp.currentLoad}/{maxHours} hrs
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      loadPercent > 85
                        ? "bg-rose-500"
                        : "bg-indigo-500"
                    }`}
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between border-t pt-5">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Performance
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {emp.performance?.performanceScore}
                    <span className="text-sm text-slate-400">%</span>
                  </p>
                </div>

                <button className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-900 hover:text-white transition">
                  View Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
