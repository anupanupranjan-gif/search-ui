import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSearch, fetchAsk } from "../api";
import ResultsLayout from "../components/ResultsLayout";

export default function SearchPage({ mode, chatResults, onResultsChange, rewrite }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const refreshKey = searchParams.get("_r");

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [tookMs, setTookMs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("relevant");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(0);
  // NR-36: any configured facet beyond brand/category/minPrice/maxPrice
  // (which each have their own dedicated state above) — previously these
  // were silently dropped by handleFilterChange below, so a facet imported
  // via "Fetch Fields from Engine" (NR-118) could be clicked in the sidebar
  // but never actually filtered or reached facet usage reporting.
  const [otherFacets, setOtherFacets] = useState({});

  const [askAnswer, setAskAnswer] = useState(null);
  const [askMode, setAskMode] = useState("answer");
  const [rewrittenQuery, setRewrittenQuery] = useState(null);
  const [originalQuery, setOriginalQuery] = useState(null);
  const [facets, setFacets] = useState(null);

  const doSearch = useCallback(async (opts = {}) => {
    const q = opts.q ?? query;
    if (!q?.trim()) return;
    setLoading(true);
    setError(null);
    setAskAnswer(null);
    try {
      const currentMode = opts.mode ?? mode;
      if (currentMode === "ask") {
        const data = await fetchAsk({ q, mode: "hybrid" });
        setTotal(data.total ?? 0);
        setTookMs(data.tookMs ?? null);
        setResults(data.products ?? []);
        setAskAnswer(data.answer ?? null);
        setAskMode(data.mode ?? "answer");
        onResultsChange?.(data.products ?? [], q);
      } else {
        const data = await fetchSearch({
          q,
          mode: currentMode,
          page: opts.page ?? page,
          brand: opts.brand ?? brand,
          category: opts.category ?? category,
          minPrice: opts.minPrice ?? minPrice,
          maxPrice: opts.maxPrice ?? maxPrice,
          rewrite: rewrite ?? false,
          facets: opts.facets ?? otherFacets,
        });
        // NR-88 follow-up: a REDIRECT rule matched — navigate away instead of
        // rendering results. window.location.href (not react-router's navigate())
        // since redirectUrl can be an absolute https:// URL as well as a same-
        // origin path.
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }
        setTotal(data.total ?? 0);
        setTookMs(data.tookMs ?? null);
        setResults(data.hits ?? []);
        setRewrittenQuery(data.rewrittenQuery ?? null);
        setOriginalQuery(data.originalQuery ?? null);
        setFacets(data.facets ?? null);
        onResultsChange?.(data.hits ?? [], q);
      }
    } catch (e) {
      setError(e.message.includes("fetch") ? "Cannot connect to search API." : e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, mode, page, brand, category, minPrice, maxPrice, otherFacets, onResultsChange]);

  useEffect(() => {
    if (query) doSearch({ q: query, page: 0 });
  }, [query, mode, refreshKey]);

  const handleFilterChange = (key, value) => {
    if (key === "sort") { setSort(value); return; }
    if (key === "brand") { setBrand(value); doSearch({ brand: value, page: 0 }); }
    else if (key === "category") { setCategory(value); doSearch({ category: value, page: 0 }); }
    else if (key === "minPrice") { setMinPrice(value); doSearch({ minPrice: value, page: 0 }); }
    else if (key === "maxPrice") { setMaxPrice(value); doSearch({ maxPrice: value, page: 0 }); }
    else {
      // NR-36: any other configured facet (fieldName from FacetSidebar) —
      // single-value-select per field, same convention as brand/category.
      const next = { ...otherFacets, [key]: value };
      setOtherFacets(next);
      doSearch({ facets: next, page: 0 });
    }
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
      query={query}
      subtitle
      results={results}
      total={total}
      tookMs={tookMs}
      loading={loading}
      error={error}
      sort={sort}
      brand={brand}
      category={category}
      minPrice={minPrice}
      maxPrice={maxPrice}
      page={page}
      mode={mode}
      onFilterChange={handleFilterChange}
      onPageChange={handlePageChange}
      askAnswer={askAnswer}
      rewrittenQuery={rewrittenQuery}
      originalQuery={originalQuery}
      facets={facets}
    />
  );
}
