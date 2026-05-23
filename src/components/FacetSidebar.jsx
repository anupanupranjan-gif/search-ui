// Copyright (c) 2026 Anup Ranjan. Licensed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0)
import { useState } from "react";
import { SORT_OPTIONS } from "../api";

export default function FacetSidebar({
  sort, brand, minPrice, maxPrice, category,
  onFilterChange, facets
}) {
  const [expanded, setExpanded] = useState({});

  function toggleExpanded(fieldName) {
    setExpanded(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  }

  function renderTermsFacet(facet) {
    const isExpanded = expanded[facet.fieldName] !== false; // default expanded
    const buckets = facet.buckets || [];

    return (
      <div key={facet.fieldName} style={{ marginBottom: 14 }}>
        <div
          onClick={() => toggleExpanded(facet.fieldName)}
          style={{
            fontSize: 11, color: "#666", marginBottom: 6,
            letterSpacing: 0.5, cursor: "pointer",
            display: "flex", justifyContent: "space-between"
          }}
        >
          <span>{facet.displayLabel.toUpperCase()}</span>
          <span>{isExpanded ? "▲" : "▼"}</span>
        </div>
        {isExpanded && buckets.map(bucket => (
          <div
            key={bucket.value}
            onClick={() => onFilterChange(facet.fieldName, bucket.value)}
            style={{
              padding: "5px 8px", borderRadius: 4, cursor: "pointer",
              background: category === bucket.value || brand === bucket.value
                ? "#fff3e0" : "transparent",
              borderLeft: category === bucket.value || brand === bucket.value
                ? "3px solid #ff9900" : "3px solid transparent",
              fontSize: 12, color: "#444",
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 1,
              transition: "all 0.1s",
            }}
          >
            <span style={{
              overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap", maxWidth: 130
            }}>
              {bucket.value}
            </span>
            {facet.showCount && bucket.count != null && (
              <span style={{
                fontSize: 10, color: "#999",
                background: "#f5f5f5", borderRadius: 10,
                padding: "1px 6px", flexShrink: 0
              }}>
                {bucket.count.toLocaleString()}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderRangeFacet(facet) {
    const isPrice = facet.fieldName === "price";
    const isRating = facet.fieldName === "rating";
    const isExpanded = expanded[facet.fieldName] !== false;

    return (
      <div key={facet.fieldName} style={{ marginBottom: 14 }}>
        <div
          onClick={() => toggleExpanded(facet.fieldName)}
          style={{
            fontSize: 11, color: "#666", marginBottom: 6,
            letterSpacing: 0.5, cursor: "pointer",
            display: "flex", justifyContent: "space-between"
          }}
        >
          <span>{facet.displayLabel.toUpperCase()}</span>
          <span>{isExpanded ? "▲" : "▼"}</span>
        </div>
        {isExpanded && isPrice && (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              value={minPrice}
              onChange={(e) => onFilterChange("minPrice", e.target.value)}
              placeholder="Min"
              type="number"
              style={{
                width: "50%", border: "1px solid #ddd", borderRadius: 4,
                padding: "7px 8px", fontSize: 12,
                fontFamily: "'DM Mono', monospace",
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
                padding: "7px 8px", fontSize: 12,
                fontFamily: "'DM Mono', monospace",
              }}
            />
          </div>
        )}
        {isExpanded && isRating && (
          <div>
            {[4, 3, 2, 1].map(r => (
              <div
                key={r}
                onClick={() => onFilterChange("minRating", r)}
                style={{
                  padding: "5px 8px", borderRadius: 4, cursor: "pointer",
                  fontSize: 12, color: "#444", marginBottom: 1,
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                {"★".repeat(r)}{"☆".repeat(5 - r)}
                <span style={{ color: "#999", fontSize: 11 }}>&amp; up</span>
              </div>
            ))}
          </div>
        )}
        {isExpanded && !isPrice && !isRating && (
          <div style={{ fontSize: 11, color: "#999" }}>
            {(facet.buckets || []).length} ranges available
          </div>
        )}
      </div>
    );
  }

  const facetList = facets ? Object.values(facets) : [];

  return (
    <aside style={{
      width: 220, background: "#fff", borderRight: "1px solid #ddd",
      padding: 16, flexShrink: 0, overflowY: "auto",
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
        {facetList.length > 0 && (
          <span style={{
            fontSize: 10, color: "#999", fontWeight: 400,
            marginLeft: 6
          }}>
            via NexaRank
          </span>
        )}
      </div>

      {facetList.length === 0 ? (
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 6, letterSpacing: 0.5 }}>
              BRAND
            </div>
            <input
              value={brand}
              onChange={(e) => onFilterChange("brand", e.target.value)}
              placeholder="e.g. Sony"
              style={{
                width: "100%", border: "1px solid #ddd", borderRadius: 4,
                padding: "7px 10px", fontSize: 12,
                fontFamily: "'DM Mono', monospace",
              }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 6, letterSpacing: 0.5 }}>
              PRICE RANGE
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                value={minPrice}
                onChange={(e) => onFilterChange("minPrice", e.target.value)}
                placeholder="Min"
                type="number"
                style={{
                  width: "50%", border: "1px solid #ddd", borderRadius: 4,
                  padding: "7px 8px", fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
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
                  padding: "7px 8px", fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        facetList.map(facet =>
          facet.facetType === "TERMS"
            ? renderTermsFacet(facet)
            : renderRangeFacet(facet)
        )
      )}
    </aside>
  );
}
