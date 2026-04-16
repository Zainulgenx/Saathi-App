import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Aap ek helpful, smart aur friendly personal assistant hain jiska naam "SAATHI" hai.
Aap Hindi aur English dono mein baat kar sakte hain (Hinglish bhi theek hai).
Aap har tarah ke kaam kar sakte hain:
- Sawaalon ke jawab dena
- Likhne mein madad karna (email, letter, story, poem)
- Code likhna ya explain karna
- Math solve karna
- Kisi bhi topic par research ya jankari dena
- Advice aur suggestions dena
- Translation karna
- Planning mein madad karna

Hamesha helpful, positive aur clear rahein. Short answers ke liye concise rahein, complex questions ke liye detailed.`;

const suggestedPrompts = [
  { icon: "✍️", text: "Meri email likhne mein help karo" },
  { icon: "🧮", text: "Ek math problem solve karo" },
  { icon: "💡", text: "Koi naya business idea do" },
  { icon: "📖", text: "Mujhe kuch sikhao" },
  { icon: "🌐", text: "English mein translate karo" },
  { icon: "💻", text: "Code likhne mein help karo" },
];

export default function PersonalAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput("");
    setShowWelcome(false);

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages,
        }),
      });

      const data = await response.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "Koi jawab nahi mila.";

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Maafi chahta hoon, kuch gadbad ho gayi. Dobara try karein." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowWelcome(true);
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code style='background:#1e293b;padding:2px 6px;border-radius:4px;font-size:0.85em;color:#7dd3fc'>$1</code>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      fontFamily: "'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        width: "100%",
        maxWidth: 720,
        padding: "20px 24px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 0 20px rgba(139,92,246,0.5)",
          }}>🤖</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>SAATHI</div>
            <div style={{ color: "#a78bfa", fontSize: 12 }}>● Online • Aapka Personal Assistant</div>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#94a3b8", borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: 13, transition: "all 0.2s",
          }}
            onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.12)"}
            onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.06)"}
          >
            🗑 Clear
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1, width: "100%", maxWidth: 720,
        padding: "16px 24px", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 16,
        minHeight: "calc(100vh - 160px)", maxHeight: "calc(100vh - 160px)",
      }}>
        {showWelcome && (
          <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🙏</div>
            <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>
              Namaste! Main SAATHI hoon
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 15, margin: "0 0 32px", lineHeight: 1.6 }}>
              Aapka personal AI assistant. Kuch bhi poochein —<br/>main Hindi, English, Hinglish mein jawab dunga!
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 10, maxWidth: 480, margin: "0 auto",
            }}>
              {suggestedPrompts.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p.text)} style={{
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: 12, padding: "12px 16px",
                  color: "#c4b5fd", cursor: "pointer",
                  fontSize: 13, textAlign: "left",
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.12)"}
                >
                  <span style={{ fontSize: 18 }}>{p.icon}</span>
                  <span>{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            alignItems: "flex-end", gap: 10,
          }}>
            {msg.role === "assistant" && (
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>🤖</div>
            )}
            <div style={{
              maxWidth: "75%",
              background: msg.role === "user"
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "rgba(255,255,255,0.06)",
              border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "12px 16px",
              color: "#f1f5f9",
              fontSize: 14.5,
              lineHeight: 1.65,
              boxShadow: msg.role === "user" ? "0 4px 20px rgba(99,102,241,0.3)" : "none",
            }}
              dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
            />
            {msg.role === "user" && (
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>👤</div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>🤖</div>
            <div style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "18px 18px 18px 4px",
              padding: "14px 18px",
              display: "flex", gap: 5, alignItems: "center",
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#a78bfa",
                  animation: "bounce 1.2s infinite",
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{
        width: "100%", maxWidth: 720,
        padding: "12px 24px 20px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 16, padding: "10px 12px",
          transition: "border-color 0.2s",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Kuch bhi poochein... (Enter se bhejein)"
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#f1f5f9", fontSize: 14.5, resize: "none",
              fontFamily: "inherit", lineHeight: 1.5,
              maxHeight: 120, overflowY: "auto",
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "rgba(255,255,255,0.08)",
              border: "none", borderRadius: 10,
              width: 40, height: 40, cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, transition: "all 0.2s", flexShrink: 0,
              boxShadow: input.trim() && !loading ? "0 4px 15px rgba(99,102,241,0.4)" : "none",
            }}
          >
            {loading ? "⏳" : "➤"}
          </button>
        </div>
        <p style={{ color: "#475569", fontSize: 11.5, textAlign: "center", margin: "8px 0 0" }}>
          SAATHI • Powered by Claude AI
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
