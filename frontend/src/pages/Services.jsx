import { useState, useEffect, useRef } from "react";
import {
  Home,
  TrendingUp,
  Key,
  BarChart2,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  Star,
  MapPin,
  CheckCircle,
  Phone,
  Mail,
} from "lucide-react";

if (!document.querySelector("#splendor-services-fonts")) {
  const l = document.createElement("link");
  l.id = "splendor-services-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

/* ── Data ── */
const services = [
  {
    icon: Home,
    tag: "Residential",
    title: "Buying & Selling",
    accent: "#c2884a",
    description:
      "Expert guidance through every stage of your property transaction — from market appraisal to signed transfer documents. We negotiate fiercely on your behalf.",
    features: [
      "Free market valuation",
      "Curated buyer matching",
      "Full legal & conveyancing support",
      "Post-sale handover coordination",
    ],
    stat: "500+",
    statLabel: "Transactions Closed",
  },
  {
    icon: Key,
    tag: "Lettings",
    title: "Renting & Letting",
    accent: "#7B2D8B",
    description:
      "Whether you're a landlord seeking quality tenants or a tenant searching for the perfect lease, our lettings team handles every detail with care.",
    features: [
      "Tenant screening & vetting",
      "Lease drafting & compliance",
      "Rent collection & reconciliation",
      "24/7 maintenance coordination",
    ],
    stat: "98%",
    statLabel: "Tenant Retention Rate",
  },
  {
    icon: TrendingUp,
    tag: "Investment",
    title: "Off-Plan Investment",
    accent: "#0d6e5e",
    description:
      "Access exclusive pre-launch allocations in Nairobi's fastest-growing corridors. Our investment analysts provide data-backed projections and ROI modelling.",
    features: [
      "Exclusive developer partnerships",
      "Staged payment structuring",
      "Capital growth projections",
      "Portfolio diversification advisory",
    ],
    stat: "35%",
    statLabel: "Avg. Capital Appreciation",
  },
  {
    icon: BarChart2,
    tag: "Advisory",
    title: "Property Valuation",
    accent: "#c2410c",
    description:
      "Accurate, RICS-aligned valuations for sale, mortgage, insurance, or inheritance purposes. Delivered within 48 hours with full written reports.",
    features: [
      "Comparable market analysis",
      "Physical site inspection",
      "48-hour turnaround",
      "Bank & legal-grade reports",
    ],
    stat: "48hr",
    statLabel: "Report Turnaround",
  },
  {
    icon: Briefcase,
    tag: "Management",
    title: "Property Management",
    accent: "#1e40af",
    description:
      "End-to-end management of your portfolio — from tenant onboarding to maintenance scheduling — so you enjoy passive income without the headaches.",
    features: [
      "Monthly performance reporting",
      "Vetted contractor network",
      "Proactive vacancy management",
      "Insurance & compliance oversight",
    ],
    stat: "120+",
    statLabel: "Properties Managed",
  },
  {
    icon: ShieldCheck,
    tag: "Premium",
    title: "Concierge & Relocation",
    accent: "#be185d",
    description:
      "A white-glove service for executives, diplomats, and HNW individuals relocating to Nairobi or Mombasa. We handle schools, utilities, and community integration.",
    features: [
      "Airport-to-home logistics",
      "School & lifestyle vetting",
      "Utility & internet setup",
      "Expat community connections",
    ],
    stat: "VIP",
    statLabel: "Dedicated Account Manager",
  },
];

const process = [
  {
    num: "01",
    title: "Initial Consultation",
    body: "A no-obligation call with your dedicated specialist to understand your goals, timeline, and budget.",
  },
  {
    num: "02",
    title: "Tailored Strategy",
    body: "We build a bespoke plan — whether a curated shortlist, investment analysis, or management proposal.",
  },
  {
    num: "03",
    title: "Seamless Execution",
    body: "Our team handles every step: viewings, negotiations, legal due diligence, and paperwork.",
  },
  {
    num: "04",
    title: "Ongoing Support",
    body: "Post-transaction, we remain your long-term property partner — for future moves, valuations, or management.",
  },
];

const testimonials = [
  {
    quote:
      "Splendor found us our dream home in Karen within three weeks. The team was professional, patient, and completely honest.",
    name: "Amina W.",
    role: "Homebuyer, Karen",
    rating: 5,
  },
  {
    quote:
      "Their off-plan advisory paid dividends. The unit we acquired in Westlands appreciated 40% before handover.",
    name: "James O.",
    role: "Investor, Westlands",
    rating: 5,
  },
  {
    quote:
      "As a landlord managing from London, the property management service gives me complete peace of mind.",
    name: "Priya M.",
    role: "Landlord, Kilimani",
    rating: 5,
  },
];

/* ── Hooks ── */
function useReveal(delay = 0) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.12 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis, delay];
}

