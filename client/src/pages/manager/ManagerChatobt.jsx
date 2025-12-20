import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, User, Loader2, Sparkles, 
  BarChart3, Zap, Trash2, Users, Target
} from "lucide-react";
import api from '../../components/auth/api';

const Bubble = ({ text, sender }) => {
  const isManager = sender === "HR" || sender === "user";
  return (
    <div className={`flex w-full ${isManager ? "justify-end" : "justify-start"} mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[85%] lg:max-w-[75%] gap-4 ${isManager ? "flex-row-reverse" : ""}`}>
        {/* Icon Container */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
          isManager ? "bg-black text-white border-black" : "bg-white text-black border-slate-200 shadow-sm"
        }`}>
          {isManager ? <User size={18} /> : <Bot size={20} />}
        </div>

        {/* Message Box */}
        <div className={`px-6 py-4 rounded-[1.8rem] text-sm md:text-base shadow-sm ${
          isManager 
            ? "bg-black text-white rounded-tr-none" 
            : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
        }`}>
          <p className="font-medium leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
};

const SuggestionCard = ({ icon, text, onClick }) => (
  <button 
    onClick={() => onClick(text)}
    className="group flex flex-col items-center gap-3 p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-black hover:shadow-xl transition-all text-center"
  >
    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
      {icon}
    </div>
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-black transition-colors">{text}</span>
  </button>
);

export default function ManagerChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (explicitText = null) => {
    const textToSend = explicitText || input;
    if (!textToSend.trim()) return;

    setMessages((p) => [...p, { sender: "HR", text: textToSend }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/ai/manager/chat", { command: textToSend });
      setMessages((p) => [...p, { sender: "AI", text: res.data.reply }]);
    } catch {
      setMessages((p) => [...p, { sender: "AI", text: "System link error. Intelligence data unreachable." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-[calc(100vh-80px)] w-full bg-[#F8FAFC]">
      
      {/* ─── HEADER ─── */}
      <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-lg shadow-slate-200">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 tracking-tight uppercase italic">Manager Intelligence</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Link</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([])} 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
        >
          <Trash2 size={14}/> Clear Session
        </button>
      </header>

      {/* ─── CHAT AREA ─── */}
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="py-20 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-black mb-8 border border-slate-100">
                <Bot size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight italic text-center uppercase">
                Systems Online
              </h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-12">How can I assist your leadership today?</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <SuggestionCard icon={<Users size={20}/>} text="Team Sync" onClick={sendMessage} />
                <SuggestionCard icon={<Target size={20}/>} text="Bottlenecks" onClick={sendMessage} />
                <SuggestionCard icon={<BarChart3 size={20}/>} text="Efficiency" onClick={sendMessage} />
                <SuggestionCard icon={<Sparkles size={20}/>} text="Insights" onClick={sendMessage} />
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => <Bubble key={i} text={m.text} sender={m.sender} />)}
              {isLoading && (
                <div className="flex items-center gap-3 text-black font-black text-[10px] uppercase tracking-widest ml-14">
                   <Loader2 className="animate-spin" size={14} /> AI processing...
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ─── INPUT DOCK ─── */}
      <div className="p-6 shrink-0">
        <div className="max-w-4xl mx-auto relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Search performance data or ask a question..."
            className="w-full pl-8 pr-20 py-5 bg-white border-2 border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 focus:border-black outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 disabled:opacity-10 transition-all shadow-lg"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
        <p className="text-center mt-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
          Executive Interface v2.0 • Data Synchronized
        </p>
      </div>

    </main>
  );
}