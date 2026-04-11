import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Camera,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { properties, tabs } from "../lib/data";

/* ── Font injection ── */
if (!document.querySelector("#slendor-fonts")) {
  const l = document.createElement("link");
  l.id = "slendor-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

/* ── Parallax hook ── */
function useParallax(ref, speed = 0.08) {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      setY(center * speed);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return y;
}

/* ── Single Card ── */
function PropertyCard({ p, index }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);
  const parallaxY = useParallax(imgRef, 0.06);

  // Use first image from imgs array
  const coverImg = p.imgs?.[0] ?? "";
  const photoCount = p.imgs?.length ?? 0;

  const handleView = () => {
    navigate(`/property/${p.id}`, { state: { property: p } });
  };

  return (
    <div
      onClick={handleView}
      style={{
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        transition:
          "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease",
        cursor: "pointer",
        animationDelay: `${index * 80}ms`,
        animationFillMode: "both",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px) scale(1.01)";
        e.currentTarget.style.boxShadow = "0 24px 60px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
      }}
    >
      {/* Image */}
      <div
        ref={imgRef}
        style={{
          position: "relative",
          height: 220,
          overflow: "hidden",
          background: "#f3ede6",
        }}
      >
        <img
          src={coverImg}
          alt={p.name}
          onLoad={() => setImgLoaded(true)}
          style={{
            width: "100%",
            height: "130%",
            objectFit: "cover",
            objectPosition: "center",
            transform: `translateY(${parallaxY}px)`,
            willChange: "transform",
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.5s ease, transform 0.05s linear",
          }}
        />
        {/* Warm image gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(15,8,0,0.42) 100%)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
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
              padding: "4px 10px",
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
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 500,
              padding: "4px 10px",
              borderRadius: 99,
              letterSpacing: "0.06em",
              fontFamily: "'Jost', sans-serif",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            {p.type}
          </span>
        </div>

        {/* Like + photo count */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked((l) => !l);
            }}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.15)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Heart
              size={15}
              fill={liked ? "#ef4444" : "none"}
              color={liked ? "#ef4444" : "white"}
              strokeWidth={2}
            />
          </button>

          {/* Photo count pill */}
          {photoCount > 1 && (
            <div
              style={{
                height: 34,
                borderRadius: 99,
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: "0 10px",
              }}
            >
              <Camera size={12} color="white" strokeWidth={2} />
              <span
                style={{
                  color: "#fff",
                  fontSize: 11,
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 500,
                }}
              >
                {photoCount}
              </span>
            </div>
          )}
        </div>

        {/* Rating bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 14,
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 99,
            padding: "3px 10px",
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
      </div>

      {/* Card body */}
      <div style={{ padding: "18px 20px 20px" }}>
        {/* Name + location */}
        <div style={{ marginBottom: 10 }}>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 19,
              fontWeight: 700,
              color: "#1a0f00",
              marginBottom: 4,
              lineHeight: 1.2,
            }}
          >
            {p.name}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={11} color="#b45309" strokeWidth={2} />
            <span
              style={{
                fontSize: 12,
                color: "#9a7c5a",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 400,
              }}
            >
              {p.location}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "linear-gradient(90deg, #f5ede3, transparent)",
            marginBottom: 12,
          }}
        />

        {/* Specs */}
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          {p.beds > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Bed size={13} color="#c2884a" strokeWidth={1.8} />
              <span
                style={{
                  fontSize: 12,
                  color: "#6b5c4a",
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                {p.beds} Beds
              </span>
            </div>
          )}
          {p.baths > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Bath size={13} color="#c2884a" strokeWidth={1.8} />
              <span
                style={{
                  fontSize: 12,
                  color: "#6b5c4a",
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                {p.baths} Baths
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Maximize2 size={12} color="#c2884a" strokeWidth={1.8} />
            <span
              style={{
                fontSize: 12,
                color: "#6b5c4a",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {p.area} m²
            </span>
          </div>
        </div>

        {/* Price + CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#b8a090",
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Listed Price
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#1a0f00",
                lineHeight: 1,
              }}
            >
              {p.price}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
              color: "#fff",
              border: "none",
              borderRadius: 99,
              padding: "9px 18px",
              fontSize: 11,
              fontFamily: "'Jost', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "transform 0.2s, filter 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.15)";
              e.currentTarget.style.transform = "scale(1.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            View <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function FeaturedProperties() {
  const [activeTab, setActiveTab] = useState(0);
  const sectionRef = useRef(null);
  const bgParallax = useParallax(sectionRef, 0.04);

  const filtered =
    activeTab === 0
      ? properties
      : properties.filter((p) => p.type === tabs[activeTab]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        background: "#fdf8f3",
        padding: "100px 0 120px",
        overflow: "hidden",
      }}
    >
      {/* Decorative background blobs */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -120,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
          transform: `translateY(${bgParallax * 0.5}px)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(123,45,139,0.06) 0%, transparent 70%)",
          transform: `translateY(${-bgParallax * 0.3}px)`,
          pointerEvents: "none",
        }}
      />

      {/* Subtle grain texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.018,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 clamp(1.5rem, 5vw, 4rem)",
        }}
      >
        {/* ── Section header ── */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
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
                background: "#F59E0B",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "#b45309",
              }}
            >
              Featured Properties
            </span>
            <div
              style={{
                width: 32,
                height: 1.5,
                background: "#F59E0B",
                borderRadius: 2,
              }}
            />
          </div>

          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
              fontWeight: 700,
              color: "#1a0f00",
              lineHeight: 1.12,
              marginBottom: 8,
            }}
          >
            Recommended For You
          </h2>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 15,
              color: "#9a7c5a",
              fontWeight: 300,
              maxWidth: 440,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Hand-picked properties across Kenya's most sought-after
            neighbourhoods
          </p>
        </div>

        {/* ── Filter tabs ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 52,
            flexWrap: "wrap",
          }}
        >
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 13,
                fontWeight: i === activeTab ? 600 : 400,
                padding: "9px 22px",
                borderRadius: 99,
                border: i === activeTab ? "none" : "1.5px solid #e8ddd2",
                background:
                  i === activeTab
                    ? "linear-gradient(135deg, #7B2D8B, #4A1060)"
                    : "#fff",
                color: i === activeTab ? "#fff" : "#7a6555",
                cursor: "pointer",
                transition: "all 0.25s ease",
                letterSpacing: "0.04em",
                boxShadow:
                  i === activeTab
                    ? "0 6px 20px rgba(123,45,139,0.28)"
                    : "0 1px 4px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) => {
                if (i !== activeTab) {
                  e.currentTarget.style.borderColor = "#c2884a";
                  e.currentTarget.style.color = "#7B2D8B";
                }
              }}
              onMouseLeave={(e) => {
                if (i !== activeTab) {
                  e.currentTarget.style.borderColor = "#e8ddd2";
                  e.currentTarget.style.color = "#7a6555";
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Responsive grid styles ── */}
        <style>{`
          .slendor-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
          }
          @media (max-width: 1024px) {
            .slendor-grid { grid-template-columns: repeat(2, 1fr); gap: 22px; }
          }
          @media (max-width: 600px) {
            .slendor-grid { grid-template-columns: 1fr; gap: 18px; }
          }
        `}</style>

        {/* ── Property grid ── */}
        <div className="slendor-grid">
          {filtered.map((p, i) => (
            <PropertyCard key={p.id} p={p} index={i} />
          ))}
        </div>

        {/* ── View all CTA ── */}
        <div style={{ textAlign: "center", marginTop: 64 }}>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "'Jost', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "16px 44px",
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
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#1a0f00";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Sparkles size={15} />
            View All Properties
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
