import { useState, useEffect, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Star,
  X,
  ChevronDown,
  Grid,
  List,
} from "lucide-react";
import { properties, tabs } from "../lib/data";

/* ── Fonts ── */
if (!document.querySelector("#slendor-fonts-listings")) {
  const l = document.createElement("link");
  l.id = "slendor-fonts-listings";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

/* ── Hero bg images (rotate) ── */
const heroBgs = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
];

const sortOptions = [
  "Newest First",
  "Price: Low → High",
  "Price: High → Low",
  "Top Rated",
];
const locationList = [
  "All Locations",
  "Nairobi",
  "Mombasa",
  "Kiambu",
  "Kajiado",
  "Machakos",
  "Kisumu",
];
const statusList = [
  "Any Status",
  "For Sale",
  "For Rent",
  "Off-Plan",
  "Ready to Build",
];

/* ── Masonry span pattern (repeating over the grid) ── */
// col / row spans for a 3-col CSS grid — gives the Unsplash "puzzle" feel
const spanPattern = [
  { col: 1, row: 2 }, // tall
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 1 }, // wide
  { col: 1, row: 1 },
  { col: 1, row: 2 }, // tall
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 1, row: 1 },
];

/* ─────────────────────────────────────
   LISTING CARD
───────────────────────────────────── */
function ListingCard({ p, spanCol, spanRow }) {
  const [liked, setLiked] = useState(false);
  const [loaded, setLoaded] = useState(false);
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
        background: "#f0e8de",
        minHeight: isTall ? 500 : 260,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        transition:
          "transform 0.4s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.4s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.013)";
        e.currentTarget.style.boxShadow = "0 28px 64px rgba(0,0,0,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
      }}
    >
      {/* ── Image ── */}
      <img
        src={p.imgs[0]}
        alt={p.name}
        onLoad={() => setLoaded(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.5s ease, transform 0.6s ease",
        }}
      />

      {/* ── Gradient overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(10,4,0,0.70) 100%)",
        }}
      />

      {/* ── Badge top-left ── */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          display: "flex",
          gap: 6,
        }}
      >
        <span
          style={{
            background: p.badgeColor,
            color: "#fff",
            fontSize: 10,
            fontWeight: 600,
            padding: "4px 11px",
            borderRadius: 99,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'Jost', sans-serif",
          }}
        >
          {p.badge}
        </span>
        <span
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.28)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 500,
            padding: "4px 11px",
            borderRadius: 99,
            fontFamily: "'Jost', sans-serif",
          }}
        >
          {p.type}
        </span>
      </div>

      {/* ── Heart top-right ── */}
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

      {/* ── Rating pill ── */}
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
        }}
      >
        <Star size={11} fill="#F59E0B" color="#F59E0B" />
        <span
          style={{
            color: "#fff",
            fontSize: 11,
            fontFamily: "'Jost', sans-serif",
            fontWeight: 500,
          }}
        >
          {p.rating}
        </span>
      </div>

      {/* ── Bottom info ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px 20px 18px",
        }}
      >
        {/* Name */}
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: isWide || isTall ? 22 : 18,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 5,
            lineHeight: 1.2,
            textShadow: "0 2px 12px rgba(0,0,0,0.4)",
          }}
        >
          {p.name}
        </h3>

        {/* Location */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginBottom: 12,
          }}
        >
          <MapPin size={11} color="#fde68a" strokeWidth={2} />
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,240,210,0.85)",
              fontFamily: "'Jost', sans-serif",
            }}
          >
            {p.location}
          </span>
        </div>

        {/* Specs + Price row */}
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
                <Bed
                  size={12}
                  color="rgba(255,220,160,0.85)"
                  strokeWidth={1.8}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,235,200,0.9)",
                    fontFamily: "'Jost', sans-serif",
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
                  color="rgba(255,220,160,0.85)"
                  strokeWidth={1.8}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,235,200,0.9)",
                    fontFamily: "'Jost', sans-serif",
                  }}
                >
                  {p.baths} Baths
                </span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Maximize2
                size={11}
                color="rgba(255,220,160,0.85)"
                strokeWidth={1.8}
              />
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,235,200,0.9)",
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                {p.area} m²
              </span>
            </div>
          </div>

          {/* Price */}
          <div
            style={{
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 99,
              padding: "5px 14px",
            }}
          >
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 16,
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

