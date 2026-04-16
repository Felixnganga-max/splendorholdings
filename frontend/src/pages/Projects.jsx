import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Star,
  X,
  ChevronDown,
  AlertCircle,
  Loader2,
  CheckCircle2,
  LogIn,
  ArrowRight,
  RotateCcw,
  Building2,
  Clock,
  CheckCheck,
  TrendingUp,
} from "lucide-react";

// ─── Brand Tokens (mirrors Listings) ─────────────────────────────────────────
const B = {
  primary: "#0a1172",
  secondary: "#1a3a5c",
  accent: "#d4af37",
  beige: "#ede8dc",
  white: "#fafaf8",
  black: "#0d0d0d",
  text: "#1a1a2e",
  muted: "#6b7280",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Lato', 'Helvetica Neue', Arial, sans-serif",
  grad: "linear-gradient(135deg, #0a1172 0%, #1a3a5c 100%)",
  gradGold: "linear-gradient(135deg, #d4af37 0%, #b8962e 100%)",
  completedBadge: "#1a7a4a",
  inProgressBadge: "#b45309",
};

const API_BASE = "https://splendorholdings-2v47.vercel.app";

const heroBgs = [
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&q=80",
  "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1920&q=80",
];

const SORT_OPTIONS = [
  "Newest First",
  "Price: Low → High",
  "Price: High → Low",
  "Featured First",
];

const LOCATION_LIST = [
  "All Locations",
  "Nairobi",
  "Mombasa",
  "Kiambu",
  "Kajiado",
  "Machakos",
  "Kisumu",
];

const spanPattern = [
  { col: 1, row: 2 },
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 1 },
  { col: 1, row: 1 },
  { col: 1, row: 2 },
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 1, row: 1 },
];

const SORT_MAP = {
  "Newest First": "-createdAt",
  "Price: Low → High": "pricing.original",
  "Price: High → Low": "-pricing.original",
  "Featured First": "-isFeatured -createdAt",
};

// ─── API helpers ──────────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPrimaryImage(p) {
  if (!p.images?.length) return null;
  const primary = p.images.find((img) => img.isPrimary);
  return (primary ?? p.images[0])?.url ?? null;
}

function formatPrice(p) {
  if (p.pricing?.label) return p.pricing.label;
  const n = p.pricing?.original;
  if (!n) return "—";
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `KES ${(n / 1_000).toFixed(0)}K`;
  return `KES ${n}`;
}

function normalizeProject(p) {
  return {
    id: p._id,
    name: p.name,
    buildingName: p.buildingName,
    location: p.location,
    price: formatPrice(p),
    beds: p.beds ?? 0,
    baths: p.baths ?? 0,
    area: p.area ?? 0,
    type: p.type ?? "Project",
    badge: p.badge ?? "Project",
    rating: p.rating ?? null,
    img: getPrimaryImage(p),
    isSoldOut: p.isSoldOut ?? false,
    projectStatus: p.projectStatus ?? "in-progress",
    raw: p,
  };
}

