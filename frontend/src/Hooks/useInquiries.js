import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = "https://splendorholdings-2v47.vercel.app/api/v1";

// ── Shared fetch helper ───────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ── useInquiries ──────────────────────────────────────────────────────────────
/**
 * Master hook for the Inquiries dashboard page.
 *
 * @param {object} options
 * @param {number}  options.limit         - Items per page (default 20)
 * @param {string}  options.initialType   - Pre-filter by type (default "All")
 * @param {string}  options.initialStatus - Pre-filter by status (default "")
 * @param {boolean} options.autoFetch     - Fetch on mount (default true)
 * @param {number}  options.pollInterval  - ms between auto-refreshes, 0 = off (default 0)
 */
export function useInquiries({
  limit = 20,
  initialType = "All",
  initialStatus = "",
  autoFetch = true,
  pollInterval = 0,
} = {}) {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [localReadIds, setLocalReadIds] = useState(new Set());

  const pollRef = useRef(null);

  // ── Fetch list ──────────────────────────────────────────────────────────────
  const fetchInquiries = useCallback(
    async (opts = {}) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(opts.page ?? page),
          limit: String(limit),
          sort: "-createdAt",
          ...(search && { search }),
          ...(typeFilter !== "All" && { type: typeFilter }),
          ...(statusFilter && { status: statusFilter }),
          ...opts.params,
        });

        const data = await apiFetch(`/inquiries?${params}`);
        const list = data?.data?.inquiries || [];
        setInquiries(list);
        setTotalPages(data?.pagination?.pages ?? 1);
        setTotalCount(data?.pagination?.total ?? list.length);

        setLocalReadIds((prev) => {
          const next = new Set(prev);
          list.forEach((inq) => {
            if (inq.status !== "unread") next.add(inq._id);
          });
          return next;
        });
      } catch (err) {
        setError(err.message || "Failed to load inquiries.");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search, typeFilter, statusFilter],
  );

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await apiFetch("/inquiries/stats");
      setStats(data?.data?.stats ?? null);
    } catch (_) {
      // Stats are non-critical; fail silently
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Open / select inquiry ───────────────────────────────────────────────────
  const openInquiry = useCallback(
    async (idOrObj) => {
      const id = typeof idOrObj === "string" ? idOrObj : idOrObj._id;

      setLocalReadIds((prev) => new Set([...prev, id]));
      setInquiries((prev) =>
        prev.map((inq) =>
          inq._id === id && inq.status === "unread"
            ? { ...inq, status: "read" }
            : inq,
        ),
      );

      setDetailLoading(true);
      try {
        const data = await apiFetch(`/inquiries/${id}`);
        setSelected(data?.data?.inquiry ?? null);
        fetchStats();
      } catch (err) {
        setError(err.message || "Failed to load inquiry.");
      } finally {
        setDetailLoading(false);
      }
    },
    [fetchStats],
  );

  // ── Reply ───────────────────────────────────────────────────────────────────
  const replyToInquiry = useCallback(
    async (id, body, channel = "email") => {
      const data = await apiFetch(`/inquiries/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ body, channel }),
      });
      const updated = data?.data?.inquiry;

      setInquiries((prev) =>
        prev.map((inq) =>
          inq._id === id ? { ...inq, status: "replied" } : inq,
        ),
      );
      if (selected?._id === id) {
        setSelected(updated ?? { ...selected, status: "replied" });
      }
      fetchStats();
      return updated;
    },
    [selected, fetchStats],
  );

  // ── Archive ─────────────────────────────────────────────────────────────────
  const archiveInquiry = useCallback(
    async (id) => {
      await apiFetch(`/inquiries/${id}/archive`, { method: "PATCH" });
      setInquiries((prev) =>
        prev.map((inq) =>
          inq._id === id ? { ...inq, status: "archived" } : inq,
        ),
      );
      if (selected?._id === id) {
        setSelected((prev) => ({ ...prev, status: "archived" }));
      }
      fetchStats();
    },
    [selected, fetchStats],
  );

  // ── Assign ──────────────────────────────────────────────────────────────────
  const assignInquiry = useCallback(
    async (id, userId) => {
      const data = await apiFetch(`/inquiries/${id}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ userId }),
      });
      const updated = data?.data?.inquiry;
      setInquiries((prev) =>
        prev.map((inq) =>
          inq._id === id ? { ...inq, assignedTo: updated?.assignedTo } : inq,
        ),
      );
      if (selected?._id === id && updated) setSelected(updated);
      return updated;
    },
    [selected],
  );

  // ── Pagination helpers ──────────────────────────────────────────────────────
  const goToPage = useCallback((p) => setPage(p), []);
  const nextPage = useCallback(
    () => setPage((p) => Math.min(p + 1, totalPages)),
    [totalPages],
  );
  const prevPage = useCallback(() => setPage((p) => Math.max(p - 1, 1)), []);

  // ── Filter helpers (reset page on change) ──────────────────────────────────
  const handleSetSearch = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);
  const handleSetTypeFilter = useCallback((v) => {
    setTypeFilter(v);
    setPage(1);
  }, []);
  const handleSetStatusFilter = useCallback((v) => {
    setStatusFilter(v);
    setPage(1);
  }, []);

  // ── Auto-fetch on mount + deps ──────────────────────────────────────────────
  useEffect(() => {
    if (autoFetch) {
      fetchInquiries();
      fetchStats();
    }
  }, [fetchInquiries, fetchStats, autoFetch]);

  // ── Polling ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pollInterval) return;
    pollRef.current = setInterval(() => {
      fetchInquiries();
      fetchStats();
    }, pollInterval);
    return () => clearInterval(pollRef.current);
  }, [pollInterval, fetchInquiries, fetchStats]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const unreadCount =
    stats?.unread ??
    inquiries.filter((i) => !localReadIds.has(i._id) && i.status === "unread")
      .length;

  return {
    inquiries,
    selected,
    stats,
    unreadCount,
    page,
    totalPages,
    totalCount,
    goToPage,
    nextPage,
    prevPage,
    search,
    typeFilter,
    statusFilter,
    setSearch: handleSetSearch,
    setTypeFilter: handleSetTypeFilter,
    setStatusFilter: handleSetStatusFilter,
    loading,
    statsLoading,
    detailLoading,
    error,
    openInquiry,
    replyToInquiry,
    archiveInquiry,
    assignInquiry,
    refresh: () => {
      fetchInquiries();
      fetchStats();
    },
  };
}

// ── useInquiryStats (lightweight — badge only) ────────────────────────────────
/**
 * Minimal hook just for the nav badge. Polls every N ms.
 *
 * @param {number} pollInterval  ms between polls (default 60 000 = 1 min)
 */
export function useInquiryStats(pollInterval = 60_000) {
  const [stats, setStats] = useState(null);

  const fetchS = useCallback(async () => {
    try {
      const data = await apiFetch("/inquiries/stats");
      setStats(data?.data?.stats ?? null);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchS();
    if (!pollInterval) return;
    const id = setInterval(fetchS, pollInterval);
    return () => clearInterval(id);
  }, [fetchS, pollInterval]);

  return { stats, unreadCount: stats?.unread ?? 0, refresh: fetchS };
}
