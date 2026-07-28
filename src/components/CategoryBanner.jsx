import { useNexarankContent } from "nexarank-content-sdk/react";
import { NEXARANK_CONTENT_OPTIONS } from "../api";

// NR-86: CATEGORY_BANNER content rule for the category listing page.
// Purely additive (no static default existed before this) — renders
// nothing while loading or when no rule matches this category.
export default function CategoryBanner({ category }) {
  const { content } = useNexarankContent(
    ["CATEGORY_BANNER"],
    { pageType: "category", category },
    NEXARANK_CONTENT_OPTIONS
  );
  const banner = content.CATEGORY_BANNER;
  if (!banner || (!banner.imageUrl && !banner.headline)) return null;

  return (
    <div style={{
      margin: "16px 20px 0",
      borderRadius: 10, overflow: "hidden", position: "relative", height: 120,
      background: "#131921",
      backgroundImage: banner.imageUrl ? `url(${banner.imageUrl})` : undefined,
      backgroundSize: "cover", backgroundPosition: "center",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, rgba(19,25,33,0.85) 0%, rgba(19,25,33,0.2) 100%)",
        display: "flex", alignItems: "center", padding: "0 24px",
      }}>
        <span style={{
          color: banner.textColor || "#fff", fontFamily: "'Lora', serif",
          fontSize: 22, fontWeight: 700,
        }}>{banner.headline}</span>
      </div>
    </div>
  );
}