/* ─────────────────────────────────────
   FILTER BAR
───────────────────────────────────── */
function FilterBar({
  keyword,
  setKeyword,
  activeTab,
  setActiveTab,
  location,
  setLocation,
  status,
  setStatus,
  sort,
  setSort,
  showAdvanced,
  setShowAdvanced,
  total,
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        overflow: "hidden",
        marginBottom: 40,
      }}
    >
      {/* ── Mode tabs: For Rent / For Sale ── */}
      <div
        style={{
          display: "flex",
          background: "#faf8f5",
          borderBottom: "1px solid #f0e8df",
          padding: "0 24px",
        }}
      >
        {["For Sale", "For Rent", "Off-Plan"].map((t, i) => (
          <button
            key={t}
            onClick={() => setStatus(i === 0 ? "Any Status" : t)}
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              padding: "14px 20px",
              color:
                (i === 0 && status === "Any Status") || status === t
                  ? "#7B2D8B"
                  : "#9ca3af",
              borderBottom:
                (i === 0 && status === "Any Status") || status === t
                  ? "2px solid #7B2D8B"
                  : "2px solid transparent",
              background: "transparent",
              border: "none",
              borderBottom:
                (i === 0 && status === "Any Status") || status === t
                  ? "2px solid #7B2D8B"
                  : "2px solid transparent",
              cursor: "pointer",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "color 0.2s",
            }}
          >
            {t}
          </button>
        ))}
        {/* Results count right */}
        <div
          style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}
        >
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 12,
              color: "#b8a090",
              fontWeight: 400,
            }}
          >
            {total} properties found
          </span>
        </div>
      </div>

      {/* ── Main filter row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          borderBottom: "1px solid #f5ede6",
        }}
      >
        {/* Keyword */}
        <div
          style={{
            flex: 2,
            borderRight: "1px solid #f5ede6",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontFamily: "'Jost', sans-serif",
              fontWeight: 600,
              color: "#b8a090",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Keyword
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={14} color="#c2884a" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by name, location…"
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontFamily: "'Jost', sans-serif",
                fontSize: 13,
                color: "#3d2c1a",
                background: "transparent",
              }}
            />
            {keyword && (
              <button
                onClick={() => setKeyword("")}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#b8a090",
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
            borderRight: "1px solid #f5ede6",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontFamily: "'Jost', sans-serif",
              fontWeight: 600,
              color: "#b8a090",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Location
          </div>
          <div style={{ position: "relative" }}>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                appearance: "none",
                fontFamily: "'Jost', sans-serif",
                fontSize: 13,
                color: "#3d2c1a",
                background: "transparent",
                cursor: "pointer",
                paddingRight: 20,
              }}
            >
              {locationList.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <ChevronDown
              size={13}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#c2884a",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Type */}
        <div
          style={{
            flex: 1,
            borderRight: "1px solid #f5ede6",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontFamily: "'Jost', sans-serif",
              fontWeight: 600,
              color: "#b8a090",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Type
          </div>
          <div style={{ position: "relative" }}>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                appearance: "none",
                fontFamily: "'Jost', sans-serif",
                fontSize: 13,
                color: "#3d2c1a",
                background: "transparent",
                cursor: "pointer",
                paddingRight: 20,
              }}
            >
              {tabs.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown
              size={13}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#c2884a",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Sort */}
        <div
          style={{
            flex: 1,
            borderRight: "1px solid #f5ede6",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontFamily: "'Jost', sans-serif",
              fontWeight: 600,
              color: "#b8a090",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Sort By
          </div>
          <div style={{ position: "relative" }}>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                appearance: "none",
                fontFamily: "'Jost', sans-serif",
                fontSize: 13,
                color: "#3d2c1a",
                background: "transparent",
                cursor: "pointer",
                paddingRight: 20,
              }}
            >
              {sortOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown
              size={13}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#c2884a",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Search CTA */}
        <button
          style={{
            background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
            color: "#fff",
            border: "none",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "'Jost', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "filter 0.2s",
            minWidth: 130,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(1.15)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          <Search size={15} />
          Search
        </button>
      </div>

      {/* ── Type pill tabs ── */}
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
            fontFamily: "'Jost', sans-serif",
            fontSize: 11,
            color: "#b8a090",
            marginRight: 4,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Filter:
        </span>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 12,
              fontWeight: t === activeTab ? 600 : 400,
              padding: "6px 16px",
              borderRadius: 99,
              border: t === activeTab ? "none" : "1.5px solid #e8ddd2",
              background:
                t === activeTab
                  ? "linear-gradient(135deg, #7B2D8B, #4A1060)"
                  : "#fff",
              color: t === activeTab ? "#fff" : "#7a6555",
              cursor: "pointer",
              transition: "all 0.22s",
              boxShadow:
                t === activeTab ? "0 4px 16px rgba(123,45,139,0.25)" : "none",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
export default function Listings() {
  const [heroBg, setHeroBg] = useState(0);
  const [heroOffset, setHeroOffset] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("View All");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus] = useState("Any Status");
  const [sort, setSort] = useState("Newest First");
  const heroRef = useRef(null);

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

  /* Filter + sort */
  const filtered = properties
    .filter((p) => {
      const kw = keyword.toLowerCase();
      const matchKw =
        !kw ||
        p.name.toLowerCase().includes(kw) ||
        p.location.toLowerCase().includes(kw);
      const matchTab = activeTab === "View All" || p.type === activeTab;
      const matchLoc =
        location === "All Locations" ||
        p.location.toLowerCase().includes(location.toLowerCase());
      const matchStatus =
        status === "Any Status" || p.status === status || p.badge === status;
      return matchKw && matchTab && matchLoc && matchStatus;
    })
    .sort((a, b) => {
      if (sort === "Price: Low → High")
        return (
          a.price.replace(/[^0-9.]/g, "") - b.price.replace(/[^0-9.]/g, "")
        );
      if (sort === "Price: High → Low")
        return (
          b.price.replace(/[^0-9.]/g, "") - a.price.replace(/[^0-9.]/g, "")
        );
      if (sort === "Top Rated") return b.rating - a.rating;
      return b.id - a.id; // Newest First
    });

  return (
    <div style={{ background: "#fdf8f3", minHeight: "100vh" }}>
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .listings-hero-text { animation: heroFadeIn 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }

        /* Masonry grid */
        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 240px;
          gap: 18px;
        }
        @media (max-width: 1024px) {
          .masonry-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-auto-rows: 220px;
          }
          /* Reset wide spans on tablet */
          .masonry-grid > * { grid-column: span 1 !important; }
        }
        @media (max-width: 640px) {
          .masonry-grid {
            grid-template-columns: 1fr;
            grid-auto-rows: 300px;
          }
          .masonry-grid > * {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }

        /* Filter bar responsive */
        @media (max-width: 768px) {
          .filter-main-row { flex-direction: column !important; }
          .filter-main-row > * { border-right: none !important; border-bottom: 1px solid #f5ede6; }
        }
      `}</style>

      {/* ══════════════════════════════
          60VH HERO
      ══════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          height: "60vh",
          minHeight: 440,
          overflow: "hidden",
        }}
      >
        {/* Parallax slides */}
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

        {/* Warm overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(110deg, rgba(15,6,0,0.78) 0%, rgba(55,22,3,0.55) 45%, rgba(5,3,0,0.20) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 60% 70% at 8% 100%, rgba(160,80,5,0.28) 0%, transparent 65%)",
          }}
        />

        {/* Hero text */}
        <div
          className="listings-hero-text"
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
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                color: "rgba(255,220,150,0.7)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Home
            </span>
            <span style={{ color: "rgba(255,220,150,0.4)", fontSize: 12 }}>
              ›
            </span>
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                color: "#F59E0B",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              All Listings
            </span>
          </div>

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
                background: "#F59E0B",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 11,
                color: "#fde68a",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
              }}
            >
              Slendor Holdings
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.6rem, 5.5vw, 5rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.08,
              marginBottom: 16,
              textShadow: "0 4px 32px rgba(0,0,0,0.5)",
            }}
          >
            All Properties
          </h1>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1rem, 1.8vw, 1.35rem)",
              fontStyle: "italic",
              color: "#fde68a",
              maxWidth: 480,
              lineHeight: 1.7,
              textShadow: "0 2px 16px rgba(0,0,0,0.4)",
            }}
          >
            Browse our curated collection of Kenya's finest homes, villas,
            apartments, and land
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            {[
              { num: `${properties.length}`, label: "Active Listings" },
              { num: "KES 5B+", label: "Properties Sold" },
              { num: "7", label: "Counties" },
            ].map((s, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div
                  style={{
                    width: 1,
                    height: 32,
                    background: "rgba(245,158,11,0.4)",
                    display: i === 0 ? "none" : "block",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1,
                    }}
                  >
                    {s.num}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 10,
                      color: "rgba(255,220,150,0.7)",
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
                background: i === heroBg ? "#F59E0B" : "rgba(255,255,255,0.35)",
                transition: "all 0.4s ease",
              }}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          FILTER + GRID
      ══════════════════════════════ */}
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem)",
        }}
      >
        {/* Sticky filter bar */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            paddingTop: 24,
            paddingBottom: 8,
            background: "#fdf8f3",
          }}
        >
          <FilterBar
            keyword={keyword}
            setKeyword={setKeyword}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            location={location}
            setLocation={setLocation}
            status={status}
            setStatus={setStatus}
            sort={sort}
            setSort={setSort}
            total={filtered.length}
          />
        </div>

        {/* ── Masonry grid ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "2rem",
                color: "#c2884a",
                marginBottom: 12,
              }}
            >
              No properties found
            </div>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                color: "#9a7c5a",
                fontSize: 14,
              }}
            >
              Try adjusting your filters above
            </p>
          </div>
        ) : (
          <div className="masonry-grid">
            {filtered.map((p, i) => {
              const span = spanPattern[i % spanPattern.length];
              return (
                <ListingCard
                  key={p.id}
                  p={p}
                  spanCol={span.col}
                  spanRow={span.row}
                />
              );
            })}
          </div>
        )}

        {/* ── Load more ── */}
        {filtered.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 64 }}>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "16px 48px",
                borderRadius: 99,
                background: "transparent",
                border: "2px solid #1a0f00",
                color: "#1a0f00",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1a0f00";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#1a0f00";
              }}
            >
              Load More Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
