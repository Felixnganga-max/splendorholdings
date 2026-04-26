import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";

/* ── Font injection ── */
if (!document.querySelector("#slendor-fonts")) {
  const l = document.createElement("link");
  l.id = "slendor-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700&display=swap";
  document.head.appendChild(l);
}

const B = {
  primary: "#0a1172",
  secondary: "#1a3a5c",
  accent: "#d4af37",
  beige: "#ede8dc",
  white: "#fafaf8",
  text: "#1a1a2e",
  muted: "#6b7280",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Lato', 'Helvetica Neue', Arial, sans-serif",
  grad: "linear-gradient(135deg, #0a1172 0%, #1a3a5c 100%)",
};

const BEDROOM_CATEGORIES = [
  { bedsValue: 0, label: "Studio", isPlus: false },
  { bedsValue: 1, label: "1 Bedroom", isPlus: false },
  { bedsValue: 2, label: "2 Bedrooms", isPlus: false },
  { bedsValue: 3, label: "3 Bedrooms", isPlus: false },
  { bedsValue: 4, label: "4+ Bedrooms", isPlus: true },
];

const API_BASE = "https://splendorholdings-2v47.vercel.app";

async function fetchRandomImages(count = 5) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/properties?limit=50&page=1`);
    const json = await res.json();
    const props = json.data?.properties ?? [];

    const allImages = [];
    for (const p of props) {
      for (const img of p.images ?? []) {
        if (img.url)
          allImages.push({ url: img.url, name: p.name, beds: p.beds ?? 0 });
      }
    }

    // Fisher-Yates shuffle
    for (let i = allImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
    }

    return allImages.slice(0, count);
  } catch {
    return [];
  }
}

// ─── Parallax Card ────────────────────────────────────────────────────────────
function ParallaxCard({ category, imageData }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const rafRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // Continuous rAF loop for butter-smooth parallax
  useEffect(() => {
    const img = imgRef.current;
    const card = cardRef.current;
    if (!img || !card) return;

    let currentY = 0;

    const tick = () => {
      const rect = card.getBoundingClientRect();
      const vh = window.innerHeight;
      const cardMid = rect.top + rect.height / 2;
      const viewMid = vh / 2;
      // normalise: 0 when card is centred in viewport
      const offset = (viewMid - cardMid) / (vh * 0.7);
      const clamped = Math.max(-1, Math.min(1, offset));
      const targetY = clamped * 18; // ±18% travel
      currentY += (targetY - currentY) * 0.08; // lerp
      img.style.transform = `scale(1.36) translateY(${currentY.toFixed(3)}%)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleClick = () => {
    const param = category.isPlus ? "bedsMin=4" : `beds=${category.bedsValue}`;
    navigate(`/listings?${param}`);
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      style={{
        position: "relative",
        borderRadius: 6,
        overflow: "hidden",
        cursor: "pointer",
        aspectRatio: "2 / 3",
        background: "#0d0f1a",
        boxShadow: "0 6px 32px rgba(10,17,114,0.20)",
        transition:
          "box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 28px 72px rgba(10,17,114,0.42)";
        e.currentTarget.style.transform = "scale(1.025)";
        const rule = e.currentTarget.querySelector(".gold-rule");
        const name = e.currentTarget.querySelector(".card-name");
        if (rule) rule.style.width = "48px";
        if (name) name.style.opacity = "1";
        if (name) name.style.transform = "translateY(0px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 32px rgba(10,17,114,0.20)";
        e.currentTarget.style.transform = "scale(1)";
        const rule = e.currentTarget.querySelector(".gold-rule");
        const name = e.currentTarget.querySelector(".card-name");
        if (rule) rule.style.width = "22px";
        if (name) name.style.opacity = "0.82";
        if (name) name.style.transform = "translateY(5px)";
      }}
    >
      {/* ── Image layer ── */}
      {imageData?.url ? (
        <img
          ref={imgRef}
          src={imageData.url}
          alt={category.label}
          onLoad={() => setLoaded(true)}
          style={{
            position: "absolute",
            top: "-18%",
            left: 0,
            width: "100%",
            height: "136%",
            objectFit: "cover",
            objectPosition: "center",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.7s ease",
            willChange: "transform",
            transform: "scale(1.36) translateY(0%)",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg,#1a1a2e 25%,#0f1560 50%,#1a1a2e 75%)",
            backgroundSize: "400% 100%",
            animation: "shimmer 1.6s ease-in-out infinite",
          }}
        />
      )}

      {/* Gradient overlay — top fade light, bottom strong */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(5,8,40,0.08) 0%, rgba(5,8,40,0.10) 45%, rgba(5,8,40,0.78) 100%)",
          zIndex: 1,
          transition: "background 0.35s ease",
        }}
      />

      {/* ── Bottom label ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          padding: "clamp(14px,2.5vw,24px) clamp(16px,2.5vw,26px)",
        }}
      >
        <div
          className="gold-rule"
          style={{
            width: 22,
            height: 1.5,
            background: B.accent,
            borderRadius: 2,
            marginBottom: 9,
            transition: "width 0.30s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
        <div
          className="card-name"
          style={{
            fontFamily: B.serif,
            fontSize: "clamp(1.1rem, 1.8vw, 1.6rem)",
            fontWeight: 700,
            color: B.white,
            lineHeight: 1.15,
            opacity: 0.82,
            transform: "translateY(5px)",
            transition:
              "opacity 0.30s ease, transform 0.30s cubic-bezier(0.34,1.56,0.64,1)",
            textShadow: "0 2px 14px rgba(0,0,0,0.50)",
            letterSpacing: "0.01em",
          }}
        >
          {category.label}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FeaturedProperties() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchRandomImages(5).then(setImages);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        padding: "100px 0 120px",
        overflow: "hidden",
      }}
    >
      {/* ── Backgrounds ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${assets.bg || assets.background || ""})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,17,114,0.20)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 1,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.20) 0%, transparent 60%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 3 }}>
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "0 clamp(1rem, 3vw, 2.5rem)",
          }}
        >
          {/* ── Header ── */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 1.5,
                  background: B.accent,
                  borderRadius: 2,
                }}
              />
              <span
                style={{
                  fontFamily: B.sans,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: B.accent,
                }}
              >
                Browse by Size
              </span>
              <div
                style={{
                  width: 32,
                  height: 1.5,
                  background: B.accent,
                  borderRadius: 2,
                }}
              />
            </div>
            <h2
              style={{
                fontFamily: B.serif,
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                fontWeight: 700,
                color: B.white,
                lineHeight: 1.12,
                textShadow: "0 4px 24px rgba(10,17,114,0.35)",
              }}
            >
              Find Your Perfect Home
            </h2>
          </div>

          {/* ── Grid ── */}
          <style>{`
            @keyframes shimmer {
              0%  { background-position: 100% 0 }
              100%{ background-position: -100% 0 }
            }
            .feat-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: clamp(10px, 1.6vw, 20px);
            }
            /* rows: 3 on top, then 2 centred by sitting in col 1 & 2 */
            .feat-grid > :nth-child(4) { grid-column: 1; }
            .feat-grid > :nth-child(5) { grid-column: 2; }

            @media (max-width: 860px) {
              .feat-grid {
                grid-template-columns: repeat(2, 1fr);
              }
              .feat-grid > :nth-child(n) { grid-column: span 1; }
            }
            @media (max-width: 500px) {
              .feat-grid {
                grid-template-columns: 1fr 1fr;
                gap: 10px;
              }
              /* on mobile keep 2-col, all span 1 */
              .feat-grid > :nth-child(n) { grid-column: span 1; }
            }
          `}</style>

          <div className="feat-grid">
            {BEDROOM_CATEGORIES.map((cat, i) => (
              <ParallaxCard
                key={cat.bedsValue}
                category={cat}
                imageData={images[i] ?? null}
              />
            ))}
          </div>

          {/* ── Footer CTA ── */}
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <button
              onClick={() => navigate("/listings")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 30px",
                borderRadius: 99,
                border: "1.5px solid rgba(212,175,55,0.45)",
                background: "transparent",
                color: B.accent,
                fontFamily: B.sans,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.22s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212,175,55,0.10)";
                e.currentTarget.style.borderColor = B.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.45)";
              }}
            >
              Browse All Listings →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
