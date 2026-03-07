import { SEARCH_MODES } from "../api";

export default function Header({ query, onQueryChange, onSearch, mode, onModeChange, chatOpen, onChatToggle, onLogoClick }) {
  return (
    <header style={{
      background: "#131921", padding: "10px 20px",
      display: "flex", alignItems: "center", gap: 16,
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    }}>
      <div
        onClick={onLogoClick}
        style={{
          color: "#fff", fontFamily: "'Lora', serif",
          fontWeight: 700, fontSize: 22, letterSpacing: -0.5,
          whiteSpace: "nowrap", cursor: "pointer",
        }}
      >
        <span style={{ color: "#ff9900" }}>∆</span> SearchX
      </div>

      {/* Search bar */}
      <div style={{
        flex: 1, display: "flex", maxWidth: 800,
        border: "2px solid #ff9900", borderRadius: 6, overflow: "hidden",
      }}>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch(query)}
          placeholder="Search products..."
          style={{
            flex: 1, border: "none", padding: "10px 14px",
            fontSize: 15, fontFamily: "'DM Mono', monospace",
            background: "#fff",
          }}
        />
        <button
          onClick={() => onSearch(query)}
          style={{
            background: "#ff9900", border: "none", padding: "0 18px",
            cursor: "pointer", fontSize: 18, color: "#131921",
          }}
        >⌕</button>
      </div>

      {/* AI Chat button */}
      <button
        onClick={onChatToggle}
        style={{
          background: chatOpen ? "#ff9900" : "rgba(255,153,0,0.15)",
          border: "1px solid rgba(255,153,0,0.4)",
          borderRadius: 6, padding: "6px 14px",
          color: chatOpen ? "#131921" : "#ff9900",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          fontFamily: "'DM Mono', monospace", letterSpacing: 0.3,
          transition: "all 0.15s", whiteSpace: "nowrap",
        }}
      >✦ AI Chat</button>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 4 }}>
        {SEARCH_MODES.map(m => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            title={m.desc}
            style={{
              background: mode === m.id ? "#ff9900" : "rgba(255,255,255,0.1)",
              border: "none", borderRadius: 4, padding: "6px 12px",
              color: mode === m.id ? "#131921" : "#fff",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Mono', monospace", letterSpacing: 0.3,
              transition: "all 0.15s",
            }}
          >{m.label}</button>
        ))}
      </div>
    </header>
  );
}
