import React from 'react';
import { Link } from 'react-router-dom';

// Utility function to get a color based on priority
const getPriorityColor = (priority) => {
  switch (priority?.toUpperCase()) {
    case 'HIGH': return 'bg-red-100 text-red-800';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
    case 'LOW': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function TaskCard({ task }) {
  const completedPhases = task.phases.filter(phase => phase.completedAt).length;
  const totalPhases = task.phases.length;
  const progress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
  
  // Get the latest due date for the card display
  const finalDueDate = totalPhases > 0 
    ? new Date(task.phases[totalPhases - 1].dueDate).toLocaleDateString() 
    : 'N/A';

  return (
    <Link to={`/employee/task/${task._id}`} className="block hover:no-underline">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer border border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800 pr-4">{task.title}</h3>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Final Due Date: {finalDueDate}</p>
        
        <div className="mb-1">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-blue-700">{progress}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </Link>
  );
}