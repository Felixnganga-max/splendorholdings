import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import assets from "../assets/assets";

/* ── Google Fonts ── */
if (!document.head.querySelector('link[href*="Cormorant"]')) {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500&display=swap";
  document.head.appendChild(l);
}

const slides = [
  {
    url: assets.hero,
    headline: "Find Your\nDream Home",
  },
  {
    url: assets.hero1,
    headline: "Luxury Living\nAwaits You",
  },
  {
    url: assets.hero2,
    headline: "Invest in\nYour Future",
  },
  {
    url: assets.hero3,
    headline: "Your Story\nStarts Here",
  },
];

const socials = [
  {
    label: "Call Us",
    bg: "#25A244",
    href: "tel:+254700123456",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="17"
        height="17"
      >
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.2 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    bg: "#0A66C2",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="17" height="17">
        <path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.984V9h3.102v1.561h.046c.432-.817 1.487-1.678 3.061-1.678 3.274 0 3.878 2.155 3.878 4.958v6.611zM5.337 7.433a1.804 1.804 0 110-3.608 1.804 1.804 0 010 3.608zm1.554 13.019H3.783V9h3.108v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    bg: "#1877F2",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="17" height="17">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.931-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    bg: "#010101",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="17" height="17">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.84a8.2 8.2 0 004.79 1.53V6.93a4.85 4.85 0 01-1.02-.24z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    bg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="17" height="17">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    bg: "#14171A",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="17" height="17">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    bg: "#FF0000",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="17" height="17">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const filterOptions = {
  type: ["Apartment", "Villa", "Townhouse", "Land", "Commercial"],
  location: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
  bedrooms: ["Studio", "1 Bed", "2 Beds", "3 Beds", "4+ Beds"],
  price: ["Under 5M", "5M – 15M", "15M – 50M", "50M – 100M", "100M+"],
};

const tabs = ["Buy", "Rent", "Off-Plan", "Commercial"];

function FilterSelect({ placeholder, options, value, onChange }) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          appearance: "none",
          WebkitAppearance: "none",
          background: "transparent",
          border: "none",
          outline: "none",
          padding: "0 28px 0 0",
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.84rem",
          fontWeight: 400,
          color: value ? "#1a1a2e" : "#9ca3af",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        style={{
          position: "absolute",
          right: 2,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#d4af37" /* gold chevron — brand accent */,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [offset, setOffset] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    bedrooms: "",
    price: "",
  });
  const heroRef = useRef(null);

  useEffect(() => {
    const t = setInterval(
      () => setCurrent((c) => (c + 1) % slides.length),
      5500,
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fn = () => {
      if (heroRef.current)
        setOffset(-heroRef.current.getBoundingClientRect().top * 0.28);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const set = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));

  /* shared label style for filter fields */
  const fieldLabel = {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.58rem",
    fontWeight: 500,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#d4af37" /* gold — brand accent on labels */,
    marginBottom: 3,
    display: "block",
  };

  return (
    <>
      <style>{`
        /* ── filter card ── */
        .hfc {
          background: rgba(255,255,255,0.97);
          border-radius: 16px;
          box-shadow: 0 28px 80px rgba(0,0,0,0.42), 0 1px 0 rgba(212,175,55,0.2) inset;
          overflow: hidden;
          max-width: 1060px;
          margin: 0 auto;
          width: 100%;
        }
        .hfc-tabs {
          display: flex;
          background: #f8f6f2;
          border-bottom: 1px solid #ede8dc;
        }
        .hfc-tab {
          font-family: 'Jost', sans-serif;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          padding: 11px 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #9ca3af;
          border-bottom: 2px solid transparent;
          transition: color 0.2s, border-color 0.2s;
        }
        .hfc-tab.on {
          color: #1a1a2e;
          border-bottom: 2px solid #d4af37;   /* gold active tab underline */
        }
        /* desktop row */
        .hfc-row {
          display: flex;
          align-items: stretch;
          min-height: 62px;
        }
        .hfc-cell {
          flex: 1;
          padding: 10px 22px;
          border-right: 1px solid #ede8dc;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        /* search button: brand dark bg, gold text + icon */
        .hfc-search {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 32px;
          background: #1a1a2e;              /* brand --color-text / deep navy */
          border: none;
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #d4af37;                   /* brand gold */
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .hfc-search:hover { background: #0a1172; }  /* primary on hover */
        .hfc-search svg   { color: #d4af37; }

        /* mobile */
        .hfc-mob-bar {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
        }
        .hfc-mob-label {
          font-family: 'Jost', sans-serif;
          font-size: 0.7rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6b7280;
        }
        .hfc-mob-toggle {
          display: flex; align-items: center; gap: 6px;
          font-family: 'Jost', sans-serif;
          font-size: 0.68rem; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #1a1a2e;
          background: transparent;
          border: 1px solid #e5e1d8;
          border-radius: 8px;
          padding: 7px 14px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .hfc-mob-toggle:hover { border-color: #d4af37; }
        .hfc-mob-toggle .icon-gold { color: #d4af37; }   /* gold icons on toggle */

        .hfc-panel {
          display: none;
          flex-direction: column;
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.42s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
          border-top: 1px solid #ede8dc;
        }
        .hfc-panel.open { max-height: 700px; opacity: 1; }
        .hfc-mob-field {
          padding: 14px 20px;
          border-bottom: 1px solid #f3f0ea;
          display: flex; flex-direction: column; gap: 5px;
        }
        .hfc-mob-sbtn-wrap { padding: 16px 20px 20px; }
        .hfc-mob-sbtn { width: 100%; border-radius: 10px; height: 48px; }

        @media (max-width: 820px) {
          .hfc-row      { display: none  !important; }
          .hfc-mob-bar  { display: flex  !important; }
          .hfc-panel    { display: flex  !important; }
        }
      `}</style>

      {/* ══════════════════════════
          HERO
      ══════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          minHeight: 700,
          overflow: "hidden",
        }}
      >
        {/* Carousel images — they ARE the hero */}
        {slides.map((slide, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              opacity: i === current ? 1 : 0,
              transition: "opacity 1.1s ease",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${slide.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: `translateY(${offset}px) scale(1.1)`,
                willChange: "transform",
              }}
            />
          </div>
        ))}

        {/* Minimal overlay — dark left wedge, photo dominant on right */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(108deg, rgba(8,8,18,0.76) 0%, rgba(8,8,18,0.48) 42%, rgba(0,0,0,0.08) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 55% 45% at 6% 96%, rgba(120,60,0,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Text block */}
        <div
          style={{
            position: "absolute",
            zIndex: 20,
            top: 0,
            bottom: 155,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: "clamp(2rem,8vw,9rem)",
            paddingRight: "clamp(2rem,8vw,9rem)",
          }}
        >
          <div style={{ maxWidth: 600 }}>
            {/* slide headlines */}
            <div style={{ position: "relative", minHeight: 200 }}>
              {slides.map((slide, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    opacity: i === current ? 1 : 0,
                    transform:
                      i === current ? "translateY(0)" : "translateY(18px)",
                    transition: "opacity 0.85s ease, transform 0.85s ease",
                    pointerEvents: i === current ? "auto" : "none",
                  }}
                >
                  <h1
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(2.9rem,5.6vw,5.2rem)",
                      fontWeight: 700,
                      color: "#fafaf8",
                      lineHeight: 1.07,
                      whiteSpace: "pre-line",
                      marginBottom: 16,
                      textShadow: "0 4px 36px rgba(0,0,0,0.5)",
                    }}
                  >
                    {slide.headline}
                  </h1>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      fontSize: "clamp(0.98rem,1.6vw,1.3rem)",
                      color:
                        "rgba(212,175,55,0.88)" /* gold sub — brand accent */,
                      letterSpacing: "0.02em",
                      textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                    }}
                  >
                    {slide.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* carousel dots — gold active */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginTop: 22,
              }}
            >
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  style={{
                    width: i === current ? 28 : 7,
                    height: 7,
                    borderRadius: 99,
                    background:
                      i === current ? "#d4af37" : "rgba(255,255,255,0.26)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.4s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Filter card */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 28,
            zIndex: 30,
            paddingLeft: "clamp(1rem,5vw,6rem)",
            paddingRight: "clamp(1rem,5vw,6rem)",
          }}
        >
          <div className="hfc">
            {/* Tabs — gold underline on active */}
            <div className="hfc-tabs">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  className={`hfc-tab${activeTab === i ? " on" : ""}`}
                  onClick={() => setActiveTab(i)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Desktop filter row */}
            <div className="hfc-row">
              {[
                {
                  key: "type",
                  label: "Property Type",
                  opts: filterOptions.type,
                  ph: "Any type",
                },
                {
                  key: "location",
                  label: "Location",
                  opts: filterOptions.location,
                  ph: "Any location",
                },
                {
                  key: "bedrooms",
                  label: "Bedrooms",
                  opts: filterOptions.bedrooms,
                  ph: "Any",
                },
                {
                  key: "price",
                  label: "Price Range",
                  opts: filterOptions.price,
                  ph: "Any budget",
                },
              ].map((f, idx, arr) => (
                <div
                  key={f.key}
                  className="hfc-cell"
                  style={{
                    borderRight:
                      idx < arr.length - 1
                        ? "1px solid #ede8dc"
                        : "1px solid #ede8dc",
                  }}
                >
                  <span style={fieldLabel}>{f.label}</span>
                  <FilterSelect
                    placeholder={f.ph}
                    options={f.opts}
                    value={filters[f.key]}
                    onChange={set(f.key)}
                  />
                </div>
              ))}
              <button className="hfc-search">
                <Search size={13} strokeWidth={2} />
                Search
              </button>
            </div>

            {/* Mobile toggle bar */}
            <div className="hfc-mob-bar">
              <span className="hfc-mob-label">Search Properties</span>
              <button
                className="hfc-mob-toggle"
                onClick={() => setFiltersOpen((v) => !v)}
              >
                <SlidersHorizontal size={12} className="icon-gold" />
                Filters
                <ChevronDown
                  size={11}
                  className="icon-gold"
                  style={{
                    transition: "transform 0.35s ease",
                    transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            </div>

            {/* Mobile expandable panel */}
            <div className={`hfc-panel${filtersOpen ? " open" : ""}`}>
              {[
                {
                  key: "type",
                  label: "Property Type",
                  opts: filterOptions.type,
                  ph: "Any type",
                },
                {
                  key: "location",
                  label: "Location",
                  opts: filterOptions.location,
                  ph: "Any location",
                },
                {
                  key: "bedrooms",
                  label: "Bedrooms",
                  opts: filterOptions.bedrooms,
                  ph: "Any",
                },
                {
                  key: "price",
                  label: "Price Range",
                  opts: filterOptions.price,
                  ph: "Any budget",
                },
              ].map((f) => (
                <div key={f.key} className="hfc-mob-field">
                  <span style={fieldLabel}>{f.label}</span>
                  <FilterSelect
                    placeholder={f.ph}
                    options={f.opts}
                    value={filters[f.key]}
                    onChange={set(f.key)}
                  />
                </div>
              ))}
              <div className="hfc-mob-sbtn-wrap">
                <button className="hfc-search hfc-mob-sbtn">
                  <Search size={13} strokeWidth={2} />
                  Search Properties
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          SOCIAL SIDEBAR
      ══════════════════════════ */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 14,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
        }}
      >
        {/* Social icons keep their own brand colors — they're platform identity */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            overflow: "hidden",
            maxHeight: socialOpen ? `${socials.length * 46}px` : "0px",
            opacity: socialOpen ? 1 : 0,
            transition:
              "max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease",
          }}
        >
          {socials.map((s, i) => (
            <a
              key={i}
              href={s.href}
              title={s.label}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 10px rgba(0,0,0,0.24)",
                flexShrink: 0,
                transition: "transform 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {s.icon}
            </a>
          ))}
        </div>

        {/* Toggle button — brand dark + gold X icon */}
        <button
          onClick={() => setSocialOpen((o) => !o)}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "#1a1a2e" /* brand --color-secondary */,
            border: "1.5px solid rgba(212,175,55,0.4)" /* gold ring */,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(10,17,114,0.28)",
            transform: socialOpen ? "rotate(0deg)" : "rotate(45deg)",
            transition:
              "transform 0.42s cubic-bezier(0.34,1.56,0.64,1), background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#0a1172")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2e")}
        >
          <X size={15} color="#d4af37" strokeWidth={2.5} /> {/* gold X */}
        </button>
      </div>
    </>
  );
}
