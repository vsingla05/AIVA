import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../components/auth/api";

export default function EmployeeChatbot() {
  const user = useSelector((state) => state.auth.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle message send
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const newMessage = { sender: "You", text: input };
    setMessages((prev) => [...prev, newMessage]);

    try {
      // Call your backend (which triggers FastAPI → OpenAI → Mongo)
      const res = await api.post("/leave/apply", {
        employeeId: user._id,
        message: input,
      });

      const aiReply =
        res.data.aiReply ||
        res.data.decision?.reply ||
        "Your leave request has been submitted and will be reviewed soon.";

      // Add AI reply to chat
      setMessages((prev) => [...prev, { sender: "AI", text: aiReply }]);
    } catch (err) {
      console.error(err);
      const errorText =
        err?.response?.data?.error ||
        "Sorry, something went wrong while processing your request.";
      setMessages((prev) => [...prev, { sender: "AI", text: errorText }]);
    }

    // Clear input
    setInput("");
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto border border-gray-300 rounded-lg shadow-lg p-4 h-[500px] bg-white">
      <h3 className="text-lg font-semibold mb-2 text-center text-gray-700">
        🧑‍💼 Employee Chatbot {user.name}
      </h3>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.sender === "You" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs ${
                m.sender === "You"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <span className="font-semibold">{m.sender}: </span>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input box */}
      <div className="flex">
        <input
          type="text"
          placeholder="Type your leave request..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
