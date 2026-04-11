import { useState, useEffect, useRef } from "react";
import { Star, Quote } from "lucide-react";

if (!document.querySelector("#slendor-fonts")) {
  const l = document.createElement("link");
  l.id = "slendor-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

const testimonials = [
  {
    id: 1,
    name: "Amara Osei",
    title: "CEO, Osei Capital Group",
    location: "Nairobi, Kenya",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&q=80",
    text: "Slendor Holdings changed the way I think about real estate investment. Their team didn't just sell me a property — they walked me through every detail, every clause, every opportunity. I now own three premium units in Westlands and my ROI has been extraordinary.",
    property: "Amalia Springs Villa",
    accent: "#c2884a",
  },
  {
    id: 2,
    name: "James Mwangi",
    title: "Director, Mwangi & Partners Law",
    location: "Mombasa, Kenya",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=120&q=80",
    text: "I was skeptical at first — I'd dealt with agents before who vanished after the signature. Slendor was different. Eight months on, they still check in. The Palm Court property exceeded every expectation. Absolutely world-class service from start to finish.",
    property: "Palm Court Residence",
    accent: "#7B2D8B",
  },
  {
    id: 3,
    name: "Fatuma Hassan",
    title: "Entrepreneur & Investor",
    location: "Kisumu, Kenya",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=120&q=80",
    text: "As a woman investing independently, I needed a team I could trust completely. Slendor Holdings gave me exactly that — transparency, respect, and results. My Shangrila Villa has already appreciated 28% in value within fourteen months. I refer everyone I know.",
    property: "Shangrila Villa",
    accent: "#0d6e5e",
  },
  {
    id: 4,
    name: "David Kariuki",
    title: "Tech Founder, Nairobi",
    location: "Nairobi, Kenya",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
    text: "The digital-first approach Slendor takes is refreshing. Virtual tours, instant document signing, real-time updates — it felt like buying property in 2030. I closed on Diamond Ivy from Singapore without setting foot in Kenya and it was seamless.",
    property: "Diamond Ivy Apartment",
    accent: "#1d4ed8",
  },
  {
    id: 5,
    name: "Grace Akinyi",
    title: "Medical Consultant",
    location: "Eldoret, Kenya",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&q=80",
    text: "Finding a home that matched my vision felt impossible until I met the Slendor team. They listened — actually listened — and found me 143 Brookview within two weeks. The attention to detail in their service is something you simply cannot put a price on.",
    property: "143 Brookview",
    accent: "#c2410c",
  },
  {
    id: 6,
    name: "Samuel Otieno",
    title: "Investment Banker",
    location: "Nairobi, Kenya",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
    text: "I've worked with real estate firms across East Africa and nothing comes close to Slendor's professionalism. Their market intelligence is sharp, their negotiation is firm, and their aftercare is genuine. Forest Hill was the best financial decision I've ever made.",
    property: "Forest Hill Estate",
    accent: "#b45309",
  },
];

function StarRow({ count = 5 }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} fill="#F59E0B" color="#F59E0B" />
      ))}
    </div>
  );
}

