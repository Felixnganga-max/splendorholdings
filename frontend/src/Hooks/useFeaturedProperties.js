import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

/**
 * Fetches a resource from the API with optional auth token.
 * Returns { data, error } — never throws.
 */
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
  if (!res.ok) {
    throw new Error(json?.message ?? `Request failed (${res.status})`);
  }
  return json;
}

// ─── useFeaturedProperties ────────────────────────────────────────────────────
/**
 * Fetches active property types from /api/v1/categories?kind=type
 * and properties from /api/v1/properties (paginated, sorted by featured first).
 *
 * @param {object}  opts
 * @param {number}  [opts.limit=12]          – cards to fetch per page
 * @param {boolean} [opts.featuredOnly=false] – restrict to isFeatured=true
 *
 * @returns {{
 *   properties  : object[],
 *   tabs        : string[],       // ["View All", ...category labels]
 *   activeTab   : string,
 *   setActiveTab: (tab: string) => void,
 *   loading     : boolean,
 *   error       : string|null,
 *   pagination  : object,
 *   page        : number,
 *   setPage     : (n: number) => void,
 *   refetch     : () => void,
 * }}
 */
export function useFeaturedProperties({
  limit = 12,
  featuredOnly = false,
} = {}) {
  const [tabs, setTabs] = useState(["View All"]);
  const [activeTab, setActiveTab] = useState("View All");
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0); // increment to force refetch

  const refetch = useCallback(() => setTick((n) => n + 1), []);

  // ── Fetch categories once on mount ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/v1/categories?kind=type")
      .then((json) => {
        if (cancelled) return;
        const labels = (json.data?.categories ?? []).map((c) => c.label);
        setTabs(["View All", ...labels]);
      })
      .catch(() => {
        // Category fetch failure is non-fatal — we'll show "View All" only
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fetch properties when tab / page / tick changes ────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort: "-isFeatured -createdAt",
    });

    if (activeTab !== "View All") params.set("type", activeTab);
    if (featuredOnly) params.set("isFeatured", "true");

    apiFetch(`/api/v1/properties?${params.toString()}`)
      .then((json) => {
        if (cancelled) return;
        setProperties(json.data?.properties ?? []);
        setPagination(json.pagination ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "Failed to load properties.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, limit, featuredOnly, tick]);

  // Reset to page 1 whenever the filter tab changes
  const handleSetActiveTab = useCallback((tab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  return {
    properties,
    tabs,
    activeTab,
    setActiveTab: handleSetActiveTab,
    loading,
    error,
    pagination,
    page,
    setPage,
    refetch,
  };
}

// ─── usePropertyActions ───────────────────────────────────────────────────────
/**
 * Provides `placeOrder` and `submitInquiry` actions for a given property.
 *
 * @param {string} propertyId – the property._id to act on
 *
 * @returns {{
 *   placeOrder    : (payload: { offeredPrice?: number, notes?: string }) => Promise<object>,
 *   submitInquiry : (payload: { message: string, type?: string, guestName?: string, guestEmail?: string, guestPhone?: string }) => Promise<object>,
 *   actionLoading : boolean,
 *   actionError   : string|null,
 *   clearActionError: () => void,
 * }}
 */
export function usePropertyActions(propertyId) {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const clearActionError = useCallback(() => setActionError(null), []);

  /**
   * POST /api/v1/orders — requires auth token in localStorage("token").
   * Throws if the user is not logged in so the UI can show a login prompt.
   */
  const placeOrder = useCallback(
    async ({ offeredPrice, notes } = {}) => {
      const token = localStorage.getItem("token");
      if (!token) {
        const err = new Error("LOGIN_REQUIRED");
        err.loginRequired = true;
        throw err;
      }

      setActionLoading(true);
      setActionError(null);
      try {
        const json = await apiFetch("/api/v1/orders", {
          method: "POST",
          body: JSON.stringify({ propertyId, offeredPrice, notes }),
        });
        return json.data?.order ?? json;
      } catch (err) {
        setActionError(err.message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [propertyId],
  );

  /**
   * POST /api/v1/inquiries — works for guests (no token needed).
   * Guests must supply guestEmail; logged-in users are auto-attached via token.
   */
  const submitInquiry = useCallback(
    async ({
      message,
      type = "Information",
      guestName,
      guestEmail,
      guestPhone,
    } = {}) => {
      setActionLoading(true);
      setActionError(null);
      try {
        const json = await apiFetch("/api/v1/inquiries", {
          method: "POST",
          body: JSON.stringify({
            propertyId,
            message,
            type,
            guestName,
            guestEmail,
            guestPhone,
          }),
        });
        return json.data?.inquiry ?? json;
      } catch (err) {
        setActionError(err.message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [propertyId],
  );

  return {
    placeOrder,
    submitInquiry,
    actionLoading,
    actionError,
    clearActionError,
  };
}
