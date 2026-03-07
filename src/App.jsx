import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import ChatSidebar from "./components/ChatSidebar";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import CategoryPage from "./pages/CategoryPage";

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Mono', monospace; background: #f3f3f3; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .product-grid > * { animation: fadeIn 0.25s ease both; }
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
`;

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q") || "";
  });
  const [mode, setMode] = useState("hybrid");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatResults, setChatResults] = useState([]);
  const [chatQuery, setChatQuery] = useState("");

  const isHome = location.pathname === "/";

  const handleSearch = (q) => {
    if (!q?.trim()) return;
    setQuery(q);
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const handleResultsChange = (results, q) => {
    setChatResults(results);
    setChatQuery(q);
  };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {!isHome && (
        <Header
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          mode={mode}
          onModeChange={setMode}
          chatOpen={chatOpen}
          onChatToggle={() => setChatOpen(o => !o)}
          onLogoClick={() => navigate("/")}
        />
      )}

      {isHome && (
        <div style={{
          position: "absolute", top: 16, right: 20, zIndex: 50,
          display: "flex", gap: 8,
        }}>
          <button
            onClick={() => setChatOpen(o => !o)}
            style={{
              background: chatOpen ? "#ff9900" : "rgba(255,153,0,0.15)",
              border: "1px solid rgba(255,153,0,0.4)",
              borderRadius: 6, padding: "6px 14px",
              color: chatOpen ? "#131921" : "#ff9900",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Mono', monospace", letterSpacing: 0.3,
            }}
          >✦ AI Chat</button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/search"
          element={
            <SearchPage
              mode={mode}
              onResultsChange={handleResultsChange}
            />
          }
        />
        <Route
          path="/category/:categoryLabel"
          element={
            <CategoryPage
              mode={mode}
              onResultsChange={handleResultsChange}
            />
          }
        />
      </Routes>

      <ChatSidebar
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        searchResults={chatResults}
        currentQuery={chatQuery}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
