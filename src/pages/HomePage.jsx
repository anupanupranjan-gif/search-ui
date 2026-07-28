import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNexarankContent } from "nexarank-content-sdk/react";
import { CATEGORY_MAP, NEXARANK_CONTENT_OPTIONS } from "../api";

// NR-86: up to 4 promo items are flattened into PROMO_GRID's contentPayload
// as item1_image_url/item1_headline/item1_cta_link .. item4_* — ContentRule's
// contentPayload is a flat Map<String,String> (NR-82), and NR-85's
// ContentManager.js has no multi-item editor yet, so this is a stopgap
// convention for API-authored PROMO_GRID rules until that UI gap is closed.
function parsePromoItems(raw) {
  if (!raw) return [];
  const items = [];
  for (let i = 1; i <= 4; i++) {
    const imageUrl = raw[`item${i}_image_url`];
    const headline = raw[`item${i}_headline`];
    const ctaLink = raw[`item${i}_cta_link`];
    if (imageUrl || headline) items.push({ imageUrl, headline, ctaLink });
  }
  return items;
}

export default function HomePage({ onSearch }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { content, loading } = useNexarankContent(
    ["HERO_BANNER", "PROMO_GRID"],
    { pageType: "homepage" },
    NEXARANK_CONTENT_OPTIONS
  );
  const hero = content.HERO_BANNER;
  const promoItems = parsePromoItems(content.PROMO_GRID?.raw);

  const handleSearch = (q) => {
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const handleCategoryClick = (cat) => {
    navigate(`/category/${encodeURIComponent(cat.label)}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f3f3" }}>
      {/* Hero — NR-86: background/headline/subheadline/CTA come from a
          HERO_BANNER content rule when one is ACTIVE; falls back to the
          static SearchX branding on loading, error, or no active rule. */}
      <div style={{
        background: hero?.imageUrl
          ? `linear-gradient(rgba(19,25,33,0.72), rgba(19,25,33,0.72)), url(${hero.imageUrl}) center/cover`
          : "linear-gradient(135deg, #131921 0%, #1e2a35 60%, #232f3e 100%)",
        padding: "60px 20px 50px",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        {loading ? (
          <div style={{
            width: 260, height: 20, borderRadius: 4, marginBottom: 12,
            background: "rgba(255,255,255,0.08)",
            animation: "nr-shimmer 1.1s ease-in-out infinite",
          }} />
        ) : hero?.headline ? (
          <div style={{
            fontFamily: "'Lora', serif", fontSize: 34, fontWeight: 700,
            color: hero.textColor || "#fff", marginBottom: 6, textAlign: "center",
          }}>
            {hero.headline}
          </div>
        ) : (
          <div style={{
            fontFamily: "'Lora', serif", fontSize: 36, fontWeight: 700,
            color: "#fff", letterSpacing: -1, marginBottom: 8, textAlign: "center",
          }}>
            <span style={{ color: "#ff9900" }}>∆</span> SearchX
          </div>
        )}

        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 13,
          color: hero?.textColor || "#888", marginBottom: hero?.ctaText ? 16 : 32,
          letterSpacing: 0.5, textAlign: "center",
        }}>
          {hero?.subheadline || (!loading && "34,000+ products · AI-powered search")}
        </div>

        {hero?.ctaText && (
          <a
            href={hero.ctaLink || "#"}
            style={{
              display: "inline-block", marginBottom: 24, padding: "8px 22px",
              borderRadius: 20, background: "#ff9900", color: "#131921",
              fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700,
              textDecoration: "none",
            }}
          >{hero.ctaText}</a>
        )}

        {/* Big search bar — always present regardless of content rule state */}
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

      {/* Promo grid — NR-86: PROMO_GRID content rule, purely additive (no
          static default), horizontally scrollable so up to 4 items fit
          without pulling in a carousel dependency. */}
      {promoItems.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 0" }}>
          <div style={{
            display: "flex", gap: 16, overflowX: "auto",
            scrollSnapType: "x mandatory", paddingBottom: 8,
          }}>
            {promoItems.map((item, i) => (
              <a
                key={i}
                href={item.ctaLink || "#"}
                style={{
                  flex: "0 0 280px", scrollSnapAlign: "start",
                  borderRadius: 10, overflow: "hidden", textDecoration: "none",
                  background: "#131921", position: "relative", height: 140,
                  backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
                  backgroundSize: "cover", backgroundPosition: "center",
                }}
              >
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)",
                  display: "flex", alignItems: "flex-end", padding: 14,
                }}>
                  <span style={{
                    color: "#fff", fontFamily: "'Lora', serif",
                    fontSize: 15, fontWeight: 700,
                  }}>{item.headline}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

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
