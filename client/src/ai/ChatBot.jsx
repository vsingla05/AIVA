import { useState, useRef, useEffect } from "react";
import api from "../components/auth/api";
import AnimatedMulti from "../ui/SearchBox";
export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [employeeIds, setEmployeeId] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const emptyReplies = [
      "Oops, it looks like you didn’t type anything. Could you enter the task?",
      "Hmm, I didn’t catch that. Please write the task first 🙂",
      "Looks like you pressed send without typing. Can you add the task details?",
    ];

    if (!input.trim()) {
      const reply =
        emptyReplies[Math.floor(Math.random() * emptyReplies.length)];
      setMessages((prev) => [...prev, { sender: "AI", text: reply }]);
      return;
    }

    // Add HR message
    setMessages((prev) => [...prev, { sender: "HR", text: input }]);

    console.log("Sending command:", input);
    console.log("Employee IDs:", employeeIds);
    let aiReply;

    try {
      const res = await api.post("/ai/chat", {
        command: input,
      });
      aiReply = res.data.reply || "Sorry, I couldn't understand.";

      setMessages((prev) => [...prev, { sender: "AI", text: aiReply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "AI", text: aiReply }]);
    }

    setInput("");
  };

  return (
    <>
      <AnimatedMulti onSelectEmployees={(ids = []) => setEmployeeId(ids)} />
      {console.log("from chatbot", employeeIds)}
      <div className="flex flex-col w-full max-w-md mx-auto border border-gray-300 rounded-lg shadow-lg p-4 h-[500px]">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.sender === "HR" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 rounded-lg max-w-xs ${
                  m.sender === "HR"
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

        {/* Input */}
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
