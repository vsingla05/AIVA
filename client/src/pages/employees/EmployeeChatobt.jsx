// client/src/pages/ChatBot.jsx
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ArrowLeft, Loader2 } from "lucide-react";
import api from '../../components/auth/api'

const Bubble = ({ text, sender }) => {
  const isUser = sender === "HR" || sender === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex max-w-[75%] gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
          isUser ? "bg-black text-white" : "bg-white"
        }`}>
          {isUser ? <User size={14} /> : <Bot size={16} />}
        </div>

        <div className={`px-5 py-3 rounded-2xl text-sm shadow-sm ${
          isUser ? "bg-black text-white rounded-tr-none" : "bg-gray-100 rounded-tl-none"
        }`}>
          {text}
        </div>
      </div>
    </div>
  );
};

export default function EmployeeChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input;

    setMessages((p) => [...p, { sender: "HR", text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/ai/employee/chat", { command: userText });
      setMessages((p) => [...p, { sender: "AI", text: res.data.reply }]);
    } catch {
      setMessages((p) => [...p, { sender: "AI", text: "Server error. Try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Root: must be flex-1 min-h-0 for scroll to work inside DashboardLayout
    <div className="flex flex-col flex-1 min-h-0 w-full h-full">
      {/* Header */}
      <div className="h-16 border-b flex items-center gap-3 px-6 flex-shrink-0">
        <Bot size={20} />
        <div>
          <h3 className="font-bold text-sm">OFFICE AI</h3>
          <p className="text-xs text-gray-500">Always online</p>
        </div>
      </div>

      {/* Messages: scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {messages.map((m, i) => (
          <Bubble key={i} text={m.text} sender={m.sender} />
        ))}
        {isLoading && <p className="text-sm text-gray-400">AI typing…</p>}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-3 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something..."
          className="flex-1 px-4 py-3 border rounded-lg"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="px-5 bg-black text-white rounded-lg"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