/* ── Service Card ── */
function ServiceCard({ service, index, visible }) {
  const [hovered, setHovered] = useState(false);
  const Icon = service.icon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 22,
        border: `1.5px solid ${hovered ? service.accent + "55" : "#f0e5d8"}`,
        boxShadow: hovered
          ? `0 24px 64px ${service.accent}22`
          : "0 6px 28px rgba(0,0,0,0.055)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s ease ${index * 80}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${index * 80}ms, border-color 0.3s, box-shadow 0.3s`,
        cursor: "default",
      }}
    >
      {/* Top band */}
      <div
        style={{
          background: hovered
            ? `linear-gradient(120deg, ${service.accent}18, ${service.accent}08)`
            : "#faf6f1",
          padding: "28px 28px 22px",
          borderBottom: `1px solid ${hovered ? service.accent + "22" : "#f5ede4"}`,
          transition: "background 0.35s",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: `${service.accent}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.3s",
            }}
          >
            <Icon size={22} color={service.accent} strokeWidth={1.6} />
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 28,
                fontWeight: 700,
                color: service.accent,
                lineHeight: 1,
              }}
            >
              {service.stat}
            </div>
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#b09070",
                marginTop: 3,
              }}
            >
              {service.statLabel}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "inline-block",
            fontFamily: "'Jost', sans-serif",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: service.accent,
            background: `${service.accent}14`,
            borderRadius: 99,
            padding: "4px 12px",
            marginBottom: 8,
          }}
        >
          {service.tag}
        </div>

        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#1a0d00",
            lineHeight: 1.15,
          }}
        >
          {service.title}
        </h3>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "22px 28px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 13,
            color: "#7a6248",
            fontWeight: 300,
            lineHeight: 1.8,
            marginBottom: 20,
          }}
        >
          {service.description}
        </p>

        <div style={{ flex: 1 }}>
          {service.features.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 9,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: `${service.accent}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckCircle
                  size={10}
                  color={service.accent}
                  strokeWidth={2.5}
                />
              </div>
              <span
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 12.5,
                  color: "#5a4232",
                  fontWeight: 400,
                }}
              >
                {f}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/contact-us"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 22,
            padding: "13px 20px",
            borderRadius: 12,
            border: `1.5px solid ${service.accent}`,
            background: hovered ? service.accent : "transparent",
            color: hovered ? "#fff" : service.accent,
            fontFamily: "'Jost', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "all 0.28s ease",
          }}
        >
          Enquire Now <ArrowRight size={12} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function Services() {
  const [parallax, setParallax] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const fn = () => {
      if (heroRef.current) {
        const top = heroRef.current.getBoundingClientRect().top;
        setParallax(-top * 0.22);
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const [gridRef, gridVis] = useReveal(0);
  const [processRef, processVis] = useReveal(0);
  const [testimonialRef, testimonialVis] = useReveal(0);
  const [ctaRef, ctaVis] = useReveal(0);

  return (
    <div
      style={{
        background: "#fdf6ee",
        minHeight: "100vh",
        fontFamily: "'Jost', sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin     { to { transform:rotate(360deg); } }
        @keyframes shimmer  { 0%{ background-position: -200% 0; } 100%{ background-position: 200% 0; } }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        .process-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1100px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .process-grid  { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 700px) {
          .services-grid     { grid-template-columns: 1fr; }
          .process-grid      { grid-template-columns: 1fr; }
          .testimonial-grid  { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          height: "56vh",
          minHeight: 420,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1800&q=85)",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            transform: `translateY(${parallax}px) scale(1.1)`,
            willChange: "transform",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(125deg,rgba(12,5,0,0.88) 0%,rgba(30,10,0,0.65) 45%,rgba(5,2,0,0.22) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 80% at 5% 100%, rgba(194,136,74,0.28) 0%, transparent 65%)",
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
              marginBottom: 22,
            }}
          >
            <a
              href="/"
              style={{
                fontFamily: "'Jost'",
                fontSize: 11,
                color: "rgba(253,230,138,0.5)",
                textDecoration: "none",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Home
            </a>
            <span style={{ color: "rgba(253,230,138,0.3)" }}>›</span>
            <span
              style={{
                fontFamily: "'Jost'",
                fontSize: 11,
                color: "#F59E0B",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Services
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 40,
                height: 2,
                background: "#F59E0B",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily: "'Jost'",
                fontSize: 11,
                color: "#fde68a",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
              }}
            >
              What We Do
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.8rem,5.5vw,5rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.06,
              marginBottom: 14,
              textShadow: "0 4px 40px rgba(0,0,0,0.5)",
            }}
          >
            Premium Property
            <br />
            <em style={{ color: "#fde68a" }}>Services in Kenya</em>
          </h1>

          {/* Quick-nav pills */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 30,
              flexWrap: "wrap",
            }}
          >
            {["Buying & Selling", "Lettings", "Off-Plan", "Management"].map(
              (label, i) => (
                <a
                  key={i}
                  href={`#${label.toLowerCase().replace(/\s+/g, "-").replace("&", "and")}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(255,255,255,0.10)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 99,
                    padding: "8px 18px",
                    textDecoration: "none",
                    fontFamily: "'Jost'",
                    fontSize: 11.5,
                    color: "#fff",
                    letterSpacing: "0.06em",
                    transition: "all 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.18)";
                    e.currentTarget.style.transform = "scale(1.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <ChevronDown
                    size={10}
                    color="#F59E0B"
                    strokeWidth={3}
                    style={{ transform: "rotate(-90deg)" }}
                  />
                  {label}
                </a>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(2.5rem,5vw,5rem) clamp(1.2rem,4vw,3rem)",
        }}
      >
        {/* Section heading */}
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
                width: 28,
                height: 1.5,
                background: "#F59E0B",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily: "'Jost'",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#b45309",
              }}
            >
              Our Expertise
            </span>
            <div
              style={{
                width: 28,
                height: 1.5,
                background: "#F59E0B",
                borderRadius: 2,
              }}
            />
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem,3.5vw,3rem)",
              fontWeight: 700,
              color: "#1a0d00",
              lineHeight: 1.1,
              marginBottom: 10,
            }}
          >
            Comprehensive Property Solutions
          </h2>
        </div>

        {/* Services grid */}
        <div
          ref={gridRef}
          className="services-grid"
          style={{ marginBottom: 80 }}
        >
          {services.map((s, i) => (
            <ServiceCard key={i} service={s} index={i} visible={gridVis} />
          ))}
        </div>

        {/* ── HOW IT WORKS ── */}
        <div
          style={{
            background: "linear-gradient(148deg, #1c0e02 0%, #2e1800 100%)",
            borderRadius: 24,
            padding: "clamp(36px,5vw,60px) clamp(28px,5vw,56px)",
            marginBottom: 80,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative glows */}
          <div
            style={{
              position: "absolute",
              bottom: -60,
              right: -60,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(245,158,11,0.12) 0%,transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -30,
              left: -30,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(123,45,139,0.10) 0%,transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
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
                    background: "#F59E0B",
                    borderRadius: 2,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Jost'",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "#fde68a",
                  }}
                >
                  The Process
                </span>
                <div
                  style={{
                    width: 28,
                    height: 1.5,
                    background: "#F59E0B",
                    borderRadius: 2,
                  }}
                />
              </div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.8rem,3vw,2.6rem)",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.1,
                }}
              >
                How We Work With You
              </h2>
            </div>

            <div ref={processRef} className="process-grid">
              {process.map((step, i) => (
                <div
                  key={i}
                  style={{
                    opacity: processVis ? 1 : 0,
                    transform: processVis
                      ? "translateY(0)"
                      : "translateY(24px)",
                    transition: `opacity 0.65s ease ${i * 120}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${i * 120}ms`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 52,
                      fontWeight: 700,
                      color: "rgba(245,158,11,0.18)",
                      lineHeight: 1,
                      marginBottom: 8,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {step.num}
                  </div>
                  <div
                    style={{
                      width: 36,
                      height: 2,
                      background: "#F59E0B",
                      borderRadius: 2,
                      marginBottom: 14,
                    }}
                  />
                  <h4
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#fde68a",
                      marginBottom: 10,
                    }}
                  >
                    {step.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 13,
                      color: "rgba(255,225,175,0.65)",
                      fontWeight: 300,
                      lineHeight: 1.8,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TESTIMONIALS ── */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
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
                background: "#F59E0B",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily: "'Jost'",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#b45309",
              }}
            >
              Client Stories
            </span>
            <div
              style={{
                width: 28,
                height: 1.5,
                background: "#F59E0B",
                borderRadius: 2,
              }}
            />
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem,3.5vw,3rem)",
              fontWeight: 700,
              color: "#1a0d00",
              lineHeight: 1.1,
            }}
          >
            Trusted by Hundreds of Clients
          </h2>
        </div>

        <div
          ref={testimonialRef}
          className="testimonial-grid"
          style={{ marginBottom: 80 }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: "30px 28px",
                border: "1.5px solid #f0e5d8",
                boxShadow: "0 6px 28px rgba(0,0,0,0.055)",
                opacity: testimonialVis ? 1 : 0,
                transform: testimonialVis
                  ? "translateY(0)"
                  : "translateY(24px)",
                transition: `opacity 0.65s ease ${i * 120}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${i * 120}ms`,
              }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {[...Array(t.rating)].map((_, si) => (
                  <Star key={si} size={13} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>

              {/* Quote mark */}
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 56,
                  color: "#c2884a",
                  lineHeight: 0.6,
                  marginBottom: 14,
                  opacity: 0.35,
                }}
              >
                "
              </div>

              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16,
                  fontStyle: "italic",
                  color: "#3d2413",
                  lineHeight: 1.75,
                  marginBottom: 20,
                  fontWeight: 400,
                }}
              >
                {t.quote}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderTop: "1px solid #f5ede4",
                  paddingTop: 16,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#c2884a,#7B2D8B)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 16,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Jost'",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1a0d00",
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Jost'",
                      fontSize: 11,
                      color: "#b09070",
                      fontWeight: 300,
                    }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA BAND ── */}
        <div
          ref={ctaRef}
          style={{
            background: "#fff",
            borderRadius: 24,
            border: "1.5px solid #f0e5d8",
            boxShadow: "0 12px 56px rgba(0,0,0,0.07)",
            padding: "clamp(36px,5vw,56px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            opacity: ctaVis ? 1 : 0,
            transform: ctaVis ? "translateY(0)" : "translateY(24px)",
            transition:
              "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Subtle gradient orbs */}
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(194,136,74,0.08) 0%,transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -40,
              left: -40,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(123,45,139,0.06) 0%,transparent 65%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(194,136,74,0.10)",
                borderRadius: 99,
                padding: "6px 18px",
                marginBottom: 20,
              }}
            >
              <MapPin size={11} color="#c2884a" strokeWidth={2.5} />
              <span
                style={{
                  fontFamily: "'Jost'",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#c2884a",
                }}
              >
                Nairobi · Mombasa
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem,3.5vw,3rem)",
                fontWeight: 700,
                color: "#1a0d00",
                lineHeight: 1.1,
                marginBottom: 12,
              }}
            >
              Ready to Take the Next Step?
            </h2>
            <p
              style={{
                fontFamily: "'Jost'",
                fontSize: 14,
                color: "#9a7c5a",
                fontWeight: 300,
                maxWidth: 420,
                margin: "0 auto 32px",
                lineHeight: 1.75,
              }}
            >
              Speak with a dedicated specialist today — no obligations, no
              scripts. Just honest guidance tailored to you.
            </p>

            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <a
                href="/contact-us"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: "linear-gradient(135deg,#c2884a,#7B2D8B)",
                  color: "#fff",
                  borderRadius: 13,
                  padding: "16px 34px",
                  fontFamily: "'Jost'",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  boxShadow: "0 8px 32px rgba(194,136,74,0.30)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.10)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Mail size={14} /> Get in Touch
              </a>
              <a
                href="tel:+254725504985"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: "transparent",
                  color: "#1a0d00",
                  borderRadius: 13,
                  padding: "16px 34px",
                  fontFamily: "'Jost'",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  border: "1.5px solid #e2d5c8",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#c2884a";
                  e.currentTarget.style.color = "#c2884a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2d5c8";
                  e.currentTarget.style.color = "#1a0d00";
                }}
              >
                <Phone size={14} /> Call Us Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
