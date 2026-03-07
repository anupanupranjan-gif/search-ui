import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSearch } from "../api";
import ResultsLayout from "../components/ResultsLayout";

export default function SearchPage({ mode, chatResults, onResultsChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

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
    const q = opts.q ?? query;
    if (!q?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSearch({
        q,
        mode,
        page: opts.page ?? page,
        brand: opts.brand ?? brand,
        minPrice: opts.minPrice ?? minPrice,
        maxPrice: opts.maxPrice ?? maxPrice,
      });
      setTotal(data.total ?? 0);
      setTookMs(data.tookMs ?? null);
      setResults(data.hits ?? []);
      onResultsChange?.(data.hits ?? [], q);
    } catch (e) {
      setError(e.message.includes("fetch") ? "Cannot connect to search API." : e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, mode, page, brand, minPrice, maxPrice, onResultsChange]);

  useEffect(() => {
    if (query) doSearch({ q: query, page: 0 });
  }, [query, mode]);

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
      title={`Results for "${query}"`}
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
