import { useState, useEffect, useRef } from "react";
import { Star, Quote } from "lucide-react";

if (!document.querySelector("#splendor-fonts")) {
  const l = document.createElement("link");
  l.id = "splendor-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Lato:wght@300;400;700;900&display=swap";
  document.head.appendChild(l);
}

/* ── Brand tokens ── */
const C = {
  primary: "#0a1172",
  secondary: "#1a3a5c",
  accent: "#d4af37",
  beige: "#ede8dc",
  white: "#fafaf8",
  black: "#0d0d0d",
  text: "#1a1a2e",
  muted: "#6b7280",
};

const testimonials = [
  {
    id: 1,
    name: "Hodan Farah",

    location: "Nairobi, Kenya",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&q=80",
    text: "Splendor Holdings changed the way I think about real estate investment. Their team didn't just sell me a property — they walked me through every detail, every clause, every opportunity. I now own three premium units in Westlands and my ROI has been extraordinary.",
  },
  {
    id: 2,
    name: "Priya Mehta",

    location: "Mumbai, India",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=120&q=80",
    text: "I was skeptical at first — I'd dealt with agents before who vanished after the signature. Splendor was different. Eight months on, they still check in. The Palm Court property exceeded every expectation. Absolutely world-class service from start to finish.",
  },
  {
    id: 3,
    name: "Marcus Thompson",

    location: "London, England",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
    text: "I've worked with real estate firms across three continents and nothing comes close to Splendor's professionalism. Their market intelligence is sharp, their negotiation is firm, and their aftercare is genuine. Forest Hill was the best financial decision I've ever made.",
  },
  {
    id: 4,
    name: "Abdirahman Warsame",

    location: "Mogadishu, Somalia",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=120&q=80",
    text: "As someone investing from abroad, I needed a team I could trust completely. Splendor Holdings gave me exactly that — transparency, respect, and results. My Shangrila Villa has already appreciated 28% in value within fourteen months. I refer everyone I know.",
  },
  {
    id: 5,
    name: "Jennifer Caldwell",

    location: "Texas, USA",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&q=80",
    text: "The digital-first approach Splendor takes is refreshing. Virtual tours, instant document signing, real-time updates — it felt like buying property in 2030. I closed on Diamond Ivy from the States without setting foot in Kenya and it was completely seamless.",
  },
  {
    id: 6,
    name: "Rajesh Krishnamurthy",

    location: "Singapore",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
    text: "Finding a home that matched my vision felt impossible until I met the Splendor team. They listened — actually listened — and found me 143 Brookview within two weeks. The attention to detail in their service is something you simply cannot put a price on.",
  },
];

function StarRow({ count = 5 }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={12} fill={C.accent} color={C.accent} />
      ))}
    </div>
  );
}

