"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Appliance, ChatMessage } from "@/types";

interface ChatInterfaceProps {
  appliances: Appliance[];
  initialMessage?: string;
  onClearInitial?: () => void;
}

const SUGGESTED_PROMPTS: { icon: string; text: string }[] = [
  { icon: "📅", text: "What maintenance should I do this month?" },
  { icon: "🛡️", text: "Which appliances have warranties expiring soon?" },
  { icon: "🔧", text: "How do I clean my fridge coils?" },
  { icon: "💧", text: "When should I replace my water heater?" },
  { icon: "👕", text: "What are signs my washer needs servicing?" },
];

function renderContent(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("### "))
      return <h3 key={i} className="font-bold text-sm mt-2">{line.slice(4)}</h3>;
    if (line.startsWith("## "))
      return <h2 key={i} className="font-bold mt-2">{line.slice(3)}</h2>;
    if (line.startsWith("- ") || line.startsWith("• "))
      return <li key={i} className="ml-4 list-disc">{inlineFmt(line.slice(2))}</li>;
    if (/^\d+\. /.test(line))
      return <li key={i} className="ml-4 list-decimal">{inlineFmt(line.replace(/^\d+\. /, ""))}</li>;
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return <p key={i} className="leading-relaxed">{inlineFmt(line)}</p>;
  });
}

function inlineFmt(text: string): React.ReactNode {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-black/10 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

export default function ChatInterface({
  appliances,
  initialMessage,
  onClearInitial,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialSentRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;
      setError(null);

      const userMsg: ChatMessage = { role: "user", content: text.trim(), timestamp: Date.now() };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setInput("");
      setIsStreaming(true);

      const assistantMsg: ChatMessage = { role: "assistant", content: "", timestamp: Date.now() };
      setMessages([...updated, assistantMsg]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updated.map((m) => ({ role: m.role, content: m.content })),
            appliances,
          }),
        });

        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { ...next[next.length - 1], content: acc };
            return next;
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, appliances, isStreaming],
  );

  useEffect(() => {
    if (initialMessage && !initialSentRef.current) {
      initialSentRef.current = true;
      sendMessage(initialMessage);
      onClearInitial?.();
    }
  }, [initialMessage, sendMessage, onClearInitial]);

  useEffect(() => {
    if (!initialMessage) initialSentRef.current = false;
  }, [initialMessage]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="w-11 h-11 bg-haven-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 text-base leading-tight">HavenAlly AI Assistant</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">AI Assistant Active</span>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setError(null); }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {isEmpty ? (
          <>
            {/* Welcome bubble */}
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-haven-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">HavenAlly</p>
                <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-200 p-4 shadow-sm max-w-sm">
                  <p className="text-haven-600 font-bold text-sm mb-2 flex items-center gap-1.5">
                    🔧 WELCOME
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Hi! I&apos;m HavenAlly. Ask me anything about your appliances — maintenance, troubleshooting, and more.
                  </p>
                </div>
              </div>
            </div>

            {/* Suggested prompts */}
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2 px-1">
                Suggested Prompts
              </p>
              <div className="space-y-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p.text}
                    onClick={() => sendMessage(p.text)}
                    className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-left hover:border-haven-300 hover:bg-haven-50 transition-colors shadow-sm"
                  >
                    <span className="text-xl shrink-0">{p.icon}</span>
                    <span className="text-sm text-gray-700 font-medium">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 bg-haven-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-haven-600 text-white rounded-tr-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    msg.content ? (
                      <div className="space-y-0.5">{renderContent(msg.content)}</div>
                    ) : (
                      <span className="inline-flex gap-1 py-1">
                        {[0, 150, 300].map((d) => (
                          <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </span>
                    )
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {error && (
          <div className="text-center">
            <span className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-lg inline-block">
              ⚠️ {error}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your appliances..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-haven-400 disabled:opacity-50 max-h-32 scrollbar-thin placeholder-gray-400"
            style={{ minHeight: "42px" }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "42px";
              t.style.height = Math.min(t.scrollHeight, 128) + "px";
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="w-11 h-11 flex items-center justify-center bg-haven-600 hover:bg-haven-700 text-white rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2 tracking-wider uppercase">
          Powered by Claude · Enter to send
        </p>
      </div>
    </div>
  );
}
