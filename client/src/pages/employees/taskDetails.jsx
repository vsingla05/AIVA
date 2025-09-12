import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // CHANGED: Imported useNavigate for redirection
import api from "../../components/auth/api";

// --- Icon Components (Replacing react-icons) ---
// ... (Your SVG icon components remain the same)
const FaArrowLeft = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" > <path d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"></path> </svg>
);
const FaCalendarAlt = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M12 192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zm436-44V64c0-26.5-21.5-48-48-48h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v4h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v4H96V12c0-6.6-5.4-12-12-12H44c-6.6 0-12 5.4-12 12v4H0v84c0 6.6 5.4 12 12 12h424c6.6 0 12-5.4 12-12z"></path> </svg>
);
const FaCheckCircle = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path> </svg>
);
const FaClipboardList = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 40c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm104 304h-16c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zm0-80h-16c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zm0-80h-16c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zm-80 160H128c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h96c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zm0-80H128c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h96c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zm0-80H128c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h96c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8z"></path> </svg>
);
const FaClock = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8l-22.4 30.8c-3.9 5.3-11.4 6.5-16.8 2.5z"></path> </svg>
);
const FaExclamationTriangle = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-60.035-39.993-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.982 12.654z"></path> </svg>
);
const FaFileUpload = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path> </svg>
);
const FaPaperclip = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm64 236c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-64c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-72v8c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12zM384 128L256 0v128h128z"></path> </svg>
);
const FaRegCircle = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z"></path> </svg>
);
const FaSpinner = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path> </svg>
);
const FaTimesCircle = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"></path> </svg>
);


// --- Helper Components (Modal, Notification) ---
const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="text-gray-600">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;
  const baseClasses =
    "fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3";
  const typeClasses = {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
      <span>{message}</span>
    </div>
  );
};