function TestimonialCard({ t, index }) {
  const isCenter = index === 1;
  return (
    <div
      style={{
        background: isCenter ? C.primary : C.white,
        borderRadius: 4,
        padding: "36px 30px",
        position: "relative",
        overflow: "hidden",
        boxShadow: isCenter
          ? "0 24px 64px rgba(10,17,114,0.18)"
          : "0 2px 16px rgba(0,0,0,0.06)",
        transform: isCenter ? "scale(1.03)" : "scale(1)",
        transition: "all 0.45s cubic-bezier(0.34,1.2,0.64,1)",
        border: isCenter ? "none" : `1.5px solid ${C.beige}`,
        zIndex: isCenter ? 2 : 1,
      }}
    >
      {/* Watermark quote */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 20,
          opacity: isCenter ? 0.08 : 0.05,
        }}
      >
        <Quote
          size={80}
          color={isCenter ? C.accent : C.primary}
          strokeWidth={1}
        />
      </div>

      {/* Gold accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: isCenter ? "100%" : 0,
          height: 3,
          background: C.accent,
          transition: "width 0.5s ease",
        }}
      />

      {/* Stars */}
      <div style={{ marginBottom: 20 }}>
        <StarRow count={t.rating} />
      </div>

      {/* Quote */}
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)",
          fontStyle: "italic",
          lineHeight: 1.8,
          color: isCenter ? "rgba(250,250,248,0.9)" : C.text,
          marginBottom: 28,
          fontWeight: 400,
        }}
      >
        "{t.text}"
      </p>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: isCenter ? `rgba(212,175,55,0.3)` : `${C.beige}`,
          marginBottom: 22,
        }}
      />

      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid ${isCenter ? C.accent : C.beige}`,
            flexShrink: 0,
          }}
        >
          <img
            src={t.avatar}
            alt={t.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: isCenter ? C.accent : C.primary,
              marginBottom: 2,
              letterSpacing: "0.01em",
            }}
          >
            {t.name}
          </div>
          <div
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 11,
              color: isCenter ? "rgba(250,250,248,0.55)" : C.muted,
              marginBottom: 8,
            }}
          >
            {t.title} · {t.location}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: isCenter
                ? "rgba(212,175,55,0.12)"
                : `rgba(10,17,114,0.06)`,
              borderRadius: 2,
              padding: "3px 10px",
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: C.accent,
              }}
            />
            <span
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: isCenter ? C.accent : C.secondary,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {t.property}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [startIndex, setStartIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const intervalRef = useRef(null);

  const total = testimonials.length;

  const getVisible = (start) => [
    testimonials[start % total],
    testimonials[(start + 1) % total],
    testimonials[(start + 2) % total],
  ];

  const advance = (dir) => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setStartIndex((s) =>
        dir === "next" ? (s + 1) % total : (s - 1 + total) % total,
      );
      setAnimating(false);
    }, 320);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => advance("next"), 5500);
    return () => clearInterval(intervalRef.current);
  }, [animating]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.12 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const visibleCards = getVisible(startIndex);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        background: C.beige,
        padding: "100px 0 110px",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sh-header { opacity: 0; }
        .sh-header.in { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .sh-stat { opacity: 0; }
        .sh-stat.in { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
        .sh-cards {
          opacity: 1;
          transition: opacity 0.32s ease, transform 0.32s ease;
        }
        .sh-cards.out-next { opacity: 0; transform: translateX(-28px); }
        .sh-cards.out-prev { opacity: 0; transform: translateX(28px); }

        .sh-testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .sh-testimonials-grid { grid-template-columns: repeat(2, 1fr); }
          .sh-testimonials-grid > *:last-child { display: none; }
        }
        @media (max-width: 640px) {
          .sh-testimonials-grid { grid-template-columns: 1fr; }
          .sh-testimonials-grid > *:nth-child(2),
          .sh-testimonials-grid > *:nth-child(3) { display: none; }
        }

        .sh-dot {
          width: 7px; height: 7px;
          border-radius: 99px;
          border: none;
          cursor: pointer;
          transition: all 0.28s ease;
          padding: 0;
        }
        .sh-dot.on { width: 24px; background: #d4af37 !important; }

        .sh-navbtn {
          width: 44px; height: 44px;
          border-radius: 2px;
          border: 1.5px solid #c8c0b0;
          background: #fafaf8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.22s ease;
          color: #1a1a2e;
        }
        .sh-navbtn:hover {
          background: #0a1172;
          color: #fafaf8;
          border-color: #0a1172;
        }
        .sh-badge {
          display: flex; align-items: center; gap: 7px;
          font-family: 'Lato', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6b7280;
        }
      `}</style>

      {/* Subtle top border */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: C.accent,
        }}
      />

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "0 clamp(1.5rem, 5vw, 4rem)",
        }}
      >
        {/* ── Header ── */}
        <div
          className={`sh-header${visible ? " in" : ""}`}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div style={{ width: 40, height: 1, background: C.accent }} />
            <span
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: C.secondary,
              }}
            >
              Client Stories
            </span>
            <div style={{ width: 40, height: 1, background: C.accent }} />
          </div>

          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 700,
              color: C.primary,
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            What Our Clients Say
          </h2>
          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 15,
              color: C.muted,
              fontWeight: 300,
              maxWidth: 400,
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            Real stories from real homeowners who trusted Splendor Holdings to
            find their perfect place
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, #c8c0b0 30%, #c8c0b0 70%, transparent)`,
            marginBottom: 48,
          }}
        />

        {/* ── Cards ── */}
        <div
          className={`sh-cards${animating ? (direction === "next" ? " out-next" : " out-prev") : ""}`}
        >
          <div className="sh-testimonials-grid">
            {visibleCards.map((t, i) => (
              <TestimonialCard key={t.id} t={t} index={i} />
            ))}
          </div>
        </div>

        {/* ── Controls ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            marginTop: 44,
          }}
        >
          <button
            className="sh-navbtn"
            onClick={() => advance("prev")}
            aria-label="Previous"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`sh-dot${i === startIndex ? " on" : ""}`}
                style={{ background: i === startIndex ? C.accent : "#c8c0b0" }}
                onClick={() => {
                  if (i === startIndex) return;
                  setDirection(i > startIndex ? "next" : "prev");
                  setAnimating(true);
                  setTimeout(() => {
                    setStartIndex(i);
                    setAnimating(false);
                  }, 320);
                }}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            className="sh-navbtn"
            onClick={() => advance("next")}
            aria-label="Next"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* ── Trust badges ── */}
        <div
          style={{
            marginTop: 60,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(16px, 4vw, 44px)",
            flexWrap: "wrap",
          }}
        >
          {[
            "Licensed Real Estate Agents",
            "Kenya Property Network Member",
            "ISO 9001 Certified",
            "Award-Winning Service 2024",
          ].map((badge, i) => (
            <div key={i} className="sh-badge">
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: C.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
