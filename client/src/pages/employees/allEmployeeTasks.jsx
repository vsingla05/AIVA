import useFetchEmployeeTasks from '../../hooks/useFetchEmployeeTasks'
import TaskCard from '../../components/employees/task/taskCard'

export default function AllEmployeeTasks() {
  const { tasks, loading, error } = useFetchEmployeeTasks();

  if (loading) return <p className="text-center text-gray-500">Loading tasks...</p>;
  if (error) return <p className="text-center text-red-500">Failed to load tasks.</p>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tasks</h1>
      {tasks && tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No tasks assigned yet.</p>
      )}
    </div>
  );
}