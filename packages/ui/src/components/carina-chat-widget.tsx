"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  getCarinaWelcomeMessage,
  getCarinaQuickReplies,
} from "@repo/utils";
import type { CarinaMessage } from "@repo/utils";

interface CarinaChatWidgetProps {
  role: "admin" | "client";
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
      <img
        src="/carina.png"
        alt=""
        width={24}
        height={24}
        style={{ height: 24, width: 24, borderRadius: "9999px", objectFit: "cover" }}
        aria-hidden="true"
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          borderRadius: "12px 12px 12px 2px",
          backgroundColor: "var(--color-muted)",
          padding: "12px 16px",
        }}
      >
        <span
          className="animate-bounce"
          style={{
            height: 8,
            width: 8,
            borderRadius: "9999px",
            backgroundColor: "var(--color-muted-foreground)",
            opacity: 0.4,
            animationDelay: "-0.3s",
          }}
        />
        <span
          className="animate-bounce"
          style={{
            height: 8,
            width: 8,
            borderRadius: "9999px",
            backgroundColor: "var(--color-muted-foreground)",
            opacity: 0.4,
            animationDelay: "-0.15s",
          }}
        />
        <span
          className="animate-bounce"
          style={{
            height: 8,
            width: 8,
            borderRadius: "9999px",
            backgroundColor: "var(--color-muted-foreground)",
            opacity: 0.4,
          }}
        />
      </div>
    </div>
  );
}

function QuickReplies({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (text: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "0 4px" }}>
      {suggestions.map((text) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          style={{
            borderRadius: "9999px",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-background)",
            padding: "6px 12px",
            fontSize: 12,
            color: "var(--color-muted-foreground)",
            transition: "all 150ms",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary)";
            e.currentTarget.style.backgroundColor = "var(--color-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.backgroundColor = "var(--color-background)";
          }}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [input, setInput] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <div
      style={{
        borderTop: "1px solid var(--color-border)",
        backgroundColor: "var(--color-background)",
        padding: "12px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          disabled={disabled}
          style={{
            flex: 1,
            resize: "none",
            borderRadius: 8,
            border: "1px solid var(--color-input)",
            backgroundColor: "var(--color-background)",
            padding: "10px 12px",
            fontSize: 14,
            lineHeight: "1.5",
            color: "var(--color-foreground)",
            outline: "none",
            minHeight: 40,
            maxHeight: 120,
          }}
          aria-label="Type your message"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          style={{
            display: "flex",
            height: 40,
            width: 40,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            border: "none",
            cursor: disabled || !input.trim() ? "not-allowed" : "pointer",
            opacity: disabled || !input.trim() ? 0.5 : 1,
          }}
          aria-label="Send message"
        >
          <svg style={{ height: 16, width: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function CarinaChatWidget({ role }: CarinaChatWidgetProps) {
  const welcomeMessage = React.useMemo(() => getCarinaWelcomeMessage(role), [role]);
  const quickReplies = React.useMemo(() => getCarinaQuickReplies(role), [role]);
  const [messages, setMessages] = React.useState<CarinaMessage[]>([
    { role: "assistant", content: welcomeMessage },
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showQuickReplies, setShowQuickReplies] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const [canRender, setCanRender] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanRender(true);
  }, []);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendMessage = React.useCallback(
    async (content: string) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setShowQuickReplies(false);
      const userMessage: CarinaMessage = { role: "user", content };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsLoading(true);

      try {
        const response = await fetch("/api/carina", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let assistantContent = "";
        let firstChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data) as { content: string };
                assistantContent += parsed.content;
                if (firstChunk) {
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: assistantContent },
                  ]);
                  firstChunk = false;
                } else {
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm sorry, I encountered an error. Please try again later.",
          },
        ]);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, role]
  );

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  if (!canRender) return null;

  return createPortal(
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          height: 48,
          width: 48,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "9999px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "none",
          cursor: "pointer",
          backgroundColor: isOpen ? "var(--color-muted)" : "var(--color-primary)",
          color: isOpen ? "var(--color-muted-foreground)" : "var(--color-primary-foreground)",
          overflow: "hidden",
          transition: "all 200ms",
        }}
        aria-label={isOpen ? "Close Carina chat" : "Open Carina chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg style={{ height: 20, width: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <img
            src="/carina.png"
            alt=""
            width={48}
            height={48}
            style={{ height: 48, width: 48, borderRadius: "9999px", objectFit: "cover" }}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Chat window */}
      <div
        style={{
          position: "fixed",
          bottom: 84,
          right: 24,
          zIndex: 9999,
          display: "flex",
          width: "min(380px, calc(100vw - 48px))",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 12,
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-background)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
          maxHeight: 520,
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0)" : "translateY(16px)",
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 200ms, transform 200ms",
        }}
        role="dialog"
        aria-label="Carina chat"
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "var(--color-muted)",
            padding: "12px 16px",
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              src="/carina.png"
              alt="Carina avatar"
              width={36}
              height={36}
              style={{ height: 36, width: 36, borderRadius: "9999px", objectFit: "cover" }}
            />
            <span
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                height: 12,
                width: 12,
                borderRadius: "9999px",
                border: "2px solid var(--color-background)",
                backgroundColor: "var(--color-success)",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, lineHeight: "1.2", margin: 0 }}>Carina</h3>
            <p style={{ marginTop: 2, fontSize: 12, color: "var(--color-muted-foreground)", margin: "2px 0 0" }}>
              UCare AI Assistant
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex",
              height: 32,
              width: 32,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              border: "none",
              background: "none",
              color: "var(--color-muted-foreground)",
              cursor: "pointer",
            }}
            aria-label="Close chat"
          >
            <svg style={{ height: 16, width: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={`${msg.role}-${i}`}
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "assistant" && (
                <img
                  src="/carina.png"
                  alt=""
                  width={24}
                  height={24}
                  style={{ height: 24, width: 24, borderRadius: "9999px", objectFit: "cover", flexShrink: 0 }}
                  aria-hidden="true"
                />
              )}
              <div
                style={{
                  maxWidth: "85%",
                  borderRadius: 12,
                  padding: "10px 16px",
                  fontSize: 14,
                  lineHeight: "1.6",
                  ...(msg.role === "user"
                    ? {
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-primary-foreground)",
                        borderBottomRightRadius: 4,
                      }
                    : {
                        backgroundColor: "var(--color-muted)",
                        color: "var(--color-foreground)",
                        borderBottomLeftRadius: 4,
                      }),
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        {showQuickReplies && !isLoading && messages.length <= 1 && (
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              padding: "8px 16px",
            }}
          >
            <QuickReplies suggestions={quickReplies} onSelect={handleQuickReply} />
          </div>
        )}

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </>,
    document.body
  );
}
