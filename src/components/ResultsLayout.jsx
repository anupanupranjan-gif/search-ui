import { useState, useCallback } from "react";
import FacetSidebar from "../components/FacetSidebar";
import { ProductCard, ProductModal } from "../components/ProductComponents";
import { Badge } from "../components/ProductComponents";
import { sortResults, PAGE_SIZE } from "../api";

export default function ResultsLayout({
  title,
  subtitle,
  results,
  total,
  tookMs,
  loading,
  error,
  sort,
  brand,
  minPrice,
  maxPrice,
  page,
  mode,
  onFilterChange,
  onPageChange,
  chatResults,
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const sorted = sortResults(results, sort);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <FacetSidebar
        sort={sort}
        brand={brand}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onFilterChange={onFilterChange}
      />

      <main style={{ flex: 1, padding: "16px 20px", minWidth: 0 }}>
        {/* Title bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16,
        }}>
          <div>
            <div style={{
              fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 700, color: "#131921",
            }}>{title}</div>
            {subtitle && (
              <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>
                {loading ? "Searching..." : (
                  <>
                    <span style={{ fontWeight: 700, color: "#0f1111" }}>{total.toLocaleString()}</span> results
                    {tookMs && <span style={{ color: "#999", marginLeft: 8 }}>({tookMs}ms)</span>}
                  </>
                )}
              </div>
            )}
          </div>
          {mode && (
            <Badge color="#131921" textColor="#ff9900">{mode}</Badge>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8,
            padding: 16, marginBottom: 20, color: "#856404", fontSize: 13,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div style={{
              width: 36, height: 36, border: "3px solid #f0f0f0",
              borderTop: "3px solid #ff9900", borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }} />
          </div>
        )}

        {/* No results */}
        {!loading && results.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#888" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 18, color: "#333" }}>
              No results found
            </div>
            <div style={{ fontSize: 13, marginTop: 8 }}>
              Try different filters or a broader search term.
            </div>
          </div>
        )}

        {/* Product grid */}
        {!loading && sorted.length > 0 && (
          <div
            className="product-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {sorted.map((hit, i) => (
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
        {totalPages > 1 && !loading && (
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: 8, marginTop: 32, paddingBottom: 32,
          }}>
            <button
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
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
                  onClick={() => onPageChange(p)}
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
              onClick={() => onPageChange(page + 1)}
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

      {selectedProduct && (
        <ProductModal hit={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
