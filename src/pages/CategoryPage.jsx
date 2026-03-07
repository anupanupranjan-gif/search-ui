import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { fetchSearch, CATEGORY_MAP } from "../api";
import ResultsLayout from "../components/ResultsLayout";

export default function CategoryPage({ mode, onResultsChange }) {
  const { categoryLabel } = useParams();
  const decodedLabel = decodeURIComponent(categoryLabel);

  const catInfo = CATEGORY_MAP.find(c => c.label === decodedLabel) || {
    label: decodedLabel, display: decodedLabel, emoji: "📦",
  };

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [tookMs, setTookMs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("relevant");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(0);

  const doSearch = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSearch({
        q: "*",
        mode,
        page: opts.page ?? page,
        category: decodedLabel,
        brand: opts.brand ?? brand,
        minPrice: opts.minPrice ?? minPrice,
        maxPrice: opts.maxPrice ?? maxPrice,
      });
      setTotal(data.total ?? 0);
      setTookMs(data.tookMs ?? null);
      setResults(data.hits ?? []);
      onResultsChange?.(data.hits ?? [], decodedLabel);
    } catch (e) {
      setError(e.message.includes("fetch") ? "Cannot connect to search API." : e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [decodedLabel, mode, page, brand, minPrice, maxPrice, onResultsChange]);

  useEffect(() => {
    setPage(0);
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    doSearch({ page: 0, brand: "", minPrice: "", maxPrice: "" });
  }, [decodedLabel, mode]);

  const handleFilterChange = (key, value) => {
    if (key === "sort") { setSort(value); return; }
    if (key === "brand") { setBrand(value); doSearch({ brand: value, page: 0 }); }
    if (key === "minPrice") { setMinPrice(value); doSearch({ minPrice: value, page: 0 }); }
    if (key === "maxPrice") { setMaxPrice(value); doSearch({ maxPrice: value, page: 0 }); }
    setPage(0);
  };

  const handlePageChange = (p) => {
    setPage(p);
    doSearch({ page: p });
    window.scrollTo(0, 0);
  };

  return (
    <ResultsLayout
      title={`${catInfo.emoji} ${catInfo.display}`}
      subtitle
      results={results}
      total={total}
      tookMs={tookMs}
      loading={loading}
      error={error}
      sort={sort}
      brand={brand}
      minPrice={minPrice}
      maxPrice={maxPrice}
      page={page}
      mode={mode}
      onFilterChange={handleFilterChange}
      onPageChange={handlePageChange}
    />
  );
}
