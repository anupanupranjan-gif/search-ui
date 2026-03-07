import { SORT_OPTIONS } from "../api";

export default function FacetSidebar({ sort, brand, minPrice, maxPrice, onFilterChange }) {
  return (
    <aside style={{
      width: 220, background: "#fff", borderRight: "1px solid #ddd",
      padding: 16, flexShrink: 0,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1111", marginBottom: 12 }}>
        SORT BY
      </div>
      {SORT_OPTIONS.map(s => (
        <div
          key={s.id}
          onClick={() => onFilterChange("sort", s.id)}
          style={{
            padding: "8px 10px", borderRadius: 6, cursor: "pointer",
            background: sort === s.id ? "#fff3e0" : "transparent",
            borderLeft: sort === s.id ? "3px solid #ff9900" : "3px solid transparent",
            fontSize: 12, color: sort === s.id ? "#c45500" : "#444",
            fontWeight: sort === s.id ? 700 : 400,
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 2, transition: "all 0.1s",
          }}
        >
          <span>{s.icon}</span> {s.label}
        </div>
      ))}

      <div style={{ borderTop: "1px solid #eee", margin: "16px 0" }} />

      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1111", marginBottom: 12 }}>
        FILTERS
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 6, letterSpacing: 0.5 }}>BRAND</div>
        <input
          value={brand}
          onChange={(e) => onFilterChange("brand", e.target.value)}
          placeholder="e.g. Sony"
          style={{
            width: "100%", border: "1px solid #ddd", borderRadius: 4,
            padding: "7px 10px", fontSize: 12, fontFamily: "'DM Mono', monospace",
          }}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 6, letterSpacing: 0.5 }}>PRICE RANGE</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            value={minPrice}
            onChange={(e) => onFilterChange("minPrice", e.target.value)}
            placeholder="Min"
            type="number"
            style={{
              width: "50%", border: "1px solid #ddd", borderRadius: 4,
              padding: "7px 8px", fontSize: 12, fontFamily: "'DM Mono', monospace",
            }}
          />
          <span style={{ color: "#999", fontSize: 11 }}>–</span>
          <input
            value={maxPrice}
            onChange={(e) => onFilterChange("maxPrice", e.target.value)}
            placeholder="Max"
            type="number"
            style={{
              width: "50%", border: "1px solid #ddd", borderRadius: 4,
              padding: "7px 8px", fontSize: 12, fontFamily: "'DM Mono', monospace",
            }}
          />
        </div>
      </div>
    </aside>
  );
}
