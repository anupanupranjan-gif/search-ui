import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8081/api/v1";

const SORT_OPTIONS = [
  { id: "relevant", label: "Most Relevant", icon: "✦" },
  { id: "recommended", label: "Recommended", icon: "★" },
  { id: "bestseller", label: "Best Seller", icon: "🔥" },
  { id: "price_asc", label: "Price: Low to High", icon: "↑" },
  { id: "price_desc", label: "Price: High to Low", icon: "↓" },
  { id: "rating", label: "Avg. Rating", icon: "⭐" },
];

const CATEGORIES = [
  "All Categories",
  "Tools & Home Improvement",
  "Electronics",
  "Clothing, Shoes & Jewelry",
  "Sports & Outdoors",
  "Health & Household",
  "Toys & Games",
  "Automotive",
  "Office Products",
];

const SEARCH_MODES = [
  { id: "hybrid", label: "Hybrid", desc: "BM25 + Vector" },
  { id: "vector", label: "Semantic", desc: "Vector only" },
  { id: "keyword", label: "Keyword", desc: "BM25 only" },
];

function StarRating({ rating }) {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ color: "#e77600", fontSize: 13, letterSpacing: -1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ opacity: i < full ? 1 : half && i === full ? 0.6 : 0.2 }}>★</span>
      ))}
      <span style={{ color: "#555", fontSize: 12, marginLeft: 4, letterSpacing: 0 }}>
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

function Badge({ children, color = "#e8f0fe", textColor = "#1a73e8" }) {
  return (
    <span style={{
      background: color, color: textColor,
      fontSize: 10, fontWeight: 700, padding: "2px 7px",
      borderRadius: 3, letterSpacing: 0.5, textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
    }}>{children}</span>
  );
}

