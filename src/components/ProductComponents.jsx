import { useState, useEffect } from "react";
import { getCategoryEmoji } from "../api";

export function StarRating({ rating }) {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ color: "#e77600", fontSize: 13, letterSpacing: -1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ opacity: i < full ? 1 : half && i === full ? 0.6 : 0.2 }}>★</span>
      ))}
      <span style={{ color: "#888", fontSize: 12, marginLeft: 4, letterSpacing: 0 }}>
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export function Badge({ children, color = "#e8f0fe", textColor = "#1a73e8" }) {
  return (
    <span style={{
      background: color, color: textColor,
      fontSize: 10, fontWeight: 700, padding: "2px 7px",
      borderRadius: 3, letterSpacing: 0.5, textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
    }}>{children}</span>
  );
}

export function ProductCard({ hit, rank, sort, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isBestseller = sort === "bestseller" || (rank <= 3 && sort === "recommended");
  const scorePercent = hit.score ? Math.min(100, Math.round(hit.score * 5)) : null;

  return (
    <div
      onClick={() => onClick(hit)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: hovered ? "1px solid #e77600" : "1px solid #ddd",
        borderRadius: 8, padding: "16px 14px", cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: hovered ? "0 4px 20px rgba(231,118,0,0.12)" : "0 1px 3px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-2px)" : "none",
        position: "relative", display: "flex", flexDirection: "column", gap: 8,
      }}
    >
      {isBestseller && (
        <div style={{
          position: "absolute", top: -1, left: 12,
          background: "#e77600", color: "#fff",
          fontSize: 10, fontWeight: 700, padding: "2px 8px",
          borderRadius: "0 0 4px 4px", letterSpacing: 0.5,
          fontFamily: "'DM Mono', monospace",
        }}>BEST SELLER</div>
      )}

      <div style={{
        width: "100%", aspectRatio: "1",
        background: `hsl(${(hit.productId?.charCodeAt(0) || 0) * 7 % 360}, 20%, 94%)`,
        borderRadius: 6, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 32, marginBottom: 4,
      }}>
        {getCategoryEmoji(hit.category)}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
        {hit.brand && <Badge>{hit.brand}</Badge>}
        {hit.category && (
          <Badge color="#f0f0f0" textColor="#555">{hit.category?.split(" ")[0]}</Badge>
        )}
      </div>

      <div style={{
        fontSize: 13, fontWeight: 500, color: "#0f1111", lineHeight: 1.4,
        fontFamily: "'Lora', serif",
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {hit.title}
      </div>

      <StarRating rating={hit.rating} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        {hit.price ? (
          <span style={{ fontSize: 18, fontWeight: 700, color: "#0f1111" }}>
            <span style={{ fontSize: 11, verticalAlign: "top", marginTop: 4, display: "inline-block" }}>$</span>
            {hit.price.toFixed(2)}
          </span>
        ) : <span style={{ color: "#888", fontSize: 13 }}>Price N/A</span>}
        {scorePercent && (
          <span style={{ fontSize: 10, color: "#888", fontFamily: "'DM Mono', monospace" }}>
            {scorePercent}% match
          </span>
        )}
      </div>

      <button
        onClick={(e) => e.stopPropagation()}
        style={{
          background: hovered ? "#e77600" : "#ffa41c",
          border: "1px solid", borderColor: hovered ? "#c56200" : "#e68a00",
          borderRadius: 20, padding: "7px 0", fontSize: 12, fontWeight: 600,
          cursor: "pointer", color: "#0f1111", transition: "all 0.15s",
          fontFamily: "'DM Mono', monospace", letterSpacing: 0.3,
        }}
      >Add to Cart</button>
    </div>
  );
}

export function ProductModal({ hit, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!hit) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 12, maxWidth: 700, width: "100%",
          maxHeight: "90vh", overflow: "auto", padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          animation: "slideUp 0.2s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {hit.brand && <Badge>{hit.brand}</Badge>}
            {hit.category && <Badge color="#f0f0f0" textColor="#555">{hit.category}</Badge>}
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 22,
            cursor: "pointer", color: "#666", lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>

        <div style={{
          width: "100%", height: 200, borderRadius: 10,
          background: `hsl(${(hit.productId?.charCodeAt(0) || 0) * 7 % 360}, 20%, 94%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 72, marginBottom: 20,
        }}>
          {getCategoryEmoji(hit.category)}
        </div>

        <h2 style={{
          fontSize: 20, fontWeight: 700, color: "#0f1111", lineHeight: 1.4,
          marginBottom: 12, fontFamily: "'Lora', serif",
        }}>{hit.title}</h2>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <StarRating rating={hit.rating} />
          {hit.ratingCount && (
            <span style={{ fontSize: 13, color: "#007185" }}>{hit.ratingCount.toLocaleString()} ratings</span>
          )}
        </div>

        <div style={{ fontSize: 28, fontWeight: 700, color: "#0f1111", marginBottom: 16 }}>
          {hit.price ? `$${hit.price.toFixed(2)}` : "Price not available"}
        </div>

        {hit.description && (
          <div style={{
            fontSize: 14, color: "#333", lineHeight: 1.7,
            borderTop: "1px solid #eee", paddingTop: 16, marginBottom: 20,
            fontFamily: "'Lora', serif",
          }}>
            {hit.description}
          </div>
        )}

        <div style={{
          background: "#f8f8f8", borderRadius: 8, padding: "12px 16px",
          fontSize: 12, color: "#555", fontFamily: "'DM Mono', monospace", marginBottom: 20,
        }}>
          <div>Product ID: {hit.productId}</div>
          {hit.score && <div>Relevance score: {hit.score.toFixed(4)}</div>}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button style={{
            flex: 1, background: "#ffa41c", border: "1px solid #e68a00",
            borderRadius: 24, padding: "12px 0", fontSize: 14, fontWeight: 700,
            cursor: "pointer", color: "#0f1111", fontFamily: "'DM Mono', monospace",
          }}>Add to Cart</button>
          <button style={{
            flex: 1, background: "#e8f0fe", border: "1px solid #c5d8f8",
            borderRadius: 24, padding: "12px 0", fontSize: 14, fontWeight: 700,
            cursor: "pointer", color: "#1a73e8", fontFamily: "'DM Mono', monospace",
          }}>♡ Save</button>
        </div>
      </div>
    </div>
  );
}
