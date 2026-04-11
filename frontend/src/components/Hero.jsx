import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";

/* ── Google Fonts ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

/* ── Slides ── */
const slides = [
  {
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85",
    headline: "Find Your\nDream Home",
    sub: "Over KES 5 Billion in Properties Sold",
  },
  {
    url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=85",
    headline: "Luxury Living\nAwaits You",
    sub: "Exclusive Listings Across Prime Locations",
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=85",
    headline: "Invest in\nYour Future",
    sub: "Premium Properties for Every Lifestyle",
  },
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85",
    headline: "Your Story\nStarts Here",
    sub: "Trusted Real Estate Partners Since 2005",
  },
];

/* ── Socials ── */
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
        width="18"
        height="18"
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
      <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
        <path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.984V9h3.102v1.561h.046c.432-.817 1.487-1.678 3.061-1.678 3.274 0 3.878 2.155 3.878 4.958v6.611zM5.337 7.433a1.804 1.804 0 110-3.608 1.804 1.804 0 010 3.608zm1.554 13.019H3.783V9h3.108v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    bg: "#1877F2",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.931-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    bg: "#010101",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.84a8.2 8.2 0 004.79 1.53V6.93a4.85 4.85 0 01-1.02-.24z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    bg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    bg: "#14171A",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    bg: "#FF0000",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const filterOptions = {
  listing: ["For Sale", "For Rent", "Short Stay"],
  type: ["Apartment", "Villa", "Townhouse", "Land", "Commercial"],
  location: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
  bedrooms: ["Studio", "1 Bed", "2 Beds", "3 Beds", "4+ Beds"],
};

function FilterSelect({ placeholder, options }) {
  return (
    <div className="relative flex-1 border-r border-gray-100">
      <select
        defaultValue=""
        className="w-full appearance-none bg-white px-5 py-4 text-gray-500 text-sm focus:outline-none cursor-pointer"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const t = setInterval(
      () => setCurrent((c) => (c + 1) % slides.length),
      5500,
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        const top = heroRef.current.getBoundingClientRect().top;
        setOffset(-top * 0.28);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{ height: "100vh", minHeight: 720 }}
      >
        {/* PARALLAX IMAGES */}
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === current ? 1 : 0, zIndex: 0 }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${slide.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: `translateY(${offset}px) scale(1.12)`,
                willChange: "transform",
              }}
            />
          </div>
        ))}

        {/* WARM OVERLAY */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(110deg, rgba(15,6,0,0.80) 0%, rgba(55,22,3,0.58) 40%, rgba(5,3,0,0.22) 100%)",
          }}
        />
        {/* amber bloom */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 10% 90%, rgba(160,80,5,0.30) 0%, transparent 70%)",
          }}
        />

        {/* HERO TEXT */}
        <div
          className="absolute z-20 flex flex-col justify-center"
          style={{
            top: 0,
            bottom: 180,
            left: 0,
            right: 0,
            paddingLeft: "clamp(2rem, 8vw, 9rem)",
            paddingRight: "clamp(2rem, 8vw, 9rem)",
          }}
        >
          <div style={{ maxWidth: 640 }}>
            {/* Brand accent */}
            <div className="flex items-center gap-3 mb-7">
              <div
                style={{
                  width: 44,
                  height: 2,
                  background: "#F59E0B",
                  borderRadius: 2,
                }}
              />
              <span
                className="text-amber-300 uppercase tracking-[0.32em] text-xs"
                style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400 }}
              >
                Slendor Holdings
              </span>
            </div>

            {/* Slide headlines */}
            <div style={{ position: "relative", minHeight: 220 }}>
              {slides.map((slide, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    opacity: i === current ? 1 : 0,
                    transform:
                      i === current ? "translateY(0px)" : "translateY(22px)",
                    transition: "opacity 0.8s ease, transform 0.8s ease",
                    pointerEvents: i === current ? "auto" : "none",
                  }}
                >
                  <h1
                    className="text-white leading-[1.06] mb-5"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(3.2rem, 6vw, 5.6rem)",
                      fontWeight: 700,
                      whiteSpace: "pre-line",
                      textShadow: "0 4px 40px rgba(0,0,0,0.55)",
                    }}
                  >
                    {slide.headline}
                  </h1>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(1.05rem, 1.8vw, 1.45rem)",
                      fontStyle: "italic",
                      color: "#fde68a",
                      textShadow: "0 2px 16px rgba(0,0,0,0.4)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {slide.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2 mt-6">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  style={{
                    width: i === current ? 32 : 8,
                    height: 8,
                    borderRadius: 99,
                    background:
                      i === current ? "#F59E0B" : "rgba(255,255,255,0.32)",
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

        {/* FILTER BAR — pinned above bottom, always fully visible */}
        <div
          className="absolute left-0 right-0 z-30"
          style={{
            bottom: 36,
            paddingLeft: "clamp(1rem, 5vw, 6rem)",
            paddingRight: "clamp(1rem, 5vw, 6rem)",
          }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.98)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.40)",
              maxWidth: 1080,
              margin: "0 auto",
            }}
          >
            {/* Tabs */}
            <div
              className="flex"
              style={{
                background: "#faf9f8",
                borderBottom: "1px solid #f0ede8",
              }}
            >
              {["Buy", "Rent", "Off-Plan", "Commercial"].map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "12px 20px",
                    color: i === activeTab ? "#7B2D8B" : "#9ca3af",
                    borderBottom:
                      i === activeTab
                        ? "2px solid #7B2D8B"
                        : "2px solid transparent",
                    background: "transparent",
                    border: "none",
                    borderBottom:
                      i === activeTab
                        ? "2px solid #7B2D8B"
                        : "2px solid transparent",
                    cursor: "pointer",
                    transition: "color 0.2s",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filter inputs */}
            <div className="flex items-stretch" style={{ minHeight: 58 }}>
              <FilterSelect
                placeholder="Sale / Rent"
                options={filterOptions.listing}
              />
              <FilterSelect
                placeholder="Property Type"
                options={filterOptions.type}
              />
              <FilterSelect
                placeholder="Location"
                options={filterOptions.location}
              />
              <FilterSelect
                placeholder="Bedrooms"
                options={filterOptions.bedrooms}
              />

              <div className="relative flex-1 border-r border-gray-100">
                <input
                  type="text"
                  placeholder="Max Price (KES)"
                  className="w-full h-full px-5 text-sm text-gray-500 focus:outline-none bg-white"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>

              <button
                className="flex items-center justify-center gap-2 text-white font-semibold text-sm hover:brightness-110 active:scale-95 transition-all"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  background:
                    "linear-gradient(135deg, #7B2D8B 0%, #4A1060 100%)",
                  minWidth: 130,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontSize: 12,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Search size={15} />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          SOCIAL SIDEBAR — fixed bottom-right
      ══════════════════════════════════ */}
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
        {/* Icons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            overflow: "hidden",
            maxHeight: open ? `${socials.length * 48}px` : "0px",
            opacity: open ? 1 : 0,
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
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 12px rgba(0,0,0,0.28)",
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

        {/* X Toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          title={open ? "Close" : "Open"}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #F97316, #B45309)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(249,115,22,0.55)",
            transform: open ? "rotate(0deg)" : "rotate(45deg)",
            transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(1.15)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          <X size={17} color="white" strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
}