// ─── useProjects hook ─────────────────────────────────────────────────────────
function useProjects({ limit = 12 } = {}) {
  const DEFAULT_FILTERS = {
    keyword: "",
    location: "All Locations",
    sort: "Newest First",
  };

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [allProjects, setAllProjects] = useState([]);
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

  useEffect(() => {
    let cancelled = false;
    if (!isAppend.current) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort: SORT_MAP[filters.sort] ?? "-createdAt",
      type: "Project",
    });
    if (filters.keyword.trim()) params.set("search", filters.keyword.trim());

    apiFetch(`/api/v1/properties?${params.toString()}`)
      .then((json) => {
        if (cancelled) return;
        const incoming = json.data?.properties ?? [];
        setAllProjects((prev) =>
          isAppend.current ? [...prev, ...incoming] : incoming,
        );
        setPagination(json.pagination ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "Failed to load projects.");
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
  }, [filters.keyword, filters.sort, page, limit, tick]);

  const projects =
    filters.location === "All Locations"
      ? allProjects
      : allProjects.filter((p) =>
          p.location?.toLowerCase().includes(filters.location.toLowerCase()),
        );

  const completed = projects.filter((p) => p.projectStatus === "completed");
  const inProgress = projects.filter((p) => p.projectStatus !== "completed");

  return {
    projects,
    completed,
    inProgress,
    loading,
    loadingMore,
    error,
    hasMore: pagination ? page < pagination.pages : false,
    filters,
    setFilter,
    resetFilters,
    loadMore,
    refetch,
    totalCount: pagination?.total ?? projects.length,
    completedCount: completed.length,
    inProgressCount: inProgress.length,
  };
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard({ spanCol, spanRow }) {
  return (
    <div
      style={{
        gridColumn: `span ${spanCol}`,
        gridRow: `span ${spanRow}`,
        borderRadius: 20,
        overflow: "hidden",
        background: `linear-gradient(90deg, ${B.beige} 25%, #e0d9cc 50%, ${B.beige} 75%)`,
        backgroundSize: "400% 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
        minHeight: spanRow === 2 ? 500 : 260,
      }}
    />
  );
}

// ─── Project Status Badge ─────────────────────────────────────────────────────
function StatusPill({ status }) {
  const isCompleted = status === "completed";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: isCompleted
          ? "rgba(26,122,74,0.90)"
          : "rgba(180,83,9,0.90)",
        backdropFilter: "blur(8px)",
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        padding: "4px 11px",
        borderRadius: 99,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontFamily: B.sans,
      }}
    >
      {isCompleted ? (
        <CheckCheck size={10} strokeWidth={2.5} />
      ) : (
        <Clock size={10} strokeWidth={2.5} />
      )}
      {isCompleted ? "Completed" : "In Progress"}
    </span>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ property, spanCol, spanRow, onAction }) {
  const [liked, setLiked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const p = normalizeProject(property);
  const isTall = spanRow === 2;
  const isWide = spanCol === 2;

  return (
    <div
      style={{
        gridColumn: `span ${spanCol}`,
        gridRow: `span ${spanRow}`,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        background: B.beige,
        minHeight: isTall ? 500 : 260,
        boxShadow: "0 4px 20px rgba(10,17,114,0.08)",
        transition:
          "transform 0.4s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.4s ease",
        opacity: p.isSoldOut ? 0.75 : 1,
      }}
      onClick={() => !p.isSoldOut && onAction(p)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.013)";
        e.currentTarget.style.boxShadow = "0 28px 64px rgba(10,17,114,0.20)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(10,17,114,0.08)";
      }}
    >
      {/* Image */}
      {p.img ? (
        <img
          src={p.img}
          alt={p.location}
          onLoad={() => setLoaded(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: B.accent,
          }}
        >
          <Building2 size={32} color={B.accent} strokeWidth={1.5} />
          <span style={{ fontSize: 13, fontFamily: B.sans, color: B.muted }}>
            No image
          </span>
        </div>
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10,17,114,0.06) 0%, rgba(10,17,114,0.78) 100%)",
        }}
      />

      {/* Sold Out overlay */}
      {p.isSoldOut && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10,17,114,0.50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
          }}
        >
          <span
            style={{
              fontFamily: B.sans,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#fff",
              padding: "6px 16px",
              border: "2px solid #fff",
              borderRadius: 4,
            }}
          >
            Sold Out
          </span>
        </div>
      )}

      {/* Top badges row */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 56,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          zIndex: 2,
        }}
      >
        <StatusPill status={p.projectStatus} />
        <span
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.28)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 400,
            padding: "4px 11px",
            borderRadius: 99,
            fontFamily: B.sans,
          }}
        >
          {p.badge}
        </span>
      </div>

      {/* Rating */}
      {p.rating != null && p.rating > 0 && (
        <div
          style={{
            position: "absolute",
            top: 52,
            left: 16,
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.28)",
            borderRadius: 99,
            padding: "4px 10px",
            zIndex: 2,
          }}
        >
          <Star size={11} fill={B.accent} color={B.accent} />
          <span
            style={{
              color: "#fff",
              fontSize: 11,
              fontFamily: B.sans,
              fontWeight: 400,
            }}
          >
            {p.rating}
          </span>
        </div>
      )}

      {/* Heart */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setLiked((l) => !l);
        }}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "transform 0.2s",
          zIndex: 2,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <Heart
          size={15}
          fill={liked ? "#ef4444" : "none"}
          color={liked ? "#ef4444" : "white"}
          strokeWidth={2}
        />
      </button>

      {/* Bottom info */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px 20px 18px",
          zIndex: 2,
        }}
      >
        {/* Project / building name */}
        {(p.buildingName || p.name) && (
          <p
            style={{
              fontFamily: B.serif,
              fontSize: isTall ? 16 : 13,
              fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              marginBottom: 6,
              lineHeight: 1.2,
              textShadow: "0 1px 8px rgba(0,0,0,0.4)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {p.buildingName || p.name}
          </p>
        )}

        {/* Location */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginBottom: 12,
          }}
        >
          <MapPin size={12} color={B.accent} strokeWidth={2} />
          <span
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.85)",
              fontFamily: B.sans,
              fontWeight: 400,
            }}
          >
            {p.location}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {/* Specs */}
          <div style={{ display: "flex", gap: 12 }}>
            {p.beds > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Bed size={12} color="rgba(212,175,55,0.9)" strokeWidth={1.8} />
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,235,200,0.9)",
                    fontFamily: B.sans,
                  }}
                >
                  {p.beds} Beds
                </span>
              </div>
            )}
            {p.baths > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Bath
                  size={12}
                  color="rgba(212,175,55,0.9)"
                  strokeWidth={1.8}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,235,200,0.9)",
                    fontFamily: B.sans,
                  }}
                >
                  {p.baths} Baths
                </span>
              </div>
            )}
            {p.area > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Maximize2
                  size={11}
                  color="rgba(212,175,55,0.9)"
                  strokeWidth={1.8}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,235,200,0.9)",
                    fontFamily: B.sans,
                  }}
                >
                  {p.area} m²
                </span>
              </div>
            )}
          </div>

          {/* Price pill */}
          <div
            style={{
              background: "rgba(212,175,55,0.18)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(212,175,55,0.45)",
              borderRadius: 99,
              padding: "5px 14px",
            }}
          >
            <span
              style={{
                fontFamily: B.serif,
                fontSize: isWide || isTall ? 18 : 15,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {p.price}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Action Modal (same as Listings) ─────────────────────────────────────────
function ActionModal({ property, onClose }) {
  const isLoggedIn = !!localStorage.getItem("token");
  const [mode, setMode] = useState("choose");
  const [successMsg, setSuccessMsg] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [inquiryType, setInquiryType] = useState("Information");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleInquiry = async () => {
    if (!inquiryMsg.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await apiFetch(`/api/v1/inquiries`, {
        method: "POST",
        body: JSON.stringify({
          property: property.id,
          message: inquiryMsg,
          type: inquiryType,
          ...(isLoggedIn ? {} : { guestName, guestEmail, guestPhone }),
        }),
      });
      setSuccessMsg("Your inquiry has been sent! We'll be in touch soon.");
      setMode("success");
    } catch (err) {
      setActionError(err.message ?? "Failed to submit inquiry.");
    } finally {
      setActionLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: `1.5px solid ${B.beige}`,
    fontFamily: B.sans,
    fontSize: 14,
    color: B.text,
    background: B.white,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontFamily: B.sans,
    fontSize: 11,
    fontWeight: 700,
    color: B.accent,
    marginBottom: 5,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  };

  const btnPrimary = {
    width: "100%",
    padding: "13px",
    borderRadius: 99,
    border: "none",
    background: B.grad,
    color: B.white,
    fontFamily: B.sans,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    cursor: actionLoading ? "not-allowed" : "pointer",
    opacity: actionLoading ? 0.7 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,17,114,0.50)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: B.white,
          borderRadius: 24,
          width: "100%",
          maxWidth: 460,
          padding: "30px 28px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid rgba(212,175,55,0.28)",
          boxShadow: "0 24px 80px rgba(10,17,114,0.25)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `1.5px solid ${B.beige}`,
            background: B.white,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={15} color={B.muted} />
        </button>

        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <StatusPill status={property.projectStatus} />
          </div>
          <p
            style={{
              fontFamily: B.sans,
              fontSize: 11,
              color: B.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 3,
            }}
          >
            Project · {property.location}
          </p>
          <h3
            style={{
              fontFamily: B.serif,
              fontSize: 22,
              fontWeight: 700,
              color: B.text,
            }}
          >
            {property.buildingName || property.name}
          </h3>
          <p
            style={{
              fontFamily: B.serif,
              fontSize: 20,
              fontWeight: 700,
              color: B.primary,
              marginTop: 2,
            }}
          >
            {property.price}
          </p>
        </div>
        <div style={{ height: 1, background: B.beige, marginBottom: 22 }} />

        {mode === "choose" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p
              style={{
                fontFamily: B.sans,
                fontSize: 14,
                color: B.muted,
                marginBottom: 8,
                lineHeight: 1.6,
              }}
            >
              Interested in this project?
            </p>
            <button
              onClick={() => {
                setActionError(null);
                setMode("inquiry");
              }}
              style={btnPrimary}
            >
              <ArrowRight size={14} /> Send an Inquiry
            </button>
          </div>
        )}

        {mode === "inquiry" && (
          <div>
            <h4
              style={{
                fontFamily: B.serif,
                fontSize: 20,
                fontWeight: 700,
                color: B.text,
                marginBottom: 18,
              }}
            >
              Send an Inquiry
            </h4>
            {!isLoggedIn && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Your Name</label>
                  <input
                    style={inputStyle}
                    placeholder="Jane Doe"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Email *</label>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="you@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Phone (optional)</label>
                  <input
                    style={inputStyle}
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                  />
                </div>
              </>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Inquiry Type</label>
              <select
                style={{ ...inputStyle, appearance: "none" }}
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
              >
                {["Information", "Viewing", "Investment", "Other"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Message *</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                placeholder="What would you like to know about this project?"
                value={inquiryMsg}
                onChange={(e) => setInquiryMsg(e.target.value)}
              />
            </div>
            {actionError && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  background: "#fff0f0",
                  border: "1px solid #fca5a5",
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginBottom: 14,
                }}
              >
                <AlertCircle
                  size={15}
                  color="#dc2626"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <p
                  style={{
                    fontFamily: B.sans,
                    fontSize: 13,
                    color: "#dc2626",
                    lineHeight: 1.5,
                  }}
                >
                  {actionError}
                </p>
              </div>
            )}
            <button
              style={btnPrimary}
              onClick={handleInquiry}
              disabled={
                actionLoading ||
                !inquiryMsg.trim() ||
                (!isLoggedIn && !guestEmail.trim())
              }
            >
              {actionLoading ? (
                <>
                  <Loader2 size={14} className="spin" /> Sending…
                </>
              ) : (
                "Send Inquiry"
              )}
            </button>
            <button
              onClick={() => {
                setActionError(null);
                setMode("choose");
              }}
              style={{
                marginTop: 10,
                width: "100%",
                background: "none",
                border: "none",
                fontFamily: B.sans,
                fontSize: 13,
                color: B.muted,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {mode === "success" && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <CheckCircle2
              size={40}
              color={B.accent}
              style={{ marginBottom: 14 }}
            />
            <h4
              style={{
                fontFamily: B.serif,
                fontSize: 22,
                fontWeight: 700,
                color: B.text,
                marginBottom: 8,
              }}
            >
              Done!
            </h4>
            <p
              style={{
                fontFamily: B.sans,
                fontSize: 14,
                color: B.muted,
                lineHeight: 1.6,
                marginBottom: 22,
              }}
            >
              {successMsg}
            </p>
            <button style={btnPrimary} onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin .8s linear infinite;display:inline-block}`}</style>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, count, color, subtitle }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 28,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={18} color="#fff" strokeWidth={2} />
          </div>
          <h2
            style={{
              fontFamily: B.serif,
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 700,
              color: B.text,
              lineHeight: 1.1,
            }}
          >
            {title}
          </h2>
        </div>
        {subtitle && (
          <p
            style={{
              fontFamily: B.sans,
              fontSize: 14,
              color: B.muted,
              paddingLeft: 52,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div
        style={{
          background: color,
          color: "#fff",
          fontFamily: B.sans,
          fontSize: 13,
          fontWeight: 700,
          padding: "6px 18px",
          borderRadius: 99,
          letterSpacing: "0.06em",
          alignSelf: "flex-start",
          marginTop: 4,
        }}
      >
        {count} {count === 1 ? "project" : "projects"}
      </div>
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ filters, setFilter, resetFilters, totalCount }) {
  const [keywordInput, setKeywordInput] = useState(filters.keyword);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilter("keyword", keywordInput);
    }, 420);
    return () => clearTimeout(debounceRef.current);
  }, [keywordInput]);

  const selectStyle = {
    border: "none",
    outline: "none",
    width: "100%",
    appearance: "none",
    fontFamily: B.sans,
    fontSize: 13,
    color: B.text,
    background: "transparent",
    cursor: "pointer",
    paddingRight: 20,
  };

  const colLabel = (text) => (
    <div
      style={{
        fontSize: 10,
        fontFamily: B.sans,
        fontWeight: 700,
        color: B.accent,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        marginBottom: 6,
      }}
    >
      {text}
    </div>
  );

  const chevron = (
    <ChevronDown
      size={13}
      style={{
        position: "absolute",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        color: B.accent,
        pointerEvents: "none",
      }}
    />
  );

  return (
    <div
      style={{
        background: B.white,
        borderRadius: 20,
        boxShadow: "0 8px 40px rgba(10,17,114,0.10)",
        overflow: "hidden",
        marginBottom: 48,
        border: "1px solid rgba(212,175,55,0.15)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: B.beige,
          borderBottom: `1px solid rgba(212,175,55,0.20)`,
          padding: "0 24px",
          minHeight: 52,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Building2 size={14} color={B.primary} />
          <span
            style={{
              fontFamily: B.sans,
              fontSize: 11,
              fontWeight: 700,
              color: B.primary,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            All Projects
          </span>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontFamily: B.sans, fontSize: 12, color: B.muted }}>
            {totalCount} {totalCount === 1 ? "project" : "projects"}
          </span>
          <button
            onClick={resetFilters}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: B.accent,
              fontFamily: B.sans,
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 8px",
              borderRadius: 6,
              letterSpacing: "0.06em",
            }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>

      {/* Main filter row */}
      <div
        className="filter-main-row"
        style={{
          display: "flex",
          alignItems: "stretch",
          borderBottom: `1px solid ${B.beige}`,
        }}
      >
        {/* Keyword */}
        <div
          style={{
            flex: 2,
            borderRight: `1px solid ${B.beige}`,
            padding: "16px 20px",
          }}
        >
          {colLabel("Search Projects")}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={14} color={B.accent} />
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Search by name, location…"
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontFamily: B.sans,
                fontSize: 13,
                color: B.text,
                background: "transparent",
              }}
            />
            {keywordInput && (
              <button
                onClick={() => {
                  setKeywordInput("");
                  setFilter("keyword", "");
                }}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: B.muted,
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Location */}
        <div
          style={{
            flex: 1,
            borderRight: `1px solid ${B.beige}`,
            padding: "16px 20px",
          }}
        >
          {colLabel("Location")}
          <div style={{ position: "relative" }}>
            <select
              style={selectStyle}
              value={filters.location}
              onChange={(e) => setFilter("location", e.target.value)}
            >
              {LOCATION_LIST.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            {chevron}
          </div>
        </div>

        {/* Sort */}
        <div
          style={{
            flex: 1,
            borderRight: `1px solid ${B.beige}`,
            padding: "16px 20px",
          }}
        >
          {colLabel("Sort By")}
          <div style={{ position: "relative" }}>
            <select
              style={selectStyle}
              value={filters.sort}
              onChange={(e) => setFilter("sort", e.target.value)}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {chevron}
          </div>
        </div>

        {/* Search CTA */}
        <button
          style={{
            background: B.grad,
            color: B.white,
            border: "none",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: B.sans,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "filter 0.2s",
            minWidth: 120,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(1.15)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          <Search size={15} /> Search
        </button>
      </div>
    </div>
  );
}

// ─── Masonry Section ──────────────────────────────────────────────────────────
function MasonrySection({ items, onAction }) {
  if (!items.length) return null;

  return (
    <div className="masonry-grid">
      {items.map((p, i) => {
        const span = spanPattern[i % spanPattern.length];
        return (
          <ProjectCard
            key={p._id}
            property={p}
            spanCol={span.col}
            spanRow={span.row}
            onAction={onAction}
          />
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Projects() {
  const [heroBg, setHeroBg] = useState(0);
  const [heroOffset, setHeroOffset] = useState(0);
  const [activeProperty, setActiveProperty] = useState(null);
  const heroRef = useRef(null);

  const {
    completed,
    inProgress,
    loading,
    loadingMore,
    error,
    hasMore,
    filters,
    setFilter,
    resetFilters,
    loadMore,
    refetch,
    totalCount,
    completedCount,
    inProgressCount,
  } = useProjects({ limit: 18 });

  /* Hero parallax */
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        const top = heroRef.current.getBoundingClientRect().top;
        setHeroOffset(-top * 0.25);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Hero bg rotation */
  useEffect(() => {
    const t = setInterval(
      () => setHeroBg((b) => (b + 1) % heroBgs.length),
      6000,
    );
    return () => clearInterval(t);
  }, []);

  const hasCompleted = completed.length > 0;
  const hasInProgress = inProgress.length > 0;

  return (
    <div style={{ background: B.white, minHeight: "100vh" }}>
      <style>{`
        @keyframes heroFadeIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }
        .projects-hero-text { animation: heroFadeIn 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 240px;
          gap: 18px;
          margin-bottom: 0;
        }
        @media (max-width: 1024px) {
          .masonry-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 220px; }
          .masonry-grid > * { grid-column: span 1 !important; }
        }
        @media (max-width: 640px) {
          .masonry-grid { grid-template-columns: 1fr; grid-auto-rows: 300px; }
          .masonry-grid > * { grid-column: span 1 !important; grid-row: span 1 !important; }
        }
        @media (max-width: 768px) {
          .filter-main-row { flex-direction: column !important; }
          .filter-main-row > * { border-right: none !important; border-bottom: 1px solid ${B.beige}; }
        }
      `}</style>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          height: "62vh",
          minHeight: 460,
          overflow: "hidden",
        }}
      >
        {heroBgs.map((bg, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              opacity: i === heroBg ? 1 : 0,
              transition: "opacity 1.2s ease",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: `translateY(${heroOffset}px) scale(1.1)`,
                willChange: "transform",
              }}
            />
          </div>
        ))}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(110deg, rgba(10,17,114,0.80) 0%, rgba(26,58,92,0.58) 45%, rgba(10,17,114,0.20) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 60% 70% at 8% 100%, rgba(212,175,55,0.22) 0%, transparent 65%)",
          }}
        />

        {/* Hero text */}
        <div
          className="projects-hero-text"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: "clamp(2rem, 8vw, 8rem)",
            paddingRight: "clamp(2rem, 8vw, 8rem)",
          }}
        >
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontFamily: B.sans,
                fontSize: 11,
                color: "rgba(212,175,55,0.7)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Home
            </span>
            <span style={{ color: "rgba(212,175,55,0.4)", fontSize: 12 }}>
              ›
            </span>
            <span
              style={{
                fontFamily: B.sans,
                fontSize: 11,
                color: B.accent,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Projects
            </span>
          </div>

          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 2,
                background: B.accent,
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily: B.sans,
                fontSize: 11,
                color: "rgba(212,175,55,0.85)",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
              }}
            >
              Splendor Holdings
            </span>
          </div>

          <h1
            style={{
              fontFamily: B.serif,
              fontSize: "clamp(2.6rem, 5.5vw, 5rem)",
              fontWeight: 700,
              color: B.white,
              lineHeight: 1.08,
              marginBottom: 16,
              textShadow: "0 4px 32px rgba(10,17,114,0.4)",
            }}
          >
            Our Projects
          </h1>

          <p
            style={{
              fontFamily: B.serif,
              fontSize: "clamp(1rem, 1.8vw, 1.35rem)",
              fontStyle: "italic",
              color: "rgba(212,175,55,0.90)",
              maxWidth: 520,
              lineHeight: 1.7,
              textShadow: "0 2px 16px rgba(10,17,114,0.3)",
            }}
          >
            Landmark developments shaping Kenya's skyline — from completed
            masterpieces to bold works in progress
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 32,
              flexWrap: "wrap",
            }}
          >
            {[
              {
                num: String(totalCount),
                label: "Total Projects",
                icon: Building2,
              },
              {
                num: String(completedCount),
                label: "Completed",
                icon: CheckCheck,
              },
              {
                num: String(inProgressCount),
                label: "In Progress",
                icon: TrendingUp,
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                {i > 0 && (
                  <div
                    style={{
                      width: 1,
                      height: 32,
                      background: "rgba(212,175,55,0.35)",
                    }}
                  />
                )}
                <div>
                  <div
                    style={{
                      fontFamily: B.serif,
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: B.white,
                      lineHeight: 1,
                    }}
                  >
                    {loading ? "—" : s.num}
                  </div>
                  <div
                    style={{
                      fontFamily: B.sans,
                      fontSize: 10,
                      color: "rgba(212,175,55,0.75)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginTop: 3,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide dots */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
          }}
        >
          {heroBgs.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === heroBg ? 24 : 7,
                height: 7,
                borderRadius: 99,
                background: i === heroBg ? B.accent : "rgba(255,255,255,0.35)",
                transition: "all 0.4s ease",
              }}
            />
          ))}
        </div>
      </section>

      {/* ── Content ── */}
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem)",
        }}
      >
        {/* Sticky filter */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            paddingTop: 24,
            paddingBottom: 8,
            background: B.white,
          }}
        >
          <FilterBar
            filters={filters}
            setFilter={setFilter}
            resetFilters={resetFilters}
            totalCount={totalCount}
          />
        </div>

        {/* Error */}
        {error && !loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <AlertCircle
              size={32}
              color="#dc2626"
              style={{ marginBottom: 12 }}
            />
            <p
              style={{
                fontFamily: B.sans,
                color: "#dc2626",
                fontSize: 15,
                marginBottom: 16,
              }}
            >
              {error}
            </p>
            <button
              onClick={refetch}
              style={{
                padding: "10px 28px",
                borderRadius: 99,
                border: `2px solid ${B.text}`,
                background: "transparent",
                fontFamily: B.sans,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                color: B.text,
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!error &&
          !loading &&
          completed.length === 0 &&
          inProgress.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Building2
                size={48}
                color={B.accent}
                style={{ marginBottom: 16, opacity: 0.5 }}
              />
              <div
                style={{
                  fontFamily: B.serif,
                  fontSize: "2rem",
                  color: B.accent,
                  marginBottom: 12,
                }}
              >
                No projects found
              </div>
              <p
                style={{
                  fontFamily: B.sans,
                  color: B.muted,
                  fontSize: 14,
                  marginBottom: 20,
                }}
              >
                Try adjusting your filters above
              </p>
              <button
                onClick={resetFilters}
                style={{
                  padding: "10px 28px",
                  borderRadius: 99,
                  border: "none",
                  background: B.grad,
                  color: B.white,
                  fontFamily: B.sans,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <RotateCcw size={13} /> Reset Filters
              </button>
            </div>
          )}

        {/* Loading skeletons */}
        {!error && loading && (
          <div className="masonry-grid">
            {Array.from({ length: 9 }).map((_, i) => {
              const span = spanPattern[i % spanPattern.length];
              return (
                <SkeletonCard key={i} spanCol={span.col} spanRow={span.row} />
              );
            })}
          </div>
        )}

        {/* ── Completed Projects Section ── */}
        {!error && !loading && hasCompleted && (
          <section style={{ marginBottom: 72 }}>
            <SectionHeader
              icon={CheckCheck}
              title="Completed Projects"
              count={completedCount}
              color={B.completedBadge}
              subtitle="Delivered developments ready for handover or occupancy"
            />
            <MasonrySection items={completed} onAction={setActiveProperty} />
          </section>
        )}

        {/* Divider between sections */}
        {!error && !loading && hasCompleted && hasInProgress && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 64,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${B.beige})`,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                border: `1px solid ${B.beige}`,
                borderRadius: 99,
                background: B.white,
              }}
            >
              <TrendingUp size={13} color={B.accent} />
              <span
                style={{
                  fontFamily: B.sans,
                  fontSize: 11,
                  color: B.muted,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Active Developments
              </span>
            </div>
            <div
              style={{
                flex: 1,
                height: 1,
                background: `linear-gradient(90deg, ${B.beige}, transparent)`,
              }}
            />
          </div>
        )}

        {/* ── In Progress Section ── */}
        {!error && !loading && hasInProgress && (
          <section style={{ marginBottom: 64 }}>
            <SectionHeader
              icon={Clock}
              title="Projects In Progress"
              count={inProgressCount}
              color={B.inProgressBadge}
              subtitle="Exciting developments currently under construction"
            />
            <MasonrySection items={inProgress} onAction={setActiveProperty} />
          </section>
        )}

        {/* Load More */}
        {!error && !loading && (hasMore || loadingMore) && (
          <div style={{ textAlign: "center", marginTop: 64 }}>
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: B.sans,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "16px 48px",
                borderRadius: 99,
                background: loadingMore ? B.beige : "transparent",
                border: `2px solid ${B.primary}`,
                color: B.primary,
                cursor: loadingMore ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (!loadingMore) {
                  e.currentTarget.style.background = B.primary;
                  e.currentTarget.style.color = B.white;
                }
              }}
              onMouseLeave={(e) => {
                if (!loadingMore) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = B.primary;
                }
              }}
            >
              {loadingMore ? (
                <>
                  <Loader2 size={14} className="spin" /> Loading…
                </>
              ) : (
                "Load More Projects"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Action modal */}
      {activeProperty && (
        <ActionModal
          property={activeProperty}
          onClose={() => setActiveProperty(null)}
        />
      )}
    </div>
  );
}
