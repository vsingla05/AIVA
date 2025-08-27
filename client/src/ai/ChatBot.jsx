import { useState, useRef, useEffect } from "react";
import api from "../components/auth/api";
import { useSelector } from "react-redux";
export default function ChatBot() {
    const user = useSelector((state)=> state.auth.user)
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input) return;

    // Add HR message
    setMessages(prev => [...prev, { sender: "HR", text: input }]);

    try {
        console.log(user);
        const res = await api.post("/ai/chat", { command: input, hrId:user?._id });
        const aiReply = res.data.reply || "Sorry, I couldn't understand.";

      setMessages(prev => [...prev, { sender: "AI", text: aiReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "AI", text: "Server error." }]);
    }

    setInput("");
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto border border-gray-300 rounded-lg shadow-lg p-4 h-[500px]">
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === "HR" ? "justify-end" : "justify-start"}`}
          >
            <div className={`p-2 rounded-lg max-w-xs ${m.sender === "HR" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
              <span className="font-semibold">{m.sender}: </span>{m.text}
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
  );
}
