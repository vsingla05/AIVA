import React from 'react';
import { 
  BarChart2, PieChart, TrendingUp, AlertTriangle, 
  CheckCircle2, Clock, Zap, Target 
} from 'lucide-react';

// --- MOCK ANALYTICS DATA (Derived from your Schema) ---
const stats = [
  { label: "Avg. Performance", value: "92.4", icon: <Target className="text-blue-600" />, trend: "+2.5%" },
  { label: "Task Success Rate", value: "88%", icon: <CheckCircle2 className="text-green-600" />, trend: "+1.2%" },
  { label: "Delayed Tasks", value: "12", icon: <AlertTriangle className="text-amber-600" />, trend: "-4%" },
  { label: "Avg. Efficiency", value: "18.5", icon: <Zap className="text-purple-600" />, trend: "+0.8" },
];

const teamPerformance = [
  { name: "Vansh Singla", completed: 45, delayed: 2, quality: 4.8 },
  { name: "Elena U.", completed: 38, delayed: 5, quality: 4.2 },
  { name: "Arjun K.", completed: 29, delayed: 0, quality: 4.9 },
];

const AnalyticsSection = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Operational Analytics</h1>
        <p className="text-gray-500 text-sm">Real-time performance data across all departments.</p>
      </div>

      {/* 1. KEY METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-xl">{stat.icon}</div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* 2. DELAY CATEGORY ANALYSIS (Mongoose taskDelay logic) */}
        <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 size={20} className="text-blue-500" />
              Delivery Reliability
            </h3>
            <select className="text-xs border-gray-200 rounded-lg bg-gray-50 p-1">
              <option>Last 30 Days</option>
              <option>This Quarter</option>
            </select>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">On-Time Completion</span>
                <span className="font-bold">82%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[82%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Minor Delays (1-2 days)</span>
                <span className="font-bold">12%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[12%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Major Delays (3+ days)</span>
                <span className="font-bold">6%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full w-[6%]" />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50">
            <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
              <TrendingUp className="text-blue-600 mt-1" size={18} />
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Manager Insight:</strong> Delays have decreased by 15% since the AI-assisted assignment model was implemented. Rejection rates for "Skill Mismatch" are at an all-time low.
              </p>
            </div>
          </div>
        </div>

        {/* 3. TOP PERFORMERS BY QUALITY (Mongoose avgQualityRating) */}
        <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <PieChart size={20} className="text-purple-500" />
            Performance Leaderboard
          </h3>
          <div className="space-y-5">
            {teamPerformance.map((member, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.completed} tasks done</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <span>{member.quality}</span>
                    <Target size={14} />
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Quality Score</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition">
            Export Full Performance Report
          </button>
        </div>
      </div>

      {/* 4. WORKLOAD DISTRIBUTION GRID */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock size={20} className="text-orange-500" />
          Weekly Load Distribution (Current vs Capacity)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 font-bold mb-3 uppercase">{day}</p>
              <div className="relative h-24 w-4 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div 
                  className="absolute bottom-0 w-full bg-orange-500 rounded-full" 
                  style={{ height: `${Math.floor(Math.random() * 60) + 30}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;