function ProductCard({ hit, rank, sort, onClick }) {
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
        borderRadius: 8,
        padding: "16px 14px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: hovered ? "0 4px 20px rgba(231,118,0,0.12)" : "0 1px 3px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-2px)" : "none",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 8,
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

      {/* Image placeholder */}
      <div style={{
        width: "100%", aspectRatio: "1",
        background: `hsl(${(hit.productId?.charCodeAt(0) || 0) * 7 % 360}, 20%, 94%)`,
        borderRadius: 6, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 32, marginBottom: 4,
      }}>
        {hit.category?.includes("Electronic") ? "📱" :
         hit.category?.includes("Tool") ? "🔧" :
         hit.category?.includes("Sport") ? "⚽" :
         hit.category?.includes("Health") ? "💊" :
         hit.category?.includes("Toy") ? "🧸" :
         hit.category?.includes("Clothing") ? "👕" : "📦"}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
        {hit.brand && <Badge>{hit.brand}</Badge>}
        {hit.category && (
          <Badge color="#f0f0f0" textColor="#555">{hit.category?.split(" ")[0]}</Badge>
        )}
      </div>

      <div style={{
        fontSize: 13, fontWeight: 500, color: "#0f1111",
        lineHeight: 1.4, fontFamily: "'Lora', serif",
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
          <span style={{
            fontSize: 10, color: "#888", fontFamily: "'DM Mono', monospace",
          }}>
            {scorePercent}% match
          </span>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); }}
        style={{
          background: hovered ? "#e77600" : "#ffa41c",
          border: "1px solid",
          borderColor: hovered ? "#c56200" : "#e68a00",
          borderRadius: 20,
          padding: "7px 0",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          color: "#0f1111",
          transition: "all 0.15s",
          fontFamily: "'DM Mono', monospace",
          letterSpacing: 0.3,
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}

function ProductModal({ hit, onClose }) {
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
          {hit.category?.includes("Electronic") ? "📱" :
           hit.category?.includes("Tool") ? "🔧" :
           hit.category?.includes("Sport") ? "⚽" :
           hit.category?.includes("Health") ? "💊" :
           hit.category?.includes("Toy") ? "🧸" :
           hit.category?.includes("Clothing") ? "👕" : "📦"}
        </div>

        <h2 style={{
          fontSize: 20, fontWeight: 700, color: "#0f1111",
          lineHeight: 1.4, marginBottom: 12, fontFamily: "'Lora', serif",
        }}>{hit.title}</h2>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <StarRating rating={hit.rating} />
          {hit.ratingCount && (
            <span style={{ fontSize: 13, color: "#007185" }}>{hit.ratingCount.toLocaleString()} ratings</span>
          )}
        </div>

        <div style={{
          fontSize: 28, fontWeight: 700, color: "#0f1111", marginBottom: 16,
        }}>
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
          fontSize: 12, color: "#555", fontFamily: "'DM Mono', monospace",
          marginBottom: 20,
        }}>
          <div>Product ID: {hit.productId}</div>
          {hit.score && <div>Relevance score: {hit.score.toFixed(4)}</div>}
          {hit.productVector && <div>Vector dims: {hit.productVector.length}</div>}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button style={{
            flex: 1, background: "#ffa41c", border: "1px solid #e68a00",
            borderRadius: 24, padding: "12px 0", fontSize: 14, fontWeight: 700,
            cursor: "pointer", color: "#0f1111", fontFamily: "'DM Mono', monospace",
          }}>
            Add to Cart
          </button>
          <button style={{
            flex: 1, background: "#e8f0fe", border: "1px solid #c5d8f8",
            borderRadius: 24, padding: "12px 0", fontSize: 14, fontWeight: 700,
            cursor: "pointer", color: "#1a73e8", fontFamily: "'DM Mono', monospace",
          }}>
            ♡ Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SearchApp() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("hybrid");
  const [sort, setSort] = useState("relevant");
  const [category, setCategory] = useState("All Categories");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [tookMs, setTookMs] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);
  const PAGE_SIZE = 20;

  const sortResults = useCallback((hits, sortId) => {
    if (!hits?.length) return hits;
    const sorted = [...hits];
    switch (sortId) {
      case "price_asc": return sorted.sort((a, b) => (a.price || 999) - (b.price || 999));
      case "price_desc": return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "rating": return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "bestseller": return sorted.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
      case "recommended": return sorted.sort((a, b) => {
        const scoreA = (a.score || 0) * 0.6 + (a.rating || 0) * 0.4;
        const scoreB = (b.score || 0) * 0.6 + (b.rating || 0) * 0.4;
        return scoreB - scoreA;
      });
      default: return sorted; // relevant = server order
    }
  }, []);

  const doSearch = useCallback(async (q, opts = {}) => {
    if (!q?.trim()) { setResults([]); setHasSearched(false); return; }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        q,
        mode: opts.mode ?? mode,
        size: PAGE_SIZE,
        page: opts.page ?? page,
      });
      if ((opts.category ?? category) !== "All Categories") params.set("category", opts.category ?? category);
      if (opts.brand ?? brand) params.set("brand", opts.brand ?? brand);
      if (opts.minPrice ?? minPrice) params.set("minPrice", opts.minPrice ?? minPrice);
      if (opts.maxPrice ?? maxPrice) params.set("maxPrice", opts.maxPrice ?? maxPrice);

      const res = await fetch(`${API_BASE}/search?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setTotal(data.total ?? 0);
      setTookMs(data.tookMs ?? null);
      setResults(sortResults(data.hits ?? [], opts.sort ?? sort));
      setHasSearched(true);
    } catch (e) {
      setError(e.message.includes("fetch") ? "Cannot connect to search API. Is it running?" : e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [mode, category, brand, minPrice, maxPrice, page, sort, sortResults]);

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query, { page: 0 }), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleFilterChange = (key, value) => {
    const updates = { page: 0 };
    if (key === "mode") { setMode(value); updates.mode = value; }
    if (key === "category") { setCategory(value); updates.category = value; }
    if (key === "brand") { setBrand(value); updates.brand = value; }
    if (key === "minPrice") { setMinPrice(value); updates.minPrice = value; }
    if (key === "maxPrice") { setMaxPrice(value); updates.maxPrice = value; }
    if (key === "sort") { setSort(value); updates.sort = value; }
    setPage(0);
    if (query.trim()) doSearch(query, updates);
  };

  const sortedResults = sortResults(results, sort);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Mono', monospace; background: #f3f3f3; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .product-grid > * {
          animation: fadeIn 0.25s ease both;
        }
        .product-grid > *:nth-child(1) { animation-delay: 0.02s; }
        .product-grid > *:nth-child(2) { animation-delay: 0.04s; }
        .product-grid > *:nth-child(3) { animation-delay: 0.06s; }
        .product-grid > *:nth-child(4) { animation-delay: 0.08s; }
        .product-grid > *:nth-child(5) { animation-delay: 0.10s; }
        .product-grid > *:nth-child(6) { animation-delay: 0.12s; }
        input:focus { outline: none; }
        select:focus { outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #c5c5c5; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <header style={{
        background: "#131921", padding: "10px 20px",
        display: "flex", alignItems: "center", gap: 16,
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        <div style={{
          color: "#fff", fontFamily: "'Lora', serif",
          fontWeight: 700, fontSize: 22, letterSpacing: -0.5,
          whiteSpace: "nowrap",
        }}>
          <span style={{ color: "#ff9900" }}>∆</span> SearchX
        </div>

        {/* Search bar */}
        <div style={{
          flex: 1, display: "flex", maxWidth: 800,
          border: "2px solid #ff9900", borderRadius: 6, overflow: "hidden",
        }}>
          <select
            value={category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            style={{
              background: "#f3f3f3", border: "none", padding: "0 10px",
              fontSize: 12, color: "#333", cursor: "pointer",
              fontFamily: "'DM Mono', monospace", minWidth: 80,
              borderRight: "1px solid #ddd",
            }}
          >
            <option value="All Categories">All</option>
            {CATEGORIES.slice(1).map(c => (
              <option key={c} value={c}>{c.split(" ")[0]}</option>
            ))}
          </select>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch(query, { page: 0 })}
            placeholder="Search products..."
            style={{
              flex: 1, border: "none", padding: "10px 14px",
              fontSize: 15, fontFamily: "'DM Mono', monospace",
              background: "#fff",
            }}
          />
          <button
            onClick={() => doSearch(query, { page: 0 })}
            style={{
              background: "#ff9900", border: "none", padding: "0 18px",
              cursor: "pointer", fontSize: 18, color: "#131921",
            }}
          >⌕</button>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 4 }}>
          {SEARCH_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => handleFilterChange("mode", m.id)}
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

      <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>

        {/* Sidebar */}
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
              onClick={() => handleFilterChange("sort", s.id)}
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

          {/* Brand */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 6, letterSpacing: 0.5 }}>BRAND</div>
            <input
              value={brand}
              onChange={(e) => handleFilterChange("brand", e.target.value)}
              placeholder="e.g. Sony"
              style={{
                width: "100%", border: "1px solid #ddd", borderRadius: 4,
                padding: "7px 10px", fontSize: 12, fontFamily: "'DM Mono', monospace",
              }}
            />
          </div>

          {/* Price range */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 6, letterSpacing: 0.5 }}>PRICE RANGE</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                value={minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
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
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                placeholder="Max"
                type="number"
                style={{
                  width: "50%", border: "1px solid #ddd", borderRadius: 4,
                  padding: "7px 8px", fontSize: 12, fontFamily: "'DM Mono', monospace",
                }}
              />
            </div>
          </div>

          {/* Category list */}
          <div>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 6, letterSpacing: 0.5 }}>CATEGORY</div>
            {CATEGORIES.map(c => (
              <div
                key={c}
                onClick={() => handleFilterChange("category", c)}
                style={{
                  padding: "6px 8px", borderRadius: 4, cursor: "pointer",
                  background: category === c ? "#fff3e0" : "transparent",
                  borderLeft: category === c ? "3px solid #ff9900" : "3px solid transparent",
                  fontSize: 11, color: category === c ? "#c45500" : "#444",
                  fontWeight: category === c ? 700 : 400,
                  marginBottom: 2, transition: "all 0.1s",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}
              >{c}</div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "16px 20px", minWidth: 0 }}>

          {/* Results bar */}
          {hasSearched && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 16, fontSize: 13, color: "#555",
            }}>
              <div>
                {loading ? "Searching..." : (
                  <>
                    <span style={{ fontWeight: 700, color: "#0f1111" }}>
                      {total.toLocaleString()}
                    </span> results for{" "}
                    <span style={{ color: "#c45500", fontStyle: "italic" }}>"{query}"</span>
                    {tookMs && <span style={{ color: "#999", marginLeft: 8 }}>({tookMs}ms)</span>}
                  </>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#888" }}>Mode:</span>
                <Badge color="#131921" textColor="#ff9900">{mode}</Badge>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8,
              padding: 16, marginBottom: 20, color: "#856404", fontSize: 13,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
              <div style={{
                width: 36, height: 36, border: "3px solid #f0f0f0",
                borderTop: "3px solid #ff9900", borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
            </div>
          )}

          {/* Empty state */}
          {!loading && !hasSearched && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "80px 20px", color: "#888",
            }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>⌕</div>
              <div style={{
                fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600,
                color: "#333", marginBottom: 8,
              }}>Search 34,000+ products</div>
              <div style={{ fontSize: 13, color: "#888", maxWidth: 360, textAlign: "center" }}>
                Try "wireless headphones", "coffee maker", or "running shoes".
                Switch between Hybrid, Semantic, and Keyword modes to compare results.
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                {["wireless headphones", "coffee maker", "wasp trap"].map(s => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); doSearch(s, { page: 0 }); }}
                    style={{
                      background: "#fff", border: "1px solid #ddd",
                      borderRadius: 20, padding: "7px 16px", fontSize: 12,
                      cursor: "pointer", color: "#007185",
                      fontFamily: "'DM Mono', monospace",
                      transition: "border-color 0.15s",
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "#888" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 18, color: "#333" }}>
                No results found for "{query}"
              </div>
              <div style={{ fontSize: 13, marginTop: 8 }}>
                Try a different search term or remove some filters.
              </div>
            </div>
          )}

          {/* Product grid */}
          {!loading && sortedResults.length > 0 && (
            <div
              className="product-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
              {sortedResults.map((hit, i) => (
                <ProductCard
                  key={hit.productId || i}
                  hit={hit}
                  rank={i + 1}
                  sort={sort}
                  onClick={setSelectedProduct}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {hasSearched && totalPages > 1 && !loading && (
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              gap: 8, marginTop: 32, paddingBottom: 32,
            }}>
              <button
                disabled={page === 0}
                onClick={() => { setPage(p => p - 1); doSearch(query, { page: page - 1 }); }}
                style={{
                  background: page === 0 ? "#f5f5f5" : "#fff",
                  border: "1px solid #ddd", borderRadius: 4,
                  padding: "8px 16px", cursor: page === 0 ? "not-allowed" : "pointer",
                  fontSize: 13, color: page === 0 ? "#aaa" : "#333",
                  fontFamily: "'DM Mono', monospace",
                }}
              >← Prev</button>

              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const p = Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => { setPage(p); doSearch(query, { page: p }); }}
                    style={{
                      background: p === page ? "#131921" : "#fff",
                      border: "1px solid #ddd", borderRadius: 4,
                      padding: "8px 14px", cursor: "pointer",
                      fontSize: 13, color: p === page ? "#ff9900" : "#333",
                      fontWeight: p === page ? 700 : 400,
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >{p + 1}</button>
                );
              })}

              <button
                disabled={page >= totalPages - 1}
                onClick={() => { setPage(p => p + 1); doSearch(query, { page: page + 1 }); }}
                style={{
                  background: page >= totalPages - 1 ? "#f5f5f5" : "#fff",
                  border: "1px solid #ddd", borderRadius: 4,
                  padding: "8px 16px",
                  cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                  fontSize: 13, color: page >= totalPages - 1 ? "#aaa" : "#333",
                  fontFamily: "'DM Mono', monospace",
                }}
              >Next →</button>
            </div>
          )}
        </main>
      </div>

      {selectedProduct && (
        <ProductModal hit={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  );
}
