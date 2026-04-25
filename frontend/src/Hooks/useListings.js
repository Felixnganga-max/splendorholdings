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

// ─── Types to EXCLUDE from listings page ─────────────────────────────────────
// These types have their own dedicated pages
const EXCLUDED_TYPES = ["Land", "Project"];

// ─── useListings ──────────────────────────────────────────────────────────────
export function useListings({ limit = 12 } = {}) {
  // ── Filter state ───────────────────────────────────────────────────────────
  const DEFAULT_FILTERS = {
    keyword: "",
    type: "View All",
    location: "All Locations",
    badge: "Any Status",
    sort: "Newest First",
  };

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [typeCategories, setTypeCategories] = useState(["View All"]);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [allProperties, setAllProperties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

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
    setPage(1);
    isAppend.current = false;
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    isAppend.current = false;
    setTick((n) => n + 1);
  }, []);

  // ── Fetch type categories (excluding Land & Project) ───────────────────────
  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/v1/categories?kind=type")
      .then((json) => {
        if (cancelled) return;
        const labels = (json.data?.categories ?? [])
          .map((c) => c.label)
          // 🔴 EXCLUDE Land and Project from filter dropdown
          .filter((label) => !EXCLUDED_TYPES.includes(label));
        setTypeCategories(["View All", ...labels]);
      })
      .catch(() => {
        /* non-fatal */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fetch properties (excluding Land & Project) ───────────────────────────
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

    // 🔴 Only add type filter if it's not "View All" AND not an excluded type
    if (filters.type !== "View All" && !EXCLUDED_TYPES.includes(filters.type)) {
      params.set("type", filters.type);
    }

    if (filters.badge !== "Any Status") params.set("badge", filters.badge);
    if (filters.keyword.trim()) params.set("search", filters.keyword.trim());

    console.log("Fetching listings with params:", params.toString());

    apiFetch(`/api/v1/properties?${params.toString()}`)
      .then((json) => {
        if (cancelled) return;
        let incoming = json.data?.properties ?? [];

        // 🔴 CRITICAL: Filter out Land and Project types
        const filteredIncoming = incoming.filter(
          (prop) => !EXCLUDED_TYPES.includes(prop.type),
        );

        console.log(
          `Total from API: ${incoming.length}, After filtering: ${filteredIncoming.length}`,
        );
        console.log(
          "Filtered out types:",
          incoming
            .filter((p) => EXCLUDED_TYPES.includes(p.type))
            .map((p) => p.type),
        );

        setAllProperties((prev) =>
          isAppend.current ? [...prev, ...filteredIncoming] : filteredIncoming,
        );

        // Update pagination to reflect filtered counts
        const newTotal = isAppend.current
          ? allProperties.length + filteredIncoming.length
          : filteredIncoming.length;

        setPagination({
          ...json.pagination,
          total: newTotal,
          pages: Math.ceil(newTotal / limit),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching properties:", err);
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
  }, [
    filters.type,
    filters.badge,
    filters.keyword,
    filters.sort,
    page,
    limit,
    tick,
  ]);

  // ── Client-side location filter ──────────────────────────────────────────
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
    totalCount: properties.length,
  };
}

// ─── usePropertyActions ──────────────────────────────────────────────────────
export { usePropertyActions } from "./useFeaturedProperties";
