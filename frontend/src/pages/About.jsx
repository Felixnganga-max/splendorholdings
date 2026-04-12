import { useState, useEffect, useRef } from "react";
import {
  Award,
  Users,
  TrendingUp,
  Heart,
  ArrowRight,
  Star,
  MapPin,
} from "lucide-react";

if (!document.querySelector("#slendor-about-fonts")) {
  const l = document.createElement("link");
  l.id = "slendor-about-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

const stats = [
  { number: "100%", label: "Dedicated to Excellence", icon: Award },
  { number: "2,400+", label: "Families Housed", icon: Users },
  { number: "KES 5B+", label: "Properties Sold", icon: TrendingUp },
  { number: "98%", label: "Client Satisfaction", icon: Heart },
];

const values = [
  {
    title: "Integrity First",
    body: "Every conversation, every contract, every commitment — we hold ourselves to the highest ethical standard. Our clients trust us with life-changing decisions and we honour that deeply.",
    icon: "⚖️",
    accent: "#7B2D8B",
  },
  {
    title: "Market Mastery",
    body: "Deep, boots-on-the-ground knowledge across Kenya's most dynamic property markets — our insights go beyond listings. We see opportunity where others see uncertainty.",
    icon: "📍",
    accent: "#c2884a",
  },
  {
    title: "Personal Touch",
    body: "No scripts. No rush. We listen first. Every client receives a tailored strategy built around their vision, timeline, and budget — whether they're buying a studio or a signature estate.",
    icon: "🤝",
    accent: "#0d6e5e",
  },
  {
    title: "Results Driven",
    body: "We measure success by yours. From first-time buyers to seasoned investors, our singular focus is delivering outcomes that exceed expectations — every single time.",
    icon: "🎯",
    accent: "#c2410c",
  },
];

const team = [
  {
    name: "Amara Osei-Bonsu",
    role: "Founder & CEO",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
    bio: "A lifelong passion for East African real estate. Built Slendor from a single Nairobi office into a regional powerhouse.",
    linkedin: "#",
  },
  {
    name: "James Kariuki",
    role: "Head of Luxury Sales",
    img: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&q=80",
    bio: "Former investment banker turned property specialist. Closed over KES 1.2B in transactions in 2023 alone.",
    linkedin: "#",
  },
  {
    name: "Grace Wanjiku",
    role: "Director, Client Experience",
    img: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&q=80",
    bio: "Champion of client relationships with a philosophy: every family deserves to feel at home before they buy.",
    linkedin: "#",
  },
  {
    name: "David Otieno",
    role: "Head of Investment Advisory",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    bio: "Macro-economist with a keen eye for property cycles. Helps clients build portfolios that compound wealth.",
    linkedin: "#",
  },
];

const milestones = [
  {
    year: "Nairobi",
    event:
      "Our flagship office in Westlands — the beating heart of Slendor, where every deal is crafted with precision and care.",
  },
  {
    year: "Mombasa",
    event:
      "Coast operations spanning Nyali, Bamburi and the Diani corridor — bringing the finest coastal living to life.",
  },
  {
    year: "Kiambu",
    event:
      "Covering Ruaka, Kiambu Road and the Northern Bypass belt — Kenya's fastest-growing residential corridor.",
  },
  {
    year: "Kajiado",
    event:
      "Ongata Rongai, Ngong and Karen — peaceful, expansive living just minutes from the city.",
  },
  {
    year: "Machakos",
    event:
      "Land and investment opportunities in the SGR corridor — a future-facing market with exceptional growth potential.",
  },
  {
    year: "Off-Plan",
    event:
      "Our dedicated off-plan investment division helps clients enter projects early and maximise appreciation.",
  },
  {
    year: "Digital",
    event:
      "Virtual tours, remote closings and real-time market intelligence — buying a home from anywhere in the world.",
  },
];

/* ── Intersection observer hook ── */
function useReveal(threshold = 0.15) {
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

/* ── Counter animation ── */
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
          width: 56,
          height: 56,
          borderRadius: 18,
          background: "rgba(245,158,11,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <Icon size={22} color="#c2884a" strokeWidth={1.6} />
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(2rem,3.5vw,2.8rem)",
          fontWeight: 700,
          color: "#1a0d00",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 12,
          color: "#9a7c5a",
          fontWeight: 400,
          letterSpacing: "0.08em",
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
  const [valuesRef, valuesVis] = useReveal();
  const [timelineRef, timelineVis] = useReveal();
  const [teamRef, teamVis] = useReveal();
  const [closingRef, closingVis] = useReveal();

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

  return (
    <div style={{ background: "#fdf6ee", minHeight: "100vh" }}>
      <style>{`
        @keyframes fadeUp   { from{ opacity:0; transform:translateY(30px); } to{ opacity:1; transform:translateY(0); } }
        @keyframes fadeLeft { from{ opacity:0; transform:translateX(-30px); } to{ opacity:1; transform:translateX(0); } }
        @keyframes fadeRight{ from{ opacity:0; transform:translateX(30px); } to{ opacity:1; transform:translateX(0); } }
        @keyframes scaleIn  { from{ opacity:0; transform:scale(0.94); } to{ opacity:1; transform:scale(1); } }

        .about-story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 32px;
        }
        .values-grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 22px;
        }
        .team-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .stats-grid  { grid-template-columns: repeat(2,1fr); }
          .team-grid   { grid-template-columns: repeat(2,1fr); }
          .about-story-grid { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 640px) {
          .stats-grid  { grid-template-columns: repeat(2,1fr); gap: 20px; }
          .values-grid { grid-template-columns: 1fr; }
          .team-grid   { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ═══════════════════════════
          HERO
      ═══════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          height: "58vh",
          minHeight: 440,
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
            transform: `translateY(${parallax}px) scale(1.1)`,
            willChange: "transform",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg,rgba(12,5,0,0.84) 0%,rgba(42,16,0,0.64) 45%,rgba(3,1,0,0.15) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 65% 80% at 0% 100%,rgba(145,65,5,0.30) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />
        {/* Fine grain texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
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
              About Us
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
              Our Story
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.8rem,5.5vw,5rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.06,
              marginBottom: 16,
              textShadow: "0 4px 40px rgba(0,0,0,0.5)",
            }}
          >
            Built on Trust.
            <br />
            <em style={{ color: "#fde68a" }}>Driven by You.</em>
          </h1>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1rem,1.7vw,1.28rem)",
              fontStyle: "italic",
              color: "rgba(253,230,138,0.82)",
              maxWidth: 480,
              lineHeight: 1.8,
            }}
          >
            Slendor Holdings is Kenya's most trusted name in real estate —
            connecting families, investors, and dreamers with the properties
            that change their lives.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════
          STATS
      ═══════════════════════════ */}
      <section
        ref={statsRef}
        style={{ background: "#fff", padding: "72px clamp(1.5rem,6vw,6rem)" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="stats-grid">
            {stats.map((s, i) => (
              <AnimatedStat key={i} {...s} visible={statsVis} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════
          OUR STORY
      ═══════════════════════════ */}
      <section
        ref={storyRef}
        style={{ padding: "100px clamp(1.5rem,6vw,6rem)" }}
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
              {/* Main image */}
              <div
                style={{
                  borderRadius: 22,
                  overflow: "hidden",
                  height: 420,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85"
                  alt="Slendor property"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              {/* Floating inset image */}
              <div
                style={{
                  position: "absolute",
                  bottom: -28,
                  right: -28,
                  width: 200,
                  height: 160,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "5px solid #fdf6ee",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=400&q=80"
                  alt="Interior"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              {/* Amber badge */}
              <div
                style={{
                  position: "absolute",
                  top: 24,
                  left: -20,
                  background: "linear-gradient(135deg,#F59E0B,#b45309)",
                  borderRadius: 14,
                  padding: "16px 20px",
                  boxShadow: "0 8px 28px rgba(245,158,11,0.35)",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  KES 5B+
                </div>
                <div
                  style={{
                    fontFamily: "'Jost'",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.85)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginTop: 3,
                  }}
                >
                  Properties
                  <br />
                  Sold
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
                  Who We Are
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem,3.5vw,3rem)",
                  fontWeight: 700,
                  color: "#1a0d00",
                  lineHeight: 1.12,
                  marginBottom: 22,
                }}
              >
                Kenya's Premier
                <br />
                Real Estate Partner
              </h2>

              <p
                style={{
                  fontFamily: "'Jost'",
                  fontSize: 14,
                  color: "#5a4535",
                  lineHeight: 1.9,
                  fontWeight: 300,
                  marginBottom: 18,
                }}
              >
                Slendor Holdings was born from a simple belief: that finding a
                home should feel as joyful as living in one. What began as a
                boutique agency in Westlands, Nairobi has grown into East
                Africa's most respected real estate firm — one family, one
                property at a time.
              </p>
              <p
                style={{
                  fontFamily: "'Jost'",
                  fontSize: 14,
                  color: "#5a4535",
                  lineHeight: 1.9,
                  fontWeight: 300,
                  marginBottom: 28,
                }}
              >
                We operate across Kenya's most dynamic markets — from Karen's
                leafy avenues to Mombasa's coastal retreats. Our team of 40+
                dedicated specialists brings together deep local knowledge,
                rigorous market analysis, and an unwavering commitment to
                delivering outcomes that exceed expectations.
              </p>

              {/* Mini stat row */}
              <div
                style={{
                  display: "flex",
                  gap: 28,
                  marginBottom: 32,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { num: "7", label: "Counties" },
                  { num: "40+", label: "Specialists" },
                  { num: "9", label: "Property Types" },
                ].map((s, i) => (
                  <div key={i}>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#c2884a",
                        lineHeight: 1,
                      }}
                    >
                      {s.num}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Jost'",
                        fontSize: 11,
                        color: "#9a7c5a",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginTop: 4,
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="/listings"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: "linear-gradient(135deg,#c2884a,#7B2D8B)",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: 99,
                  padding: "14px 30px",
                  fontFamily: "'Jost'",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  boxShadow: "0 8px 28px rgba(194,136,74,0.28)",
                  transition: "all 0.28s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.10)";
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

      {/* ═══════════════════════════
          VALUES
      ═══════════════════════════ */}
      <section
        ref={valuesRef}
        style={{ background: "#fff", padding: "96px clamp(1.5rem,6vw,6rem)" }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
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
                What We Stand For
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
              Our Core Values
            </h2>
          </div>

          <div className="values-grid">
            {values.map((v, i) => (
              <div
                key={i}
                style={{
                  background: "#fdfaf6",
                  border: "1.5px solid #f0e5d8",
                  borderRadius: 20,
                  padding: "32px 28px",
                  opacity: valuesVis ? 1 : 0,
                  transform: valuesVis ? "translateY(0)" : "translateY(28px)",
                  transition: `opacity 0.7s ease ${i * 100}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.045)",
                  transition: `opacity 0.7s ease ${i * 100}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms, box-shadow 0.3s ease`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(0,0,0,0.10)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 20px rgba(0,0,0,0.045)";
                  e.currentTarget.style.transform = valuesVis
                    ? "translateY(0)"
                    : "translateY(28px)";
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 18 }}>{v.icon}</div>
                <div
                  style={{
                    width: 36,
                    height: 3,
                    background: v.accent,
                    borderRadius: 2,
                    marginBottom: 16,
                  }}
                />
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#1a0d00",
                    marginBottom: 12,
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Jost'",
                    fontSize: 13.5,
                    color: "#5a4535",
                    lineHeight: 1.85,
                    fontWeight: 300,
                  }}
                >
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════
          TIMELINE
      ═══════════════════════════ */}
      <section
        ref={timelineRef}
        style={{
          padding: "96px clamp(1.5rem,6vw,6rem)",
          background: "linear-gradient(160deg,#fdf6ee 0%,#fef9f3 100%)",
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
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
                Our Journey
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
              A Legacy of Results
            </h2>
          </div>

          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: 2,
                transform: "translateX(-50%)",
                background:
                  "linear-gradient(180deg,#F59E0B 0%,rgba(245,158,11,0.15) 100%)",
              }}
            />

            {milestones.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isLeft ? "flex-end" : "flex-start",
                    paddingRight: isLeft ? "calc(50% + 24px)" : 0,
                    paddingLeft: isLeft ? 0 : "calc(50% + 24px)",
                    marginBottom: 36,
                    opacity: timelineVis ? 1 : 0,
                    transform: timelineVis
                      ? "translateX(0)"
                      : `translateX(${isLeft ? -20 : 20}px)`,
                    transition: `opacity 0.65s ease ${i * 90}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${i * 90}ms`,
                  }}
                >
                  {/* Dot */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#F59E0B",
                      border: "3px solid #fdf6ee",
                      boxShadow: "0 0 0 3px rgba(245,158,11,0.25)",
                      marginTop: 14,
                      zIndex: 2,
                    }}
                  />

                  <div
                    style={{
                      background: "#fff",
                      border: "1.5px solid #f0e5d8",
                      borderRadius: 16,
                      padding: "16px 22px",
                      maxWidth: 300,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#c2884a",
                        marginBottom: 4,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {m.year}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Jost'",
                        fontSize: 13,
                        color: "#5a4535",
                        lineHeight: 1.7,
                        fontWeight: 300,
                      }}
                    >
                      {m.event}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════
          TEAM
      ═══════════════════════════ */}
      <section
        ref={teamRef}
        style={{ background: "#fff", padding: "96px clamp(1.5rem,6vw,6rem)" }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
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
                The People Behind It
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
              Meet Our Team
            </h2>
            <p
              style={{
                fontFamily: "'Jost'",
                fontSize: 14,
                color: "#9a7c5a",
                fontWeight: 300,
                maxWidth: 400,
                margin: "0 auto",
                lineHeight: 1.75,
              }}
            >
              Passionate specialists united by one goal — finding you the
              perfect property
            </p>
          </div>

          <div className="team-grid">
            {team.map((member, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#fdfaf6",
                  border: "1.5px solid #f0e5d8",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  opacity: teamVis ? 1 : 0,
                  transform: teamVis ? "translateY(0)" : "translateY(32px)",
                  transition: `opacity 0.7s ease ${i * 110}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 110}ms, box-shadow 0.3s ease`,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 20px 56px rgba(0,0,0,0.12)";
                  e.currentTarget.style.transform = "translateY(-6px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 20px rgba(0,0,0,0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Photo */}
                <div
                  style={{
                    position: "relative",
                    height: 240,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={member.img}
                    alt={member.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top",
                      transition: "transform 0.6s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.06)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg,transparent 55%,rgba(10,4,0,0.55) 100%)",
                    }}
                  />
                </div>
                {/* Info */}
                <div style={{ padding: "20px 20px 22px" }}>
                  <div
                    style={{
                      width: 28,
                      height: 2.5,
                      background: "#c2884a",
                      borderRadius: 2,
                      marginBottom: 12,
                    }}
                  />
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#1a0d00",
                      marginBottom: 4,
                    }}
                  >
                    {member.name}
                  </h3>
                  <div
                    style={{
                      fontFamily: "'Jost'",
                      fontSize: 11,
                      color: "#c2884a",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    {member.role}
                  </div>
                  <p
                    style={{
                      fontFamily: "'Jost'",
                      fontSize: 12.5,
                      color: "#7a6045",
                      lineHeight: 1.75,
                      fontWeight: 300,
                    }}
                  >
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════
          CLOSING CTA
      ═══════════════════════════ */}
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
              "linear-gradient(120deg,rgba(12,5,0,0.88) 0%,rgba(40,16,2,0.70) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 80% at 5% 100%,rgba(140,60,5,0.32) 0%,transparent 65%)",
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
                background: "#F59E0B",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily: "'Jost'",
                fontSize: 10,
                color: "#fde68a",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Start Your Journey
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
              fontSize: "clamp(2.2rem,4.5vw,4rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 18,
              textShadow: "0 4px 32px rgba(0,0,0,0.4)",
            }}
          >
            Ready to Find
            <br />
            <em style={{ color: "#fde68a" }}>Your Dream Home?</em>
          </h2>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1rem,1.7vw,1.25rem)",
              fontStyle: "italic",
              color: "rgba(253,230,138,0.80)",
              lineHeight: 1.8,
              marginBottom: 36,
            }}
          >
            Thousands of Kenyan families have found their perfect home through
            Slendor Holdings. Your story starts with one conversation.
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
                background: "linear-gradient(135deg,#F59E0B,#b45309)",
                color: "#1a0800",
                textDecoration: "none",
                borderRadius: 99,
                padding: "16px 36px",
                fontFamily: "'Jost'",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                boxShadow: "0 8px 32px rgba(245,158,11,0.40)",
                transition: "all 0.28s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 14px 44px rgba(245,158,11,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(245,158,11,0.40)";
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
                fontFamily: "'Jost'",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "1.5px solid rgba(255,255,255,0.25)",
                transition: "all 0.28s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
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
