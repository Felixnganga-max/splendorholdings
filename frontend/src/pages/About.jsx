import { useState, useEffect, useRef } from "react";
import {
  Award,
  Users,
  TrendingUp,
  Heart,
  ArrowRight,
  MapPin,
  CheckCircle,
} from "lucide-react";

const stats = [
  { number: "20+", label: "Years of Experience", icon: Award },
  { number: "2,400+", label: "Families Housed", icon: Users },
  { number: "KES 5B+", label: "Properties Sold", icon: TrendingUp },
  { number: "98%", label: "Client Satisfaction", icon: Heart },
];

const services = [
  {
    icon: "🏡",
    title: "Property Sales & Rentals",
    body: "We offer a wide range of residential properties tailored to different lifestyles and needs, including:",
    items: [
      "Apartments (studios, bedsitters, 1–6 bedroom units)",
      "Double storey homes",
      "Ambassadorial residences",
      "Condominiums",
      "Townhouses",
      "Bungalows",
      "Duplexes",
      "Furnished apartments (short-term rentals, Airbnb, hotel apartments)",
    ],
  },
  {
    icon: "🌍",
    title: "Land Sales & Investment Opportunities",
    body: "We connect our clients with prime land in some of Nairobi's most sought-after locations, including Karen, Westlands, Kilimani, Riverside, Kileleshwa, Lavington, and Peponi. Whether for residential development or long-term investment, we help you secure land with confidence.",
    items: [],
  },
  {
    icon: "🏢",
    title: "Property Management",
    body: "Owning property should be rewarding—not stressful. We provide comprehensive management services that include:",
    items: [
      "Tenant sourcing and screening",
      "Rent collection and reporting",
      "Property maintenance and upkeep",
      "Day-to-day management",
    ],
  },
  {
    icon: "📊",
    title: "Real Estate Advisory & Valuation",
    body: "With years of market insight, we help clients make informed decisions through:",
    items: [
      "Property valuation",
      "Market analysis",
      "Investment guidance and ROI insights",
    ],
  },
  {
    icon: "📢",
    title: "Marketing & Leasing Services",
    body: "We ensure your property gets the visibility it deserves through:",
    items: [
      "Professional listings",
      "Strategic marketing",
      "Efficient leasing processes",
    ],
  },
  {
    icon: "⚖️",
    title: "Legal & Transaction Support",
    body: "We work closely with trusted professionals to ensure smooth and secure transactions, including:",
    items: [
      "Title verification",
      "Sale and lease documentation",
      "End-to-end transaction support",
    ],
  },
  {
    icon: "🧳",
    title: "Relocation & Short-Term Rental Services",
    body: "For clients relocating or seeking flexible living arrangements, we provide:",
    items: [
      "Personalized property search",
      "Furnished rental solutions",
      "Airbnb and short-term rental management",
    ],
  },
];

const differences = [
  {
    label: "Experience you can trust",
    body: "Over 20 years in the real estate industry",
  },
  {
    label: "Local expertise",
    body: "Deep understanding of Nairobi's prime neighborhoods",
  },
  {
    label: "Client-centered approach",
    body: "Every decision is guided by your needs",
  },
  {
    label: "End-to-end solutions",
    body: "From search to settlement—and beyond",
  },
];

