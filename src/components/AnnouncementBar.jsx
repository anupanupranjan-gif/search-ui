import { useNexarankContent } from "nexarank-content-sdk/react";
import { NEXARANK_CONTENT_OPTIONS } from "../api";

// NR-86: site-wide slim bar driven by an ANNOUNCEMENT_BAR content rule.
// Renders nothing while loading or when no rule is ACTIVE — unlike
// HERO_BANNER (which has an explicit skeleton per NR-86's spec), a
// visible loading flash on every route change for a thin secondary zone
// would be noisier than just popping in once resolved.
export default function AnnouncementBar() {
  const { content } = useNexarankContent(["ANNOUNCEMENT_BAR"], {}, NEXARANK_CONTENT_OPTIONS);
  const bar = content.ANNOUNCEMENT_BAR;
  const message = bar?.raw?.message || bar?.headline;
  if (!message) return null;

  return (
    <div style={{
      background: bar.backgroundColor || "#ff9900",
      color: bar.textColor || "#131921",
      textAlign: "center", padding: "8px 16px", fontSize: 13,
      fontFamily: "'DM Mono', monospace", fontWeight: 600,
    }}>
      {message}
      {bar.ctaText && bar.ctaLink && (
        <a
          href={bar.ctaLink}
          style={{ marginLeft: 10, textDecoration: "underline", color: "inherit" }}
        >{bar.ctaText}</a>
      )}
    </div>
  );
}
