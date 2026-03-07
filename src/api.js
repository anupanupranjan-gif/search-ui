export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8081/api/v1";
export const OLLAMA_BASE = process.env.REACT_APP_OLLAMA_BASE || "http://localhost:11434";
export const OLLAMA_MODEL = "gemma3:1b";
export const PAGE_SIZE = 20;

export const CATEGORY_MAP = [
  { label: "All Electronics",        display: "Electronics",           emoji: "📱", color: "#1a1a2e" },
  { label: "Home & Kitchen",         display: "Home & Kitchen",        emoji: "🏠", color: "#1e3a2f" },
  { label: "Automotive",             display: "Automotive",            emoji: "🚗", color: "#2a1a0e" },
  { label: "Tools & Home Improvement", display: "Tools & DIY",         emoji: "🔧", color: "#1a2a1a" },
  { label: "Sports & Outdoors",      display: "Sports & Outdoors",     emoji: "⚽", color: "#0e2233" },
  { label: "Health & Personal Care", display: "Health & Beauty",       emoji: "💊", color: "#2a1a2a" },
  { label: "Office Products",        display: "Office Products",       emoji: "🗂️", color: "#1a1a1a" },
  { label: "Toys & Games",           display: "Toys & Games",          emoji: "🧸", color: "#2a1e0a" },
  { label: "AMAZON FASHION",         display: "Fashion",               emoji: "👕", color: "#2a0a1a" },
  { label: "Industrial & Scientific",display: "Industrial",            emoji: "⚗️", color: "#0a1a2a" },
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
];

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

export async function fetchSearch({ q, mode, page, category, brand, minPrice, maxPrice }) {
  const params = new URLSearchParams({ q, mode, size: PAGE_SIZE, page });
  if (category) params.set("category", category);
  if (brand) params.set("brand", brand);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  const res = await fetch(`${API_BASE}/search?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
