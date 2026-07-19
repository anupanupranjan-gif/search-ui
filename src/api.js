export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost/api/v1";
export const OLLAMA_BASE = process.env.REACT_APP_OLLAMA_BASE || "http://localhost:11434";
export const OLLAMA_MODEL = "gemma3:1b";
export const PAGE_SIZE = 20;

// Stable per-visit session id — generated once and kept in sessionStorage so
// searches and clicks within the same tab/visit share one id (survives page
// navigation, cleared on tab close). Ties NexaRank's click-history
// personalization to a coherent visit instead of a fresh id per component mount.
const SESSION_STORAGE_KEY = "nexarank_session_id";

export function getSessionId() {
  let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

const API_HEADERS = {
  "X-API-Key": "searchx-dev-key-2026",
  "Content-Type": "application/json",
};

export const CATEGORY_MAP = [
  { label: "All Electronics",          display: "Electronics",       emoji: "📱", color: "#1a1a2e" },
  { label: "Amazon Home",              display: "Home & Kitchen",    emoji: "🏠", color: "#1e3a2f" },
  { label: "Home & Kitchen",           display: "Home & Kitchen",    emoji: "🏠", color: "#1e3a2f" },
  { label: "Automotive",               display: "Automotive",        emoji: "🚗", color: "#2a1a0e" },
  { label: "Tools & Home Improvement", display: "Tools & DIY",       emoji: "🔧", color: "#1a2a1a" },
  { label: "Sports & Outdoors",        display: "Sports & Outdoors", emoji: "⚽", color: "#0e2233" },
  { label: "Health & Personal Care",   display: "Health & Beauty",   emoji: "💊", color: "#2a1a2a" },
  { label: "Office Products",          display: "Office Products",   emoji: "🗂️", color: "#1a1a1a" },
  { label: "Toys & Games",             display: "Toys & Games",      emoji: "🧸", color: "#2a1e0a" },
  { label: "AMAZON FASHION",           display: "Fashion",           emoji: "👕", color: "#2a0a1a" },
  { label: "Industrial & Scientific",  display: "Industrial",        emoji: "⚗️", color: "#0a1a2a" },
];

export const SORT_OPTIONS = [
  { id: "relevant",    label: "Most Relevant",     icon: "✦" },
  { id: "recommended", label: "Recommended",        icon: "★" },
  { id: "bestseller",  label: "Best Seller",        icon: "🔥" },
  { id: "price_asc",   label: "Price: Low to High", icon: "↑" },
  { id: "price_desc",  label: "Price: High to Low", icon: "↓" },
  { id: "rating",      label: "Avg. Rating",        icon: "⭐" },
];

export const SEARCH_MODES = [
  { id: "hybrid",  label: "Hybrid",  desc: "BM25 + Vector" },
  { id: "vector",  label: "Semantic", desc: "Vector only" },
  { id: "keyword", label: "Keyword", desc: "BM25 only" },
  { id: "ask",     label: "Ask AI",  desc: "RAG answer" },
];

export async function fetchAsk({ q, mode, category, compare }) {
  const params = new URLSearchParams({ q, mode: mode || "hybrid" });
  if (category) params.set("category", category);
  if (compare) params.set("compare", "true");
  const res = await fetch(`${API_BASE}/ask?${params}`, { headers: API_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function getCategoryEmoji(category) {
  if (!category) return "📦";
  if (category.includes("Electronic") || category.includes("Camera") || category.includes("Cell")) return "📱";
  if (category.includes("Tool") || category.includes("Industrial")) return "🔧";
  if (category.includes("Sport")) return "⚽";
  if (category.includes("Health")) return "💊";
  if (category.includes("Toy")) return "🧸";
  if (category.includes("Fashion") || category.includes("Clothing")) return "👕";
  if (category.includes("Home") || category.includes("Kitchen") || category.includes("Appliance")) return "🏠";
  if (category.includes("Auto") || category.includes("Car")) return "🚗";
  if (category.includes("Office")) return "🗂️";
  return "📦";
}

export function sortResults(hits, sortId) {
  if (!hits?.length) return hits;
  const sorted = [...hits];
  switch (sortId) {
    case "price_asc":    return sorted.sort((a, b) => (a.price || 999) - (b.price || 999));
    case "price_desc":   return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "rating":       return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "bestseller":   return sorted.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
    case "recommended":  return sorted.sort((a, b) => {
      const sA = (a.score || 0) * 0.6 + (a.rating || 0) * 0.4;
      const sB = (b.score || 0) * 0.6 + (b.rating || 0) * 0.4;
      return sB - sA;
    });
    default: return sorted;
  }
}

export async function fetchSearch({ q, mode, page, category, brand, minPrice, maxPrice, rewrite }) {
  const params = new URLSearchParams({ q, mode, size: PAGE_SIZE, page, sessionId: getSessionId() });
  if (category) params.set("category", category);
  if (brand) params.set("brand", brand);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  if (rewrite) params.set("rewrite", "true");
  const res = await fetch(`${API_BASE}/search?${params}`, { headers: API_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchClick({ sessionId, query, productId, productTitle, position }) {
  try {
    await fetch(`${API_BASE}/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, query, productId, productTitle, position }),
    });
  } catch (e) {
    // fire and forget — don't block the UI on click tracking failures
    console.debug("Click tracking failed:", e.message);
  }
}
