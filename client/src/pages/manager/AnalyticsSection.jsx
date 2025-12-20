import React, { useEffect, useState } from "react";
import { TrendingUp, Clock, Target } from "lucide-react";
import api from "../../components/auth/api";

export default function AnalyticsSection() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/manager/employee-analytics").then(res => {
      setData(res.data);
    });
  }, []);

  if (!data) {
    return <div className="p-8 text-gray-400">Loading analytics…</div>;
  }

  const { stats, reliability, leaderboard } = data;

  return (
    <div className="p-8 bg-gray-50">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Operational Analytics
        </h1>
        <p className="text-sm text-gray-500">
          Real-time performance data across all departments
        </p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Avg. Performance", value: stats.avgPerformance },
          { label: "Task Success Rate", value: `${stats.successRate}%` },
          { label: "Delayed Tasks", value: stats.delayedTasks },
          { label: "Avg. Efficiency", value: stats.avgEfficiency },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* DELIVERY RELIABILITY */}
        <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-6">
            Delivery Reliability
          </h3>

          {/* BARS */}
          {[
            { label: "On-Time Completion", value: reliability.onTimePercent },
            { label: "Minor Delays", value: reliability.minorPercent },
            { label: "Major Delays", value: reliability.majorPercent },
          ].map((row, i) => (
            <div key={i} className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">{row.label}</span>
                <span className="font-medium">{row.value}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full">
                <div
                  className="h-2 bg-black rounded-full transition-all"
                  style={{ width: `${row.value}%` }}
                />
              </div>
            </div>
          ))}

          {/* MANAGER INSIGHT */}
          <div className="mt-6 p-4 rounded-xl bg-gray-100 text-sm text-gray-700">
            <strong>Manager Insight:</strong> AI-assisted task allocation has
            significantly reduced delay rates and improved skill matching.
          </div>

          {/* RELIABILITY SUMMARY (HEIGHT BALANCER) */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-gray-50 text-center">
              <p className="text-xs text-gray-500">On-Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {reliability.onTimePercent}%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 text-center">
              <p className="text-xs text-gray-500">Minor Delays</p>
              <p className="text-lg font-semibold text-gray-900">
                {reliability.minorPercent}%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 text-center">
              <p className="text-xs text-gray-500">Major Delays</p>
              <p className="text-lg font-semibold text-gray-900">
                {reliability.majorPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* PERFORMANCE LEADERBOARD */}
        <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-full bg-gray-100">
              <TrendingUp size={18} className="text-gray-700" />
            </div>
            <h3 className="font-semibold text-gray-900">
              Performance Leaderboard
            </h3>
          </div>

          <div className="space-y-5">
            {leaderboard.slice(0, 4).map((emp, index) => (
              <div
                key={emp.name}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {emp.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {emp.completed} tasks done
                    </p>
                  </div>
                </div>

                {/* SCORE */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    {emp.quality.toFixed(1)}
                    <Target size={14} />
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Quality Score
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WEEKLY LOAD */}
      <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Clock size={18} />
          Weekly Load Distribution
        </h3>

        <div className="grid grid-cols-7 gap-4">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
            <div key={day} className="text-center">
              <p className="text-xs text-gray-400 mb-2">{day}</p>
              <div className="h-24 w-2 bg-gray-200 rounded-full mx-auto relative">
                <div
                  className="absolute bottom-0 w-full bg-black rounded-full"
                  style={{ height: `${Math.random() * 70 + 20}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
