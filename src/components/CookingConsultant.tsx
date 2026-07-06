"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, ChefHat, User, Trash2 } from "lucide-react"
import { usePantry } from "@/context/PantryContext"
import ReactMarkdown from "react-markdown"

interface Message {
  role: "user" | "assistant"
  content: string
}

const SUGGESTED_CHIPS = [
  "Recipe Adjustments",
  "Ingredient Substitutions",
  "Make my favorite recipe healthier",
  "Pantry Help",
  "Meal Planning",
]

export default function CookingConsultant({
  alwaysOpen = false,
}: {
  alwaysOpen?: boolean
}) {
  const { items } = usePantry()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isClearing, setIsClearing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load persisted history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/chat/history")
        if (res.ok) {
          const { messages: history } = await res.json()
          if (history?.length > 0) {
            setMessages(history.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })))
          }
        }
      } catch {
        // silently fail — history just won't load
      } finally {
        setIsLoadingHistory(false)
      }
    }
    loadHistory()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!isLoadingHistory) inputRef.current?.focus()
  }, [isLoadingHistory])

  const sendMessage = async (content?: string) => {
    const text = (content ?? input).trim()
    if (!text || isTyping) return

    const userMessage: Message = { role: "user", content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, pantryItems: items }),
      })
      const { reply } = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const clearHistory = async () => {
    if (!confirm("Clear your entire conversation history?")) return
    setIsClearing(true)
    try {
      await fetch("/api/chat/history", { method: "DELETE" })
      setMessages([])
    } catch {
      // silently fail
    } finally {
      setIsClearing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden flex flex-col ${alwaysOpen ? "h-full" : ""}`}
      style={{ background: "#ffffff", border: "1px solid #e4e2de" }}>

      {/* ── Header ── */}
      <div
        className="px-6 py-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}>
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.15)" }}>
          <ChefHat className="w-5 h-5 text-white" />
        </div>
        <div>
          <p
            className="font-bold text-base text-white"
            style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", letterSpacing: "-0.01em" }}>
            Kitchen AI
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            Ask YourPlantry
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              disabled={isClearing}
              title="Clear history"
              className="p-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.1)" }}>
              {isClearing
                ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                : <Trash2 className="w-3.5 h-3.5 text-white" />}
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Online</span>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        className={`flex flex-col gap-4 p-5 overflow-y-auto ${alwaysOpen ? "flex-1" : "max-h-80"}`}>

        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-10 gap-2" style={{ color: "#9ca39f" }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-5">
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "#f5f3ef" }}>
                <ChefHat className="w-7 h-7" style={{ color: "#2b6954" }} />
              </div>
              <p
                className="font-bold text-lg mb-1"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.01em" }}>
                Hey Chef!
              </p>
              <p className="text-sm" style={{ color: "#707974" }}>
                Ready to transform your larder today?
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="px-3.5 py-2 rounded-full text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: "#f5f3ef", border: "1px solid #e4e2de", color: "#404944" }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = "#cce6d9"
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = "#2b6954"
                    ;(e.currentTarget as HTMLButtonElement).style.color = "#003527"
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = "#f5f3ef"
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = "#e4e2de"
                    ;(e.currentTarget as HTMLButtonElement).style.color = "#404944"
                  }}>
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 self-end"
                style={{ background: msg.role === "assistant" ? "#cce6d9" : "#003527" }}>
                {msg.role === "assistant"
                  ? <ChefHat className="w-3.5 h-3.5" style={{ color: "#003527" }} />
                  : <User className="w-3.5 h-3.5 text-white" />}
              </div>
              <div
                className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? { background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)", color: "#ffffff", borderBottomRightRadius: "4px" }
                    : { background: "#f5f3ef", color: "#1b1c1a", borderBottomLeftRadius: "4px" }
                }>
                {msg.role === "user" ? msg.content : (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                      li: ({ children }) => <li className="leading-snug">{children}</li>,
                      h1: ({ children }) => <p className="font-bold text-base mb-1" style={{ color: "#003527" }}>{children}</p>,
                      h2: ({ children }) => <p className="font-bold text-base mb-1" style={{ color: "#003527" }}>{children}</p>,
                      h3: ({ children }) => <p className="font-semibold mb-1" style={{ color: "#003527" }}>{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      code: ({ children }) => (
                        <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: "#e8e4de" }}>{children}</code>
                      ),
                      pre: ({ children }) => (
                        <pre className="font-mono text-xs p-3 rounded-xl overflow-x-auto mb-2" style={{ background: "#e8e4de" }}>{children}</pre>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#cce6d9" }}>
              <ChefHat className="w-3.5 h-3.5" style={{ color: "#003527" }} />
            </div>
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
              style={{ background: "#f5f3ef", borderBottomLeftRadius: "4px" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#2b6954", animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#2b6954", animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#2b6954", animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div
        className="flex gap-2 px-5 pb-5 pt-2"
        style={{ borderTop: "1px solid #f5f3ef" }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about cooking..."
          disabled={isTyping || isLoadingHistory}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all disabled:opacity-60"
          style={{ background: "#f5f3ef", border: "1px solid #bfc9c3", color: "#1b1c1a" }}
          onFocus={(e) => (e.target.style.borderColor = "#2b6954")}
          onBlur={(e) => (e.target.style.borderColor = "#bfc9c3")}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isTyping || isLoadingHistory}
          className="p-2.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)", color: "#ffffff" }}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
