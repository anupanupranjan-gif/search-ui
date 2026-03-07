import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORY_MAP } from "../api";

export default function HomePage({ onSearch }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (q) => {
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const handleCategoryClick = (cat) => {
    navigate(`/category/${encodeURIComponent(cat.label)}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f3f3" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #131921 0%, #1e2a35 60%, #232f3e 100%)",
        padding: "60px 20px 50px",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{
          fontFamily: "'Lora', serif", fontSize: 36, fontWeight: 700,
          color: "#fff", letterSpacing: -1, marginBottom: 8, textAlign: "center",
        }}>
          <span style={{ color: "#ff9900" }}>∆</span> SearchX
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#888",
          marginBottom: 32, letterSpacing: 0.5,
        }}>
          34,000+ products · AI-powered search
        </div>

        {/* Big search bar */}
        <div style={{
          display: "flex", width: "100%", maxWidth: 680,
          border: "3px solid #ff9900", borderRadius: 8, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(255,153,0,0.2)",
        }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="Search for anything..."
            autoFocus
            style={{
              flex: 1, border: "none", padding: "16px 20px",
              fontSize: 17, fontFamily: "'DM Mono', monospace",
              background: "#fff",
            }}
          />
          <button
            onClick={() => handleSearch(query)}
            style={{
              background: "#ff9900", border: "none", padding: "0 28px",
              cursor: "pointer", fontSize: 22, color: "#131921",
              fontWeight: 700,
            }}
          >⌕</button>
        </div>

        {/* Quick searches */}
        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {["wireless headphones", "coffee maker", "desk lamp", "running shoes"].map(s => (
            <button
              key={s}
              onClick={() => handleSearch(s)}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 20, padding: "6px 16px", fontSize: 12,
                cursor: "pointer", color: "#ccc",
                fontFamily: "'DM Mono', monospace",
                transition: "all 0.15s",
              }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Category grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{
          fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700,
          color: "#131921", marginBottom: 24,
        }}>
          Shop by Department
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}>
          {CATEGORY_MAP.map((cat) => (
            <CategoryCard key={cat.label} cat={cat} onClick={() => handleCategoryClick(cat)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ cat, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${cat.color} 0%, #1a2a1a 100%)`
          : "#fff",
        border: hovered ? "1px solid #ff9900" : "1px solid #ddd",
        borderRadius: 10, padding: "24px 20px", cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: hovered ? "0 6px 24px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-3px)" : "none",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 12, textAlign: "center", minHeight: 140,
      }}
    >
      <div style={{ fontSize: 40, lineHeight: 1 }}>{cat.emoji}</div>
      <div style={{
        fontFamily: "'Lora', serif", fontSize: 15, fontWeight: 700,
        color: hovered ? "#fff" : "#131921", lineHeight: 1.3,
        transition: "color 0.2s",
      }}>
        {cat.display}
      </div>
      {hovered && (
        <div style={{
          fontSize: 11, color: "#ff9900",
          fontFamily: "'DM Mono', monospace", letterSpacing: 0.5,
        }}>
          Browse →
        </div>
      )}
    </div>
  );
}
