import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import useFetchIdTask from "../../hooks/useFetchIdTask";
import api from "../../components/auth/api";

export default function TaskDetailsPage() {
  const [proofFile, setProofFile] = useState(null);
  const { id } = useParams();
  const { task: fetchedTask, loading, error } = useFetchIdTask(id);

  const [task, setTask] = useState(null);

  useEffect(() => {
    if (fetchedTask) {
      setTask(fetchedTask);
    }
  }, [fetchedTask]);

  // ✅ Handle file select
  const handleFileChange = (e) => {
    setProofFile(e.target.files[0]);
  };

  const handlePhaseToggle = async (pid) => {
    if (!task) return;

    const confirm = window.confirm(
      "Are you sure you want to mark this phase as completed?"
    );
    if (!confirm) return;

    try {
      const res = await api.post(`/task/${id}/phase/${pid}`, {});
      if (res.status === 200) {
        setTask(res.data.task);
      }
    } catch (err) {
      console.error("Error updating phase:", err);
      alert("Something went wrong while updating the phase.");
    }
  };

  // ✅ Fixed: check if ALL phases are done
  const allPhasesDone = task?.phases?.every((p) => p.status === "DONE");

  const handleSubmitProof = async () => {
    if (!proofFile) {
      alert("Please upload a proof file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("file", proofFile);

    try {
      const res = await api.post(`/task/${id}/finalSubmit`, formData)

      if (res.status === 200) {
        setTask(res.data.task);
        alert("Proof submitted successfully!");
      }
    } catch (err) {
      console.error("Error submitting proof:", err);
      alert("Failed to submit proof.");
    }
  };

  if (loading) return <p>Loading task details...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!task) return <p>Task not found.</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <Link
        to="/employee/tasks"
        className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
      >
        <FaArrowLeft />
        Back to All Tasks
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
      <p className="text-gray-600 mb-6">Assigned by: {task.assignedBy?.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Details</h2>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Priority:</strong> {task.priority}
            </p>
            <p>
              <strong>Est. Hours:</strong> {task.estimatedHours}
            </p>
            <div>
              <strong className="block mb-2">Required Skills:</strong>
              <div className="flex flex-wrap gap-2">
                {task.requiredSkills?.map((skill) => (
                  <span
                    key={skill._id}
                    className="bg-gray-200 text-gray-800 px-2 py-1 rounded"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Phases */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Phases</h2>
          <ul className="space-y-4">
            {task.phases?.map((phase) => (
              <li
                key={phase._id}
                className="flex items-center p-3 rounded-md transition-colors border"
              >
                <input
                  type="checkbox"
                  checked={!!phase.completedAt}
                  onChange={() => handlePhaseToggle(phase._id)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  id={`phase-${phase._id}`}
                />
                <label
                  htmlFor={`phase-${phase._id}`}
                  className="ml-3 flex-grow cursor-pointer"
                >
                  <span
                    className={`block font-medium ${
                      phase.completedAt
                        ? "line-through text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    {phase.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    Due: {new Date(phase.dueDate).toLocaleDateString()}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {/* Final Task Proof Section */}
          {allPhasesDone && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2">Final Task Submission</h3>
              <input
                type="file"
                name="file"
                className="mb-2 block"
                onChange={handleFileChange}
              />
              <button
                onClick={handleSubmitProof}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit Proof
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
