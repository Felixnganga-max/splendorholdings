import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  MapPin,
  Maximize2,
  Star,
  X,
  ChevronDown,
  AlertCircle,
  Loader2,
  RotateCcw,
  TreePine,
  Ruler,
} from "lucide-react";

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
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
  landAccent: "#4a7c59",
  landGrad: "linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const heroBgs = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
];

const SORT_OPTIONS = [
  "Newest First",
  "Price: Low → High",
  "Price: High → Low",
  "Area: Small → Large",
  "Area: Large → Small",
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

const LAND_UNIT_LABELS = ["All Units", "acres", "hectares", "sqm", "sqft"];

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

const API_BASE = "https://splendorholdings-2v47.vercel.app";

const SORT_MAP = {
  "Newest First": "-createdAt",
  "Price: Low → High": "pricing.original",
  "Price: High → Low": "-pricing.original",
  "Area: Small → Large": "area",
  "Area: Large → Small": "-area",
  "Featured First": "-isFeatured -createdAt",
};

// ─── API fetch ────────────────────────────────────────────────────────────────
async function apiFetch(path) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

function formatLandArea(landArea) {
  if (!landArea?.value) return null;
  const { value, unit } = landArea;
  const display = Number.isInteger(value) ? value : value.toFixed(2);
  return `${display} ${unit}`;
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

// ─── Land Card ────────────────────────────────────────────────────────────────
function LandCard({ property, spanCol, spanRow, onClick }) {
  const [liked, setLiked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const img = getPrimaryImage(property);
  const price = formatPrice(property);
  const landArea = formatLandArea(property.landArea);
  const isSoldOut = property.isSoldOut ?? false;
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
        cursor: isSoldOut ? "default" : "pointer",
        background: B.beige,
        minHeight: isTall ? 500 : 260,
        boxShadow: "0 4px 20px rgba(10,17,114,0.08)",
        transition:
          "transform 0.4s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.4s ease",
        opacity: isSoldOut ? 0.75 : 1,
      }}
      onClick={() => !isSoldOut && onClick(property._id)}
      onMouseEnter={(e) => {
        if (!isSoldOut) {
          e.currentTarget.style.transform = "translateY(-6px) scale(1.013)";
          e.currentTarget.style.boxShadow = "0 28px 64px rgba(10,17,114,0.20)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(10,17,114,0.08)";
      }}
    >
      {/* Image */}
      {img ? (
        <img
          src={img}
          alt={property.location}
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
            background: "linear-gradient(135deg, #2d5a3d22, #4a7c5922)",
          }}
        >
          <TreePine size={32} color={B.landAccent} strokeWidth={1.5} />
          <span
            style={{ color: B.landAccent, fontSize: 12, fontFamily: B.sans }}
          >
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
            "linear-gradient(180deg, rgba(10,17,114,0.06) 0%, rgba(10,17,114,0.72) 100%)",
        }}
      />

      {/* Sold Out overlay */}
      {isSoldOut && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10,17,114,0.48)",
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

      {/* Badges */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          display: "flex",
          gap: 6,
          zIndex: 2,
        }}
      >
        <span
          style={{
            background: B.landGrad,
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
          {property.badge ?? "Land"}
        </span>
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
          {property.type ?? "Land"}
        </span>
      </div>

      {/* Rating */}
      {property.rating != null && property.rating > 0 && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 60,
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
            {property.rating}
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
        {/* Name */}
        <div
          style={{
            fontFamily: B.serif,
            fontSize: isTall ? 18 : 15,
            fontWeight: 600,
            color: "#fff",
            marginBottom: 6,
            lineHeight: 1.2,
            textShadow: "0 1px 8px rgba(0,0,0,0.4)",
          }}
        >
          {property.name}
        </div>

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
              color: "rgba(255,255,255,0.90)",
              fontFamily: B.sans,
              fontWeight: 400,
              letterSpacing: "0.02em",
            }}
          >
            {property.location}
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
          {/* Land specs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {landArea && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Ruler
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
                  {landArea}
                </span>
              </div>
            )}
            {property.area > 0 && (
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
                  {property.area} m²
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
              {price}
            </span>
          </div>
        </div>
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

  const intentTabs = [
    { label: "All", value: "" },
    { label: "For Sale", value: "sale" },
    { label: "For Lease", value: "rent" },
  ];

  return (
    <div
      style={{
        background: B.white,
        borderRadius: 20,
        boxShadow: "0 8px 40px rgba(10,17,114,0.10)",
        overflow: "hidden",
        marginBottom: 40,
        border: "1px solid rgba(212,175,55,0.15)",
      }}
    >
      {/* Intent tabs */}
      <div
        style={{
          display: "flex",
          background: B.beige,
          borderBottom: `1px solid rgba(212,175,55,0.20)`,
          padding: "0 24px",
          flexWrap: "wrap",
        }}
      >
        {intentTabs.map(({ label, value }) => {
          const isActive = filters.listingIntent === value;
          return (
            <button
              key={label}
              onClick={() => setFilter("listingIntent", value)}
              style={{
                fontFamily: B.sans,
                fontSize: 11,
                fontWeight: 700,
                padding: "14px 20px",
                color: isActive ? B.primary : B.muted,
                background: "transparent",
                border: "none",
                borderBottom: isActive
                  ? `2px solid ${B.primary}`
                  : "2px solid transparent",
                cursor: "pointer",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                transition: "color 0.2s",
              }}
            >
              {label}
            </button>
          );
        })}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontFamily: B.sans, fontSize: 12, color: B.muted }}>
            {totalCount} {totalCount === 1 ? "plot" : "plots"}
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
          {colLabel("Keyword")}
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

        {/* Land unit filter */}
        <div
          style={{
            flex: 1,
            borderRight: `1px solid ${B.beige}`,
            padding: "16px 20px",
          }}
        >
          {colLabel("Unit")}
          <div style={{ position: "relative" }}>
            <select
              style={selectStyle}
              value={filters.landUnit || "All Units"}
              onChange={(e) =>
                setFilter(
                  "landUnit",
                  e.target.value === "All Units" ? "" : e.target.value,
                )
              }
            >
              {LAND_UNIT_LABELS.map((u) => (
                <option key={u}>{u}</option>
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
            background: B.landGrad,
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

      {/* Price range row */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "14px 24px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: B.sans,
            fontSize: 10,
            color: B.accent,
            marginRight: 4,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            fontWeight: 700,
          }}
        >
          Price:
        </span>
        {[
          { label: "Any", min: "", max: "" },
          { label: "Under 5M", min: "", max: "5000000" },
          { label: "5M – 20M", min: "5000000", max: "20000000" },
          { label: "20M – 50M", min: "20000000", max: "50000000" },
          { label: "50M+", min: "50000000", max: "" },
        ].map(({ label, min, max }) => {
          const isActive = filters.minPrice === min && filters.maxPrice === max;
          return (
            <button
              key={label}
              onClick={() => {
                setFilter("minPrice", min);
                setFilter("maxPrice", max);
              }}
              style={{
                fontFamily: B.sans,
                fontSize: 12,
                fontWeight: isActive ? 700 : 400,
                padding: "6px 16px",
                borderRadius: 99,
                border: isActive ? "none" : `1.5px solid rgba(212,175,55,0.40)`,
                background: isActive ? B.landGrad : "transparent",
                color: isActive ? B.white : B.muted,
                cursor: "pointer",
                transition: "all 0.22s",
                boxShadow: isActive ? "0 4px 16px rgba(45,90,61,0.25)" : "none",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── useLandListings hook ─────────────────────────────────────────────────────
function useLandListings(limit = 12) {
  const DEFAULT_FILTERS = {
    keyword: "",
    location: "All Locations",
    sort: "Newest First",
    listingIntent: "",
    landUnit: "",
    minPrice: "",
    maxPrice: "",
  };

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [allProperties, setAllProperties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const isAppend = useRef(false);

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
    isAppend.current = false;
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    isAppend.current = false;
    setTick((n) => n + 1);
  };

  const loadMore = () => {
    if (!pagination || page >= pagination.pages) return;
    isAppend.current = true;
    setPage((p) => p + 1);
  };

  const refetch = () => {
    setPage(1);
    isAppend.current = false;
    setTick((n) => n + 1);
  };

  // In the useLandListings hook inside Lands.jsx, update the useEffect:

  useEffect(() => {
    let cancelled = false;
    if (!isAppend.current) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort: SORT_MAP[filters.sort] ?? "-createdAt",
    });

    // 🔴 Only fetch Land type
    params.set("type", "Land");

    // Also include "land" lowercase just in case
    // params.set("type", "Land,land");

    if (filters.keyword.trim()) params.set("search", filters.keyword.trim());
    if (filters.listingIntent)
      params.set("listingIntent", filters.listingIntent);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

    console.log("Fetching lands with params:", params.toString());

    apiFetch(`/api/v1/properties?${params.toString()}`)
      .then((json) => {
        if (cancelled) return;
        let incoming = json.data?.properties ?? [];

        // 🔴 Double-check filter client-side
        incoming = incoming.filter(
          (prop) => prop.type === "Land" || prop.type === "land",
        );

        console.log(`Found ${incoming.length} land properties`);

        setAllProperties((prev) =>
          isAppend.current ? [...prev, ...incoming] : incoming,
        );
        setPagination(json.pagination ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching lands:", err);
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
    filters.keyword,
    filters.sort,
    filters.listingIntent,
    filters.minPrice,
    filters.maxPrice,
    page,
    limit,
    tick,
  ]);

  // Client-side location filter
  const properties =
    filters.location === "All Locations"
      ? allProperties
      : allProperties.filter((p) =>
          p.location?.toLowerCase().includes(filters.location.toLowerCase()),
        );

  // Client-side land unit filter
  const filteredProperties = filters.landUnit
    ? properties.filter((p) => p.landArea?.unit === filters.landUnit)
    : properties;

  return {
    properties: filteredProperties,
    loading,
    loadingMore,
    error,
    hasMore: pagination ? page < pagination.pages : false,
    filters,
    setFilter,
    resetFilters,
    loadMore,
    refetch,
    totalCount: pagination?.total ?? filteredProperties.length,
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Lands() {
  const navigate = useNavigate();
  const [heroBg, setHeroBg] = useState(0);
  const [heroOffset, setHeroOffset] = useState(0);
  const heroRef = useRef(null);

  const {
    properties,
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
  } = useLandListings(12);

  // Hero parallax
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

  // Hero bg rotation
  useEffect(() => {
    const t = setInterval(
      () => setHeroBg((b) => (b + 1) % heroBgs.length),
      6000,
    );
    return () => clearInterval(t);
  }, []);

  const handleCardClick = (id) => {
    navigate(`/lands/${id}`);
  };

  return (
    <div style={{ background: B.white, minHeight: "100vh" }}>
      <style>{`
        @keyframes heroFadeIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }
        .lands-hero-text { animation: heroFadeIn 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 240px;
          gap: 18px;
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
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{animation:spin .8s linear infinite;display:inline-block}
      `}</style>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          height: "60vh",
          minHeight: 440,
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
              "linear-gradient(110deg, rgba(45,90,61,0.78) 0%, rgba(74,124,89,0.52) 45%, rgba(45,90,61,0.20) 100%)",
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

        <div
          className="lands-hero-text"
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
            {["Home", "Properties", "Land & Plots"].map((crumb, i, arr) => (
              <span
                key={crumb}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <span
                  style={{
                    fontFamily: B.sans,
                    fontSize: 11,
                    color:
                      i === arr.length - 1 ? B.accent : "rgba(212,175,55,0.7)",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  {crumb}
                </span>
                {i < arr.length - 1 && (
                  <span style={{ color: "rgba(212,175,55,0.4)", fontSize: 12 }}>
                    ›
                  </span>
                )}
              </span>
            ))}
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
            Land &amp; Plots
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
            Prime parcels, titled plots, and development land across Kenya's
            fastest-growing counties
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            {[
              { num: String(totalCount), label: "Available Plots" },
              { num: "7", label: "Counties" },
              { num: "Titled", label: "Guaranteed" },
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
                    {s.num}
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

      {/* ── Filter + Grid ── */}
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem)",
        }}
      >
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
        {!error && !loading && properties.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <TreePine
              size={48}
              color={B.landAccent}
              strokeWidth={1.2}
              style={{ marginBottom: 16 }}
            />
            <div
              style={{
                fontFamily: B.serif,
                fontSize: "2rem",
                color: B.accent,
                marginBottom: 12,
              }}
            >
              No plots found
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
                background: B.landGrad,
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

        {/* Masonry grid */}
        {!error && (loading || properties.length > 0) && (
          <div className="masonry-grid">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => {
                  const span = spanPattern[i % spanPattern.length];
                  return (
                    <SkeletonCard
                      key={i}
                      spanCol={span.col}
                      spanRow={span.row}
                    />
                  );
                })
              : properties.map((p, i) => {
                  const span = spanPattern[i % spanPattern.length];
                  return (
                    <LandCard
                      key={p._id}
                      property={p}
                      spanCol={span.col}
                      spanRow={span.row}
                      onClick={handleCardClick}
                    />
                  );
                })}
          </div>
        )}

        {/* Load more */}
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
                "Load More Plots"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
