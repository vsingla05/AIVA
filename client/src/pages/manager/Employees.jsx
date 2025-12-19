import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import useFetchEmployees from "../../hooks/useFetchAllEmployees";
import { Mail, Briefcase, TrendingUp, Clock } from "lucide-react";

export default function Employees() {
  const { employees, loading, error } = useFetchEmployees();
  const navigate = useNavigate(); // Initialize navigation

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center text-zinc-400 animate-pulse font-medium">
        Loading workforce...
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-zinc-500 font-medium">
        Failed to load employees. Please try again.
      </div>
    );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 bg-zinc-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Employees
          </h1>
          <p className="mt-1 text-zinc-500">
            Overview of workforce performance and availability.
          </p>
        </div>

        <div className="self-start md:self-center px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium shadow-lg shadow-zinc-200">
          Total Members: {employees.length}
        </div>
      </div>

      {/* List Layout (Full Width Cards) */}
      <div className="flex flex-col gap-5">
        {employees.map((emp) => {
          const maxHours = emp.availability?.maxWeeklyHours || 40;
          const loadPercent = Math.min(
            (emp.currentLoad / maxHours) * 100,
            100
          );

          return (
            <div
              key={emp._id}
              className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-zinc-300"
            >
              {/* Left: Identity Section */}
              <div className="flex items-center gap-5 w-full md:w-[35%]">
                <div className="relative">
                  <img
                    src={
                      emp.imageUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        emp.name
                      )}&background=18181b&color=ffffff`
                    }
                    alt={emp.name}
                    className="h-16 w-16 rounded-xl object-cover border border-zinc-100 shadow-sm group-hover:scale-105 transition-transform"
                  />
                  {/* Status Indicator Dot */}
                  <span
                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                      emp.isAssigned ? "bg-zinc-900" : "bg-zinc-300"
                    }`}
                  />
                </div>

                <div>
                  <h3 className="font-bold text-lg text-zinc-900 leading-tight">
                    {emp.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                    <Briefcase size={14} />
                    <span>{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                    <Mail size={12} />
                    <span className="truncate max-w-[150px]">{emp.email}</span>
                  </div>
                </div>
              </div>

              {/* Middle: Metrics Section */}
              <div className="flex flex-col sm:flex-row gap-6 w-full md:w-[45%] border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6">
                
                {/* Workload */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <span className="flex items-center gap-1"><Clock size={12}/> Workload</span>
                    <span className="text-zinc-700">{emp.currentLoad}/{maxHours}h</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                </div>

                {/* Performance */}
                <div className="min-w-[100px]">
                  <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    <TrendingUp size={12}/> Score
                  </p>
                  <p className="text-2xl font-bold text-zinc-900">
                    {emp.performance?.performanceScore}
                    <span className="text-sm text-zinc-400 font-normal ml-1">%</span>
                  </p>
                </div>
              </div>

              {/* Right: Action Section */}
              <div className="w-full md:w-auto flex items-center justify-end">
                <button
                  onClick={() => navigate(`/employee/details`)} 
                  className="w-full md:w-auto rounded-lg px-6 py-3 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                >
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