// --- Main Component ---
export default function TaskDetailsPage() {
  // --- State Management ---
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phaseToComplete, setPhaseToComplete] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const { id } = useParams();
  const navigate = useNavigate(); // CHANGED: Hook for programmatic navigation

  // CHANGED: Fetch a specific task by its ID
  useEffect(() => {
    const fetchTaskDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/employee/task/${id}`);
        if (res.status === 200) {
          setTask(res.data.task); // Assuming backend returns { task: {...} }
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          "Failed to fetch task details. Please try again.";
        setError(errorMessage);
        setNotification({ message: errorMessage, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTaskDetails();
    }
  }, [id]); // Rerun effect if the task ID changes

  // --- Event Handlers ---
  const handleFileChange = (e) => setProofFile(e.target.files[0]);

  const handlePhaseClick = (phase) => {
    // Only allow marking incomplete phases as complete
    if (phase && !phase.completedAt) {
      setIsModalOpen(true);
      setPhaseToComplete(phase._id);
    }
  };

  // CHANGED: API call to complete a phase
  const handleConfirmCompletePhase = async () => {
    if (!phaseToComplete) return;

    try {
      // API endpoint from your router: /api/v1/task/:id/phase/:pid
      const res = await api.post(`/task/${id}/phase/${phaseToComplete}`);
      
      if (res.status === 200) {
        setTask(res.data.task); // Update the task state with the returned data
        setNotification({
          message: "Phase marked as complete!",
          type: "success",
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update phase.";
      setNotification({ message: errorMessage, type: "error" });
    } finally {
      setIsModalOpen(false);
      setPhaseToComplete(null);
    }
  };

  // CHANGED: API call to submit proof
  const handleSubmitProof = async () => {
    if (!proofFile) {
      setNotification({
        message: "Please select a proof file first.",
        type: "error",
      });
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("file", proofFile); // The key "file" must match your backend (upload.single('file'))

    try {
      // API endpoint from your router: /api/v1/task/:id/finalSubmit
      const res = await api.post(`/task/${id}/finalSubmit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        setTask(res.data.updatedTask); // Update state with the final task details
        setNotification({
          message: "Proof submitted successfully! Redirecting...",
          type: "success",
        });
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/employee/tasks");
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "File submission failed.";
      setNotification({ message: errorMessage, type: "error" });
      setIsSubmitting(false);
    }
    // No finally block to reset isSubmitting, as we navigate away on success
  };
  
  // --- Link Stub (for standalone rendering if needed, but useNavigate is better) ---
  const Link = ({ to, children, ...props }) => (
    <a href={to} onClick={(e) => { e.preventDefault(); navigate(to); }} {...props}>
      {children}
    </a>
  );
  
  // --- Conditional Rendering ---
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center mt-10">
        Error: {error}
        <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ message: "", type: "" })}
        />
      </div>
    );
  if (!task)
    return <div className="text-center mt-10">Task not found.</div>;
  
  // --- Derived State ---
  const allPhasesDone = task.phases?.every((p) => !!p.completedAt);
  const isProofSubmitted = task.proofOfCompletion;
  const statusStyles = {
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    DONE: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCompletePhase}
        title="Confirm Completion"
      >
        Are you sure you want to mark this phase as complete? This action cannot
        be undone.
      </Modal>
      
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/employee/tasks")}
          className="flex items-center gap-2 text-blue-600 hover:underline mb-6 font-medium"
        >
          <FaArrowLeft /> Back to All Tasks
        </button>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
              <p className="text-gray-500 mt-1">
                Assigned by: {task.assignedBy?.name || "N/A"}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                statusStyles[task.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {task.status.replace("_", " ")}
            </span>
          </div>
          {task.status === "REJECTED" && task.rejectionReason && (
            <div
              className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6"
              role="alert"
            >
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-xl" />
                <div>
                  <p className="font-bold">Task Rejected</p>
                  <p>{task.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="p-4 border rounded-lg bg-gray-50/50">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700">
                  <FaClipboardList />
                  Details
                </h2>
                <div className="space-y-3 text-sm">
                  <p>
                    <strong>Priority:</strong> {task.priority}
                  </p>
                  <p>
                    <strong>Est. Hours:</strong> {task.estimatedHours}
                  </p>
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50/50">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {task.requiredSkills?.map((skill) => (
                    <span
                      key={skill._id}
                      className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-sm font-medium"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Phases
              </h2>
              <ul className="space-y-3">
                {task.phases?.map((phase) => (
                  <li
                    key={phase._id}
                    onClick={() => handlePhaseClick(phase)} // CHANGED: Pass the whole phase object
                    className={`flex items-center p-4 rounded-lg border transition-all ${
                      phase.completedAt
                        ? "bg-green-50 border-green-200 cursor-not-allowed opacity-70"
                        : "bg-white hover:bg-gray-50 hover:border-blue-400 cursor-pointer"
                    }`}
                  >
                    <div className="text-xl mr-4">
                      {phase.completedAt ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaRegCircle className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <span
                        className={`font-medium ${
                          phase.completedAt
                            ? "line-through text-gray-500"
                            : "text-gray-800"
                        }`}
                      >
                        {phase.title}
                      </span>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <FaCalendarAlt /> Due:{" "}
                        {new Date(phase.dueDate).toLocaleDateString()}
                        {phase.delayCategory !== "NONE" && (
                          <span className="ml-2 flex items-center gap-1 text-yellow-600 font-semibold">
                            <FaClock /> Delayed
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {/* This section will now correctly appear only when all phases are marked as complete */}
              {allPhasesDone && (
                <div className="mt-8 p-5 border-t-2 border-dashed">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    Final Task Submission
                  </h3>
                  {isProofSubmitted ? (
                    <div className="p-4 border rounded-lg bg-green-50 text-green-700 flex items-center gap-3">
                      <FaCheckCircle className="text-2xl" />
                      <div>
                        <p className="font-semibold">
                          Proof of completion has been submitted.
                        </p>
                        <a
                          href={task.proofOfCompletion.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline hover:text-green-900 flex items-center gap-1"
                        >
                          <FaPaperclip /> View Submitted File
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <label
                        htmlFor="file-upload"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Upload Proof of Completion
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {proofFile && (
                        <p className="text-xs text-gray-600 mt-2">
                          Selected: {proofFile.name}
                        </p>
                      )}
                      <button
                        onClick={handleSubmitProof}
                        disabled={isSubmitting}
                        className="mt-4 w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-wait flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaFileUpload />
                        )}{" "}
                        {isSubmitting ? "Submitting..." : "Submit Final Proof"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}