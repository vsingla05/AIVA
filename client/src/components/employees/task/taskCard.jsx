export default function TaskCard({ task, report }) {
  return (
    <div className="border p-4 rounded-lg shadow-sm mb-4">
      <h1 className="text-lg font-bold">{task.title}</h1>
      <h2>Assigned by: {task.assignedBy?.name}</h2>
      <h2>Priority: {task.priority}</h2>
      <h2>Estimated Hours: {task.estimatedHours}</h2>

      <h2>Required Skills:</h2>
      <ul className="list-disc ml-6">
        {task.requiredSkills.map((skill) => (
          <li key={skill._id}>
            {skill.name} - {skill.level}
          </li>
        ))}
      </ul>

      <h2>Task Phases:</h2>
      <ul className="list-disc ml-6">
        {task.phases.map((phase) => (
          <li key={phase._id}>
            <p>Title: {phase.title}</p>
            <p>Due: {new Date(phase.dueDate).toLocaleDateString()}</p>
            <p>
              Completed:{" "}
              {phase.completedAt
                ? new Date(phase.completedAt).toLocaleDateString()
                : "Not yet"}
            </p>
          </li>
        ))}
      </ul>

      {report ? (
        <a
          href='#'
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          View Report (PDF)
        </a>
      ) : (
        <p className="text-gray-500">No report available</p>
      )}
    </div>
  );
}