function useReveal(threshold = 0.12) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function AnimatedStat({ number, label, icon: Icon, visible, delay }) {
  return (
    <div
      style={{
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 16,
          background: "rgba(212,175,55,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          border: "1px solid rgba(212,175,55,0.25)",
        }}
      >
        <Icon size={24} color="#d4af37" strokeWidth={1.5} />
      </div>
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2rem,3.5vw,2.8rem)",
          fontWeight: 700,
          color: "#fff",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          color: "rgba(212,175,55,0.75)",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function About() {
  const [parallax, setParallax] = useState(0);
  const heroRef = useRef(null);

  const [statsRef, statsVis] = useReveal();
  const [storyRef, storyVis] = useReveal();
  const [servicesRef, servicesVis] = useReveal();
  const [diffRef, diffVis] = useReveal();
  const [mvRef, mvVis] = useReveal();
  const [closingRef, closingVis] = useReveal();

  useEffect(() => {
    const fn = () => {
      if (heroRef.current) {
        const top = heroRef.current.getBoundingClientRect().top;
        setParallax(-top * 0.2);
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div
      style={{
        background: "var(--color-white)",
        minHeight: "100vh",
        fontFamily: "var(--font-body)",
      }}
    >
      <style>{`
        @keyframes fadeUp { from{ opacity:0; transform:translateY(30px); } to{ opacity:1; transform:translateY(0); } }
        .about-story-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
        }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 36px; }
        .services-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .diff-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
        .mv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .services-grid { grid-template-columns: repeat(2,1fr); }
          .about-story-grid { grid-template-columns: 1fr; gap: 48px; }
          .mv-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2,1fr); gap: 20px; }
          .services-grid { grid-template-columns: 1fr; }
          .diff-grid { grid-template-columns: 1fr; }
        }
        .service-card:hover { transform: translateY(-6px) !important; box-shadow: 0 20px 56px rgba(10,17,114,0.12) !important; }
        .service-card { transition: transform 0.3s ease, box-shadow 0.3s ease !important; }
      `}</style>

      {/* ═══════════ HERO ═══════════ */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          height: "62vh",
          minHeight: 480,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translateY(${parallax}px) scale(1.12)`,
            willChange: "transform",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg,rgba(10,17,114,0.92) 0%,rgba(26,58,92,0.78) 50%,rgba(10,17,114,0.40) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 80% at 0% 100%,rgba(212,175,55,0.22) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: "clamp(2rem,8vw,8rem)",
            animation: "fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        >
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <a
              href="/"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                color: "rgba(212,175,55,0.55)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Home
            </a>
            <span style={{ color: "rgba(212,175,55,0.35)" }}>›</span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                color: "#d4af37",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              About Us
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 40,
                height: 2,
                background: "#d4af37",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                color: "rgba(212,175,55,0.85)",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Our Story
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.8rem,5.5vw,5rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.06,
              marginBottom: 18,
              textShadow: "0 4px 40px rgba(0,0,0,0.4)",
            }}
          >
            Built on Trust.
            <br />
            <em style={{ color: "#d4af37", fontStyle: "italic" }}>
              Driven by You.
            </em>
          </h1>

          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1rem,1.7vw,1.25rem)",
              fontStyle: "italic",
              color: "rgba(212,175,55,0.82)",
              maxWidth: 520,
              lineHeight: 1.8,
            }}
          >
            Splendor Holdings — connecting families, investors, and dreamers
            with the properties that change their lives, for over 20 years.
          </p>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section
        ref={statsRef}
        style={{
          background:
            "linear-gradient(135deg,var(--color-primary) 0%,var(--color-secondary) 100%)",
          padding: "72px clamp(1.5rem,6vw,6rem)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="stats-grid">
            {stats.map((s, i) => (
              <AnimatedStat key={i} {...s} visible={statsVis} delay={i * 110} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ OUR STORY ═══════════ */}
      <section
        ref={storyRef}
        style={{
          padding: "100px clamp(1.5rem,6vw,6rem)",
          background: "var(--color-white)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="about-story-grid">
            {/* Left — image collage */}
            <div
              style={{
                position: "relative",
                opacity: storyVis ? 1 : 0,
                transform: storyVis ? "translateX(0)" : "translateX(-30px)",
                transition:
                  "opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <div
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  height: 440,
                  boxShadow: "0 24px 64px rgba(10,17,114,0.18)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85"
                  alt="Splendor property"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: -28,
                  right: -28,
                  width: 200,
                  height: 160,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "5px solid var(--color-white)",
                  boxShadow: "0 12px 40px rgba(10,17,114,0.20)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=400&q=80"
                  alt="Interior"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              {/* Gold badge */}
              <div
                style={{
                  position: "absolute",
                  top: 24,
                  left: -20,
                  background: "linear-gradient(135deg,#d4af37,#b8960c)",
                  borderRadius: 14,
                  padding: "16px 20px",
                  boxShadow: "0 8px 28px rgba(212,175,55,0.40)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  20+
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.9)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginTop: 3,
                  }}
                >
                  Years of
                  <br />
                  Excellence
                </div>
              </div>
            </div>

            {/* Right — story text */}
            <div
              style={{
                opacity: storyVis ? 1 : 0,
                transform: storyVis ? "translateX(0)" : "translateX(30px)",
                transition:
                  "opacity 0.8s ease 0.15s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 2,
                    background: "#d4af37",
                    borderRadius: 2,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "var(--color-primary)",
                  }}
                >
                  About Splendor Holdings
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(2rem,3.5vw,2.8rem)",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  lineHeight: 1.12,
                  marginBottom: 24,
                }}
              >
                Real Estate Is More Than Property—<em>It's About People</em>
              </h2>

              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "var(--color-text)",
                  lineHeight: 1.85,
                  fontWeight: 400,
                  marginBottom: 16,
                }}
              >
                At Splendor Holdings, we believe that real estate is more than
                just property—it's about people, dreams, and long-term value.
                For over <strong>20 years</strong>, we have been helping
                individuals, families, and investors find not just spaces, but
                places they can truly call home.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "var(--color-text)",
                  lineHeight: 1.85,
                  fontWeight: 400,
                  marginBottom: 16,
                }}
              >
                Built on a foundation of trust, professionalism, and deep market
                knowledge, Splendor Holdings has grown into a reliable name in
                the real estate industry. Our journey has been shaped by one
                simple principle: <strong>put the client first, always.</strong>
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "var(--color-text)",
                  lineHeight: 1.85,
                  fontWeight: 400,
                  marginBottom: 32,
                }}
              >
                We are a full-service real estate company specializing in{" "}
                <strong>
                  property sales, rentals, leasing, and management
                </strong>
                . With two decades of hands-on experience, we understand the
                ever-changing property landscape and pride ourselves on offering
                solutions that are both practical and forward-thinking.
              </p>

              <a
                href="/listings"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background:
                    "linear-gradient(135deg,var(--color-primary),var(--color-secondary))",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: 99,
                  padding: "14px 32px",
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  boxShadow: "0 8px 28px rgba(10,17,114,0.28)",
                  transition: "all 0.28s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.12)";
                  e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                View Our Properties <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ WHAT WE DO ═══════════ */}
      <section
        ref={servicesRef}
        style={{
          background: "var(--color-beige)",
          padding: "96px clamp(1.5rem,6vw,6rem)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
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
                  width: 28,
                  height: 2,
                  background: "#d4af37",
                  borderRadius: 2,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                }}
              >
                Our Services
              </span>
              <div
                style={{
                  width: 28,
                  height: 2,
                  background: "#d4af37",
                  borderRadius: 2,
                }}
              />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem,3.5vw,3rem)",
                fontWeight: 700,
                color: "var(--color-primary)",
                lineHeight: 1.1,
              }}
            >
              What We Do
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                color: "var(--color-text-muted)",
                maxWidth: 540,
                margin: "16px auto 0",
                lineHeight: 1.75,
              }}
            >
              Whether you're searching for your first home, expanding your
              investment portfolio, or looking for professional property
              management, we are here every step of the way.
            </p>
          </div>

          <div className="services-grid">
            {services.map((s, i) => (
              <div
                key={i}
                className="service-card"
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: "32px 28px",
                  border: "1.5px solid rgba(10,17,114,0.08)",
                  boxShadow: "0 4px 20px rgba(10,17,114,0.06)",
                  opacity: servicesVis ? 1 : 0,
                  transform: servicesVis ? "translateY(0)" : "translateY(28px)",
                  transition: `opacity 0.65s ease ${i * 70}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${i * 70}ms`,
                }}
              >
                <div style={{ fontSize: 34, marginBottom: 16 }}>{s.icon}</div>
                <div
                  style={{
                    width: 36,
                    height: 3,
                    background: "#d4af37",
                    borderRadius: 2,
                    marginBottom: 14,
                  }}
                />
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    marginBottom: 12,
                    lineHeight: 1.25,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13.5,
                    color: "var(--color-text)",
                    lineHeight: 1.8,
                    marginBottom: s.items.length ? 14 : 0,
                  }}
                >
                  {s.body}
                </p>
                {s.items.length > 0 && (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {s.items.map((item, j) => (
                      <li
                        key={j}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          fontFamily: "var(--font-body)",
                          fontSize: 13,
                          color: "var(--color-text)",
                          lineHeight: 1.7,
                          marginBottom: 5,
                        }}
                      >
                        <span
                          style={{
                            color: "#d4af37",
                            marginTop: 2,
                            flexShrink: 0,
                            fontSize: 10,
                          }}
                        >
                          ◆
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ OUR DIFFERENCE ═══════════ */}
      <section
        ref={diffRef}
        style={{ padding: "96px clamp(1.5rem,6vw,6rem)", background: "#fff" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 72,
              alignItems: "center",
            }}
          >
            <div
              style={{
                opacity: diffVis ? 1 : 0,
                transform: diffVis ? "translateX(0)" : "translateX(-28px)",
                transition:
                  "opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 2,
                    background: "#d4af37",
                    borderRadius: 2,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "var(--color-primary)",
                  }}
                >
                  Why Choose Us
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.8rem,3vw,2.8rem)",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  lineHeight: 1.12,
                  marginBottom: 20,
                }}
              >
                Our Difference
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "var(--color-text)",
                  lineHeight: 1.85,
                  marginBottom: 12,
                }}
              >
                What sets Splendor Holdings apart is not just what we do—but{" "}
                <em>how</em> we do it.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "var(--color-text)",
                  lineHeight: 1.85,
                  fontStyle: "italic",
                  marginBottom: 0,
                  color: "var(--color-primary)",
                  fontWeight: 600,
                }}
              >
                We don't just close deals—we build relationships that last.
              </p>
            </div>

            <div
              className="diff-grid"
              style={{
                opacity: diffVis ? 1 : 0,
                transform: diffVis ? "translateX(0)" : "translateX(28px)",
                transition:
                  "opacity 0.8s ease 0.15s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s",
              }}
            >
              {differences.map((d, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--color-beige)",
                    borderRadius: 16,
                    padding: "24px 20px",
                    border: "1.5px solid rgba(10,17,114,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 3,
                      background: "#d4af37",
                      borderRadius: 2,
                      marginBottom: 12,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--color-primary)",
                      marginBottom: 6,
                    }}
                  >
                    {d.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      color: "var(--color-text)",
                      lineHeight: 1.7,
                    }}
                  >
                    {d.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ MISSION & VISION ═══════════ */}
      <section
        ref={mvRef}
        style={{
          padding: "96px clamp(1.5rem,6vw,6rem)",
          background:
            "linear-gradient(135deg,var(--color-primary) 0%,var(--color-secondary) 100%)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
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
                  width: 28,
                  height: 1.5,
                  background: "#d4af37",
                  borderRadius: 2,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#d4af37",
                }}
              >
                Our Purpose
              </span>
              <div
                style={{
                  width: 28,
                  height: 1.5,
                  background: "#d4af37",
                  borderRadius: 2,
                }}
              />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem,3.5vw,3rem)",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.1,
              }}
            >
              Mission & Vision
            </h2>
          </div>

          <div
            className="mv-grid"
            style={{
              opacity: mvVis ? 1 : 0,
              transform: mvVis ? "translateY(0)" : "translateY(28px)",
              transition:
                "opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.07)",
                borderRadius: 20,
                padding: "40px 32px",
                border: "1.5px solid rgba(212,175,55,0.3)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>🎯</div>
              <div
                style={{
                  width: 36,
                  height: 3,
                  background: "#d4af37",
                  borderRadius: 2,
                  marginBottom: 16,
                }}
              />
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#d4af37",
                  marginBottom: 16,
                }}
              >
                Our Mission
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.85,
                }}
              >
                To deliver exceptional real estate solutions with integrity,
                professionalism, and a personal touch—helping our clients make
                confident property decisions.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.07)",
                borderRadius: 20,
                padding: "40px 32px",
                border: "1.5px solid rgba(212,175,55,0.3)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>🌟</div>
              <div
                style={{
                  width: 36,
                  height: 3,
                  background: "#d4af37",
                  borderRadius: 2,
                  marginBottom: 16,
                }}
              />
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#d4af37",
                  marginBottom: 16,
                }}
              >
                Our Vision
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.85,
                }}
              >
                To be a leading real estate partner known for excellence,
                reliability, and unmatched service in the property market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CLOSING CTA ═══════════ */}
      <section
        ref={closingRef}
        style={{ position: "relative", overflow: "hidden" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg,rgba(10,17,114,0.93) 0%,rgba(26,58,92,0.78) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 80% at 5% 100%,rgba(212,175,55,0.20) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 720,
            margin: "0 auto",
            textAlign: "center",
            padding: "100px clamp(1.5rem,6vw,4rem)",
            opacity: closingVis ? 1 : 0,
            transform: closingVis ? "translateY(0)" : "translateY(28px)",
            transition:
              "opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 32,
                height: 1.5,
                background: "#d4af37",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 10,
                color: "#d4af37",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Start Your Journey
            </span>
            <div
              style={{
                width: 32,
                height: 1.5,
                background: "#d4af37",
                borderRadius: 2,
              }}
            />
          </div>

          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.2rem,4.5vw,4rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 18,
              textShadow: "0 4px 32px rgba(0,0,0,0.4)",
            }}
          >
            Let's Build Something
            <br />
            <em style={{ color: "#d4af37" }}>Together</em>
          </h2>

          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1rem,1.7vw,1.22rem)",
              fontStyle: "italic",
              color: "rgba(212,175,55,0.85)",
              lineHeight: 1.8,
              marginBottom: 12,
            }}
          >
            Whether you're buying, renting, investing, or managing, we are here
            to make the process seamless, transparent, and rewarding.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.75,
              marginBottom: 36,
              fontStyle: "italic",
            }}
          >
            Your property goals are our priority—and your success is our story.
          </p>

          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "linear-gradient(135deg,#d4af37,#b8960c)",
                color: "#0a1172",
                textDecoration: "none",
                borderRadius: 99,
                padding: "16px 36px",
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                boxShadow: "0 8px 32px rgba(212,175,55,0.40)",
                transition: "all 0.28s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 14px 44px rgba(212,175,55,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(212,175,55,0.40)";
              }}
            >
              Get In Touch <ArrowRight size={15} />
            </a>
            <a
              href="/listings"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "transparent",
                color: "#fff",
                textDecoration: "none",
                borderRadius: 99,
                padding: "16px 36px",
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                border: "1.5px solid rgba(255,255,255,0.28)",
                transition: "all 0.28s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
              }}
            >
              Browse Properties
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
