import React, { useState, useEffect } from 'react';
import api from '../../auth/api';

import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  AlertCircle, 
  Eye, 
  ChevronRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';


const GetAssignedTask = () => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState(null); 

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.post('/employee/getAssignedTask')
        if(res.status === 200){
            setTask(res.data.task)
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, []);

  const handleAction = (action) => {
    // In a real app, you would make a POST request here
    // await fetch(`/api/task/${task.taskId}/${action}`, { method: 'PUT' });
    setActionStatus(action);
    setTimeout(() => {
      // Reset for demo purposes or redirect
      if(action === 'rejected') setTask(null); 
    }, 2000);
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Priority Badge Color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-rose-400 border-rose-400/30 bg-rose-400/10';
      case 'MEDIUM': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      default: return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-slate-400 font-light tracking-widest uppercase text-sm">Loading Assignment</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!task && !loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md p-8 border border-slate-800 rounded-2xl bg-slate-900/50 backdrop-blur-sm shadow-2xl">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl text-slate-200 font-serif mb-2">All Caught Up</h2>
          <p className="text-slate-400">There are no pending tasks assigned to you at this moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-200 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Background Ambiance */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Main Card */}
      <div className={`max-w-4xl w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${actionStatus ? 'scale-95 opacity-90 grayscale' : ''}`}>
        
        {/* Header */}
        <div className="relative p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider border ${getPriorityColor(task.priority)}`}>
                {task.priority} PRIORITY
              </span>
              <span className="text-slate-500 text-xs uppercase tracking-widest">ID: {task.taskId.slice(-6)}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-slate-50 tracking-tight">
              {task.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-slate-400 bg-slate-950/50 px-4 py-2 rounded-lg border border-slate-800/50">
            <Clock size={16} className="text-amber-500" />
            <span className="text-sm font-medium">{formatDate(task.dueDate)}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Description & Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText size={14} /> Task Description
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg font-light">
                {task.description}
              </p>
            </div>

            {/* Meta Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/30 border border-slate-800/50">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Assigned By</p>
                  <p className="text-slate-200 font-medium">{task.assignedBy}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/30 border border-slate-800/50">
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Deadline</p>
                  <p className="text-slate-200 font-medium">{formatDate(task.dueDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-4 lg:border-l lg:border-slate-800 lg:pl-8">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Actions</h3>
            
            {/* View Document Button */}
            <button 
              onClick={() => setIsPdfOpen(true)}
              className="group relative overflow-hidden w-full p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-amber-500/50 transition-all duration-300 text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-950 rounded-lg text-amber-500 group-hover:text-amber-400 transition-colors">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-slate-200 font-medium group-hover:text-white">Task Brief</p>
                  <p className="text-xs text-slate-500">View PDF Document</p>
                </div>
              </div>
              <Eye size={18} className="text-slate-500 group-hover:text-amber-500 transition-colors" />
            </button>

            <div className="h-px bg-slate-800 my-2" />

            {/* Accept / Reject Logic */}
            {actionStatus === 'accepted' ? (
              <div className="flex flex-col items-center justify-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 size={48} className="mb-2" />
                <span className="font-medium">Task Accepted</span>
              </div>
            ) : actionStatus === 'rejected' ? (
              <div className="flex flex-col items-center justify-center p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 animate-in fade-in zoom-in duration-300">
                <XCircle size={48} className="mb-2" />
                <span className="font-medium">Task Rejected</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleAction('accepted')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-900/20 hover:shadow-amber-500/20 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Accept Assignment
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => handleAction('rejected')}
                  className="w-full py-4 rounded-xl border border-slate-700 text-slate-400 hover:bg-rose-950/30 hover:border-rose-900 hover:text-rose-400 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Reject Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      {isPdfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div 
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsPdfOpen(false)}
          />
          
          <div className="relative w-full max-w-6xl h-[85vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <FileText className="text-amber-500" size={20} />
                <h3 className="text-slate-200 font-medium">Document Viewer</h3>
              </div>
              <button 
                onClick={() => setIsPdfOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* PDF Viewer Container */}
            <div className="flex-1 bg-slate-800 relative overflow-hidden rounded-b-2xl">
              {task.pdfUrl ? (
                <iframe 
                  src={task.pdfUrl}
                  className="w-full h-full border-0"
                  title="Task PDF"
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <p>No PDF URL provided</p>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur px-6 py-2 rounded-full border border-slate-700 text-sm text-slate-400 shadow-xl">
              Preview Mode • {task.title}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GetAssignedTask;