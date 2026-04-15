import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = "https://splendorholdings-2v47.vercel.app";

// ─── apiFetch ─────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json?.message ?? `Request failed (${res.status})`);
  return json;
}

// ─── Sort option → backend sort param ────────────────────────────────────────
const SORT_MAP = {
  "Newest First": "-createdAt",
  "Price: Low → High": "pricing.original",
  "Price: High → Low": "-pricing.original",
  "Top Rated": "-rating",
  "Featured First": "-isFeatured -createdAt",
};

// ─── useListings ──────────────────────────────────────────────────────────────
/**
 * Full-featured hook for the Listings page.
 *
 * Handles:
 *  - Server-side search (`?search=`), type (`?type=`), badge (`?badge=`)
 *  - Client-parsed location filter (location is part of the `location` string
 *    field — we filter client-side since the backend has no dedicated county param)
 *  - Server-side sort via SORT_MAP
 *  - Cursor-based "Load More" (appends to existing list)
 *  - Dynamic property-type categories from /api/v1/categories?kind=type
 *
 * @returns {{
 *   properties   : object[],
 *   typeCategories: string[],         // ["View All", ...labels]
 *   loading      : boolean,
 *   loadingMore  : boolean,
 *   error        : string|null,
 *   hasMore      : boolean,
 *   pagination   : object|null,
 *   filters      : object,            // current filter state
 *   setFilter    : (key, value) => void,
 *   resetFilters : () => void,
 *   loadMore     : () => void,
 *   refetch      : () => void,
 *   totalCount   : number,
 * }}
 */
export function useListings({ limit = 12 } = {}) {
  // ── Filter state ───────────────────────────────────────────────────────────
  const DEFAULT_FILTERS = {
    keyword: "",
    type: "View All", // maps to ?type=  (omit when "View All")
    location: "All Locations",
    badge: "Any Status", // maps to ?badge= (omit when "Any Status")
    sort: "Newest First",
  };

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [typeCategories, setTypeCategories] = useState(["View All"]);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [allProperties, setAllProperties] = useState([]); // raw from API (before client location filter)
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  // Track whether current fetch is a "load more" append vs fresh fetch
  const isAppend = useRef(false);

  const refetch = useCallback(() => {
    setPage(1);
    isAppend.current = false;
    setTick((n) => n + 1);
  }, []);

  const loadMore = useCallback(() => {
    if (!pagination || page >= pagination.pages) return;
    isAppend.current = true;
    setPage((p) => p + 1);
  }, [pagination, page]);

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    // Any filter change resets to page 1
    setPage(1);
    isAppend.current = false;
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    isAppend.current = false;
    setTick((n) => n + 1);
  }, []);

  // ── Fetch type categories once ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/v1/categories?kind=type")
      .then((json) => {
        if (cancelled) return;
        const labels = (json.data?.categories ?? []).map((c) => c.label);
        setTypeCategories(["View All", ...labels]);
      })
      .catch(() => {
        /* non-fatal */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fetch properties ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    if (!isAppend.current) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort: SORT_MAP[filters.sort] ?? "-createdAt",
    });

    if (filters.type !== "View All") params.set("type", filters.type);
    if (filters.badge !== "Any Status") params.set("badge", filters.badge);
    if (filters.keyword.trim()) params.set("search", filters.keyword.trim());

    apiFetch(`/api/v1/properties?${params.toString()}`)
      .then((json) => {
        if (cancelled) return;
        const incoming = json.data?.properties ?? [];
        setAllProperties((prev) =>
          isAppend.current ? [...prev, ...incoming] : incoming,
        );
        setPagination(json.pagination ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "Failed to load properties.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setLoadingMore(false);
        isAppend.current = false;
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.type,
    filters.badge,
    filters.keyword,
    filters.sort,
    page,
    limit,
    tick,
  ]);

  // ── Client-side location filter (applied after fetch) ─────────────────────
  const properties =
    filters.location === "All Locations"
      ? allProperties
      : allProperties.filter((p) =>
          p.location?.toLowerCase().includes(filters.location.toLowerCase()),
        );

  return {
    properties,
    typeCategories,
    loading,
    loadingMore,
    error,
    hasMore: pagination ? page < pagination.pages : false,
    pagination,
    filters,
    setFilter,
    resetFilters,
    loadMore,
    refetch,
    totalCount: pagination?.total ?? properties.length,
  };
}

// ─── usePropertyActions (re-exported for Listings page use) ──────────────────
export { usePropertyActions } from "./useFeaturedProperties";
