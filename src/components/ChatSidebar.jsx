import { useState, useEffect, useRef } from "react";
import { OLLAMA_BASE, OLLAMA_MODEL } from "../api";

export default function ChatSidebar({ open, onClose, searchResults, currentQuery }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I can help you find products or answer questions about what's on screen. Try asking me something like \"which of these has the best rating?\" or \"find me something under $30\".",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const buildSystemPrompt = () => {
    const productContext = searchResults.slice(0, 8).map((p, i) =>
      `${i + 1}. "${p.title}" | Brand: ${p.brand || "N/A"} | Price: $${p.price?.toFixed(2) || "N/A"} | Rating: ${p.rating?.toFixed(1) || "N/A"} | Category: ${p.category || "N/A"}`
    ).join("\n");
    return `You are a helpful e-commerce shopping assistant embedded in a product search interface.
The user is currently searching for: "${currentQuery || "nothing yet"}"
Current search results on screen (up to 8 products):
${productContext || "No search results yet."}
Your job:
- Help the user find the right product based on their needs
- Answer questions about the products currently shown
- Suggest better search queries if needed
- Be concise - 2-3 sentences max per response
- If asked to search for something, suggest they type it in the search bar
- Never make up product details not shown above`;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const conversationHistory = newMessages
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");
      const fullPrompt = `${buildSystemPrompt()}\n\nConversation:\n${conversationHistory}\nAssistant:`;
      const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: fullPrompt,
          stream: false,
          options: { temperature: 0.7, num_predict: 200 },
        }),
      });
      if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response?.trim() || "Sorry, I couldn't generate a response.",
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠ Could not reach Ollama. Make sure it's running at ${OLLAMA_BASE}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([{
    role: "assistant",
    content: "Chat cleared. What can I help you find?",
  }]);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0,
      width: 360, background: "#131921",
      boxShadow: "-4px 0 20px rgba(0,0,0,0.4)",
      display: "flex", flexDirection: "column",
      zIndex: 200, fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ color: "#ff9900", fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>
            ✦ AI Assistant
          </div>
          <div style={{ color: "#888", fontSize: 10, marginTop: 2 }}>
            {OLLAMA_MODEL} · local
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={clearChat} style={{
            background: "rgba(255,255,255,0.08)", border: "none",
            borderRadius: 4, padding: "5px 10px", cursor: "pointer",
            color: "#888", fontSize: 11,
          }}>clear</button>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#888", fontSize: 18, lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div style={{
          margin: "10px 16px 0",
          background: "rgba(255,153,0,0.1)", border: "1px solid rgba(255,153,0,0.2)",
          borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#ff9900",
        }}>
          📦 {searchResults.length} products in context
          {currentQuery && <span style={{ color: "#888" }}> · "{currentQuery}"</span>}
        </div>
      )}

      <div style={{
        flex: 1, overflowY: "auto", padding: "16px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%",
              background: msg.role === "user" ? "#ff9900" : "rgba(255,255,255,0.08)",
              color: msg.role === "user" ? "#131921" : "#e0e0e0",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding: "10px 14px", fontSize: 13, lineHeight: 1.6,
              fontWeight: msg.role === "user" ? 600 : 400,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "16px 16px 16px 4px",
              padding: "10px 16px", color: "#ff9900", fontSize: 18, letterSpacing: 4,
            }}>···</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div style={{ padding: "0 16px 12px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Which has the best rating?", "Find something under $30", "Compare the top 2", "What's the cheapest option?"].map(s => (
            <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }} style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, padding: "5px 10px",
              fontSize: 11, color: "#aaa", cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
            }}>{s}</button>
          ))}
        </div>
      )}

      <div style={{
        padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex", gap: 8,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Ask about these products..."
          style={{
            flex: 1, background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8, padding: "10px 12px",
            color: "#fff", fontSize: 13,
            fontFamily: "'DM Mono', monospace",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? "rgba(255,153,0,0.3)" : "#ff9900",
            border: "none", borderRadius: 8, padding: "10px 14px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            color: "#131921", fontSize: 16, fontWeight: 700, transition: "background 0.15s",
          }}
        >↑</button>
      </div>
    </div>
  );
}
