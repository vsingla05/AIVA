import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Trash2,
  MessageSquare
} from "lucide-react";
import api from "../../components/auth/api";

/* ───────── MESSAGE BUBBLE ───────── */
const Bubble = ({ text, sender }) => {
  const isUser = sender === "user" || sender === "HR";

  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      } mb-6 animate-in fade-in slide-in-from-bottom-2`}
    >
      <div
        className={`flex max-w-[85%] lg:max-w-[75%] gap-4 ${
          isUser ? "flex-row-reverse" : ""
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
            isUser
              ? "bg-indigo-600 text-white border-indigo-500"
              : "bg-white text-indigo-600 border-slate-200"
          }`}
        >
          {isUser ? <User size={18} /> : <Bot size={20} />}
        </div>

        {/* Bubble */}
        <div
          className={`px-6 py-3 rounded-[1.75rem] text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-indigo-600 text-white rounded-tr-none font-medium"
              : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

/* ───────── SUGGESTION CHIP ───────── */
const SuggestionChip = ({ text, onClick }) => (
  <button
    onClick={() => onClick(text)}
    className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all flex items-center gap-3"
  >
    <span className="w-2 h-2 rounded-full bg-indigo-500" />
    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
      {text}
    </span>
  </button>
);

export default function EmployeeChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (explicitText = null) => {
    const textToSend = explicitText || input;
    if (!textToSend.trim() || isLoading) return;

    setMessages((p) => [...p, { sender: "user", text: textToSend }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/ai/employee/chat", {
        command: textToSend,
      });
      setMessages((p) => [
        ...p,
        { sender: "AI", text: res.data.reply },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          sender: "AI",
          text: "I'm having trouble connecting to workspace data. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-[calc(100vh-80px)] w-full bg-[#F8FAFC]">

      {/* ───────── HEADER ───────── */}
      <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 tracking-tight">
              Smart Chat
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Office AI • Online
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setMessages([])}
          className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 rounded-lg"
        >
          <Trash2 size={18} />
        </button>
      </header>

      {/* ───────── CHAT AREA ───────── */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6 shadow-inner">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                Hello, Vansh 👋
              </h2>
              <p className="text-slate-500 font-medium text-sm mb-10 max-w-sm">
                I can help you with tasks, efficiency, leave policies, and
                workspace insights.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <SuggestionChip
                  text="My Efficiency Rate"
                  onClick={sendMessage}
                />
                <SuggestionChip
                  text="Tasks Due Today"
                  onClick={sendMessage}
                />
                <SuggestionChip text="Leave Policy" onClick={sendMessage} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((m, i) => (
                <Bubble key={i} text={m.text} sender={m.sender} />
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 text-indigo-600 font-bold text-[11px] uppercase tracking-widest ml-14 py-2">
                  <Loader2 className="animate-spin" size={14} />
                  Analyzing workspace data…
                </div>
              )}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ───────── INPUT DOCK (FIXED) ───────── */}
      <div className="p-6 shrink-0 bg-white/60 backdrop-blur border-t border-slate-100">
        <div className="max-w-4xl mx-auto relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask me anything about your work..."
            className="
              w-full
              h-14
              pl-6 pr-16
              bg-white
              border border-slate-200
              rounded-2xl
              shadow-lg shadow-indigo-100/30
              focus:border-indigo-600
              focus:ring-4 focus:ring-indigo-50
              outline-none
              transition-all
              font-medium
              text-slate-700
            "
          />

          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              w-10 h-10
              bg-indigo-600
              text-white
              rounded-xl
              flex items-center justify-center
              hover:bg-indigo-500
              disabled:opacity-30
              transition-all
              shadow-md shadow-indigo-200
            "
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <p className="text-center mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Powered by SmartOffice AI
        </p>
      </div>
    </main>
  );
}