function TestimonialCard({ t, index, active }) {
  const isCenter = index === 1;
  return (
    <div
      style={{
        background: isCenter
          ? "linear-gradient(145deg, #1a0f00 0%, #2d1500 100%)"
          : "#fff",
        borderRadius: 24,
        padding: "36px 32px",
        position: "relative",
        overflow: "hidden",
        boxShadow: isCenter
          ? "0 32px 80px rgba(0,0,0,0.22)"
          : "0 4px 24px rgba(0,0,0,0.07)",
        transform: isCenter ? "scale(1.04)" : "scale(1)",
        transition: "all 0.5s cubic-bezier(0.34,1.2,0.64,1)",
        border: isCenter ? "none" : "1.5px solid #f0e8df",
        zIndex: isCenter ? 2 : 1,
      }}
    >
      {/* Big quote mark */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          opacity: isCenter ? 0.12 : 0.06,
        }}
      >
        <Quote
          size={72}
          color={isCenter ? "#F59E0B" : t.accent}
          strokeWidth={1}
        />
      </div>

      {/* Accent blob */}
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${t.accent}22 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Stars */}
      <div style={{ marginBottom: 18 }}>
        <StarRow count={t.rating} />
      </div>

      {/* Quote text */}
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
          fontStyle: "italic",
          lineHeight: 1.75,
          color: isCenter ? "rgba(255,245,230,0.92)" : "#3d2c1a",
          marginBottom: 28,
          fontWeight: 400,
          position: "relative",
          zIndex: 1,
        }}
      >
        "{t.text}"
      </p>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: isCenter
            ? "linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)"
            : "linear-gradient(90deg, transparent, #e8ddd2, transparent)",
          marginBottom: 22,
        }}
      />

      {/* Author */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            overflow: "hidden",
            border: `2.5px solid ${isCenter ? "#F59E0B" : t.accent}`,
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
              fontFamily: "'Jost', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: isCenter ? "#fde68a" : "#1a0f00",
              marginBottom: 2,
            }}
          >
            {t.name}
          </div>
          <div
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 11,
              color: isCenter ? "rgba(255,220,150,0.7)" : "#9a7c5a",
              marginBottom: 4,
            }}
          >
            {t.title} · {t.location}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: isCenter ? "rgba(245,158,11,0.15)" : `${t.accent}15`,
              borderRadius: 99,
              padding: "3px 10px",
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: isCenter ? "#F59E0B" : t.accent,
              }}
            />
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 10,
                fontWeight: 500,
                color: isCenter ? "#F59E0B" : t.accent,
                letterSpacing: "0.06em",
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
  const intervalRef = useRef(null);
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

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
    }, 350);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => advance("next"), 5000);
    return () => clearInterval(intervalRef.current);
  }, [animating]);

  /* Intersection observer for entrance */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
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
        background:
          "linear-gradient(160deg, #fdf6ee 0%, #fef9f4 50%, #fdf3e8 100%)",
        padding: "110px 0 120px",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .testimonial-section-header {
          opacity: 0;
          animation: none;
        }
        .testimonial-section-header.visible {
          animation: fadeSlideIn 0.8s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .tcard-wrap {
          opacity: 1;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .tcard-wrap.animating-next {
          opacity: 0;
          transform: translateX(-40px);
        }
        .tcard-wrap.animating-prev {
          opacity: 0;
          transform: translateX(40px);
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
          .testimonials-grid > *:last-child { display: none; }
        }
        @media (max-width: 640px) {
          .testimonials-grid { grid-template-columns: 1fr; }
          .testimonials-grid > *:nth-child(2),
          .testimonials-grid > *:nth-child(3) { display: none; }
        }
        .dot-btn {
          width: 8px; height: 8px;
          border-radius: 99px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }
        .dot-btn.active { width: 28px; background: #F59E0B !important; }
        .nav-btn {
          width: 48px; height: 48px;
          border-radius: 50%;
          border: 1.5px solid #e8ddd2;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          color: #1a0f00;
        }
        .nav-btn:hover {
          background: #1a0f00;
          color: #fff;
          border-color: #1a0f00;
          transform: scale(1.08);
        }
        .stat-item {
          opacity: 0;
          animation: none;
        }
        .stat-item.visible {
          animation: fadeSlideIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
        }
      `}</style>

      {/* ── Decorative background elements ── */}
      <div
        style={{
          position: "absolute",
          top: -60,
          left: "10%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.09) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: "5%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(123,45,139,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Horizontal warm stripe */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(245,158,11,0.12), transparent)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 clamp(1.5rem, 5vw, 4rem)",
        }}
      >
        {/* ── Header ── */}
        <div
          className={`testimonial-section-header${visible ? " visible" : ""}`}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 16,
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
              Client Stories
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
              fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
              fontWeight: 700,
              color: "#1a0f00",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            What Our Clients Say
          </h2>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 15,
              color: "#9a7c5a",
              fontWeight: 300,
              maxWidth: 420,
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            Real stories from real homeowners who trusted Slendor Holdings to
            find their perfect place
          </p>
        </div>

        {/* ── Stats bar ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(24px, 5vw, 72px)",
            marginBottom: 64,
            flexWrap: "wrap",
          }}
        >
          {[
            { num: "2,400+", label: "Happy Clients" },
            { num: "KES 5B+", label: "Properties Sold" },
            { num: "98%", label: "Satisfaction Rate" },
            { num: "18 yrs", label: "Market Experience" },
          ].map((s, i) => (
            <div
              key={i}
              className={`stat-item${visible ? " visible" : ""}`}
              style={{
                textAlign: "center",
                animationDelay: `${i * 120}ms`,
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                  fontWeight: 700,
                  color: "#1a0f00",
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 12,
                  color: "#9a7c5a",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 400,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Thin divider */}
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent, #e8ddd2 30%, #e8ddd2 70%, transparent)",
            marginBottom: 52,
          }}
        />

        {/* ── Cards ── */}
        <div
          className={`tcard-wrap${animating ? (direction === "next" ? " animating-next" : " animating-prev") : ""}`}
        >
          <div className="testimonials-grid">
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
            gap: 20,
            marginTop: 48,
          }}
        >
          {/* Prev */}
          <button
            className="nav-btn"
            onClick={() => advance("prev")}
            aria-label="Previous"
          >
            <svg
              width="18"
              height="18"
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

          {/* Dots */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`dot-btn${i === startIndex ? " active" : ""}`}
                style={{ background: i === startIndex ? "#F59E0B" : "#d6c9bb" }}
                onClick={() => {
                  setDirection(i > startIndex ? "next" : "prev");
                  setAnimating(true);
                  setTimeout(() => {
                    setStartIndex(i);
                    setAnimating(false);
                  }, 350);
                }}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          {/* Next */}
          <button
            className="nav-btn"
            onClick={() => advance("next")}
            aria-label="Next"
          >
            <svg
              width="18"
              height="18"
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
            marginTop: 64,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(16px, 4vw, 48px)",
            flexWrap: "wrap",
          }}
        >
          {[
            "Licensed Real Estate Agents",
            "Kenya Property Network Member",
            "ISO 9001 Certified",
            "Award-Winning Service 2024",
          ].map((badge, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "'Jost', sans-serif",
                fontSize: 11,
                color: "#9a7c5a",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #F59E0B, #b45309)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
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
