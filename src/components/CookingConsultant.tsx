"use client";

import { useState, useRef, useEffect } from "react";
import { ChefHat, Send, X, Loader2, ChevronDown } from "lucide-react";
import { usePantry } from "@/context/PantryContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CookingConsultant({ alwaysOpen = false }: { alwaysOpen?: boolean }) {
  const { items } = usePantry();
  const [isOpen, setIsOpen] = useState(alwaysOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || isTyping) return;

    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, pantryItems: items }),
      });
      const { reply } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-white border border-[#0B4D26]/10 rounded-2xl hover:border-[#207245]/30 hover:shadow-sm transition-all text-left"
      >
        <div className="w-9 h-9 bg-[#207245]/10 rounded-full flex items-center justify-center flex-shrink-0">
          <ChefHat className="w-5 h-5 text-[#207245]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0B4D26] text-sm">Cooking Consultant</p>
          <p className="text-[#0B4D26]/50 text-xs truncate">Ask me what to cook with your pantry</p>
        </div>
        <ChevronDown className="w-4 h-4 text-[#0B4D26]/40 flex-shrink-0 rotate-[-90deg]" />
      </button>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-[#0B4D26]/10 shadow-sm overflow-hidden flex flex-col ${alwaysOpen ? "h-full" : ""}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#0B4D26]/10">
        <div className="w-8 h-8 bg-[#207245]/10 rounded-full flex items-center justify-center">
          <ChefHat className="w-4 h-4 text-[#207245]" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[#0B4D26] text-sm">Cooking Consultant</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-[#0B4D26]/50" />
        </button>
      </div>

      {/* Messages */}
      <div className={`flex flex-col gap-3 p-4 overflow-y-auto ${alwaysOpen ? "flex-1" : "max-h-72"}`}>
        {messages.length === 0 && (
          <div className="text-center py-4">
            <p className="text-[#0B4D26]/50 text-sm">
              Ask me what to cook, how to use up expiring ingredients, or anything food-related!
            </p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#0B4D26] text-white rounded-br-sm"
                  : "bg-[#F3F8F5] text-[#0B4D26] rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#F3F8F5] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 text-[#207245] animate-spin" />
              <span className="text-[#0B4D26]/50 text-xs">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 pb-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What can I cook tonight?"
          disabled={isTyping}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#0B4D26]/20 bg-gray-50/50 outline-none focus:ring-2 focus:ring-[#207245] focus:border-transparent transition-all placeholder:text-gray-400 text-[#0B4D26] text-sm disabled:opacity-60"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isTyping}
          className="p-2.5 bg-[#0B4D26] text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#207245] transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
