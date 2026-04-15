import { useState, useEffect, useRef } from "react";
import { MapPin, Phone, Mail, ArrowUpRight, ChevronRight } from "lucide-react";

/* ── Fonts ── */
if (!document.querySelector("#splendor-fonts-footer")) {
  const l = document.createElement("link");
  l.id = "splendor-fonts-footer";
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

const quickLinks = [
  { label: "Our Properties", href: "/listings" },
  { label: "Buy a Home", href: "/listings" },
  { label: "Rent a Property", href: "/listings" },
  { label: "Off-Plan Projects", href: "/listings" },
  { label: "Property Valuation", href: "/contact" },
  { label: "Investment Advisory", href: "/contact" },
];

const propertyTypes = [
  { label: "Villas & Estates", href: "/listings" },
  { label: "Apartments", href: "/listings" },
  { label: "Townhouses", href: "/listings" },
  { label: "Maisonettes", href: "/listings" },
  { label: "Land & Plots", href: "/listings" },
  { label: "Penthouses", href: "/listings" },
];

const company = [
  { label: "About Splendor", href: "/about" },
  { label: "Our Team", href: "/team" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "News & Insights", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact Us", href: "/contact" },
];

const socials = [
  {
    label: "Facebook",
    href: "#",
    bg: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.931-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    bg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    bg: "#0A66C2",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
        <path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.984V9h3.102v1.561h.046c.432-.817 1.487-1.678 3.061-1.678 3.274 0 3.878 2.155 3.878 4.958v6.611zM5.337 7.433a1.804 1.804 0 110-3.608 1.804 1.804 0 010 3.608zm1.554 13.019H3.783V9h3.108v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "#",
    bg: "#14171A",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    bg: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    bg: "#010101",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.84a8.2 8.2 0 004.79 1.53V6.93a4.85 4.85 0 01-1.02-.24z" />
      </svg>
    ),
  },
];

function LinkCol({ heading, links }) {
  return (
    <div>
      <h4
        style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: C.accent,
          marginBottom: 22,
        }}
      >
        {heading}
      </h4>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {links.map((l, i) => (
          <li key={i}>
            <a
              href={l.href}
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 13,
                fontWeight: 300,
                color: "rgba(250,250,248,0.55)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "color 0.2s, gap 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = C.white;
                e.currentTarget.style.gap = "10px";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(250,250,248,0.55)";
                e.currentTarget.style.gap = "6px";
              }}
            >
              <ChevronRight size={11} style={{ flexShrink: 0, opacity: 0.4 }} />
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [scrollPct, setScrollPct] = useState(0);
  const [visible, setVisible] = useState(false);
  const year = new Date().getFullYear();

  /* Scroll progress for back-to-top ring */
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const pct = doc.scrollTop / (doc.scrollHeight - doc.clientHeight);
      setScrollPct(isNaN(pct) ? 0 : pct);
      setVisible(doc.scrollTop > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const R = 20;
  const circ = 2 * Math.PI * R;
  const dash = circ * scrollPct;

  return (
    <>
      <style>{`
        .sp-footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
        }
        .sp-footer-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .sp-legal-links { display: flex; gap: 24px; flex-wrap: wrap; }
        @media (max-width: 1100px) {
          .sp-footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
        }
        @media (max-width: 640px) {
          .sp-footer-grid { grid-template-columns: 1fr; gap: 28px; }
          .sp-footer-bottom-row { flex-direction: column; align-items: flex-start; }
        }
        .sp-cta-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: ${C.accent};
          color: ${C.black};
          font-family: 'Lato', sans-serif;
          font-size: 11px; font-weight: 900;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 15px 30px; border-radius: 2px;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .sp-cta-primary:hover { background: #c9a22e; }
        .sp-cta-secondary {
          display: inline-flex; align-items: center; gap: 10px;
          background: transparent;
          color: ${C.white};
          font-family: 'Lato', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 15px 30px; border-radius: 2px;
          text-decoration: none;
          border: 1.5px solid rgba(250,250,248,0.25);
          transition: all 0.25s ease;
        }
        .sp-cta-secondary:hover {
          border-color: rgba(250,250,248,0.6);
          background: rgba(250,250,248,0.05);
        }
        .sp-social {
          width: 34px; height: 34px; border-radius: 2px;
          background: rgba(250,250,248,0.06);
          border: 1px solid rgba(250,250,248,0.1);
          display: flex; align-items: center; justify-content: center;
          text-decoration: none;
          transition: all 0.22s ease;
        }
        .sp-social:hover { transform: translateY(-3px); }
        .sp-legal-link {
          font-family: 'Lato', sans-serif;
          font-size: 11px;
          color: rgba(250,250,248,0.3);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .sp-legal-link:hover { color: ${C.accent}; }
      `}</style>

      <footer
        style={{
          background: C.primary,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gold top border */}
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

        {/* Subtle vertical lines */}
        {[20, 45, 70].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${pos}%`,
              width: 1,
              background: "rgba(255,255,255,0.03)",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* ══ CTA BANNER ══ */}
        <div
          style={{
            borderBottom: "1px solid rgba(250,250,248,0.08)",
            padding: "64px clamp(1.5rem, 6vw, 6rem)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 32,
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ width: 36, height: 1.5, background: C.accent }} />
              <span
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: C.accent,
                }}
              >
                Ready to Begin?
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                fontWeight: 700,
                color: C.white,
                lineHeight: 1.15,
                marginBottom: 14,
              }}
            >
              Your Perfect Property
              <br />
              <em style={{ color: C.accent, fontStyle: "italic" }}>
                Is One Call Away
              </em>
            </h2>
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 14,
                fontWeight: 300,
                color: "rgba(250,250,248,0.55)",
                lineHeight: 1.8,
              }}
            >
              Over KES 5 billion in properties sold. Join thousands of happy
              homeowners who found their dream home through Splendor Holdings.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/contact" className="sp-cta-primary">
              Get In Touch <ArrowUpRight size={15} />
            </a>
            <a href="/listings" className="sp-cta-secondary">
              View All Listings
            </a>
          </div>
        </div>

        {/* ══ MAIN BODY ══ */}
        <div style={{ padding: "64px clamp(1.5rem, 6vw, 6rem) 0" }}>
          <div className="sp-footer-grid">
            {/* Brand column */}
            <div>
              {/* Logo mark */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: 24,
                }}
              >
                <svg
                  width="38"
                  height="42"
                  viewBox="0 0 48 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginBottom: 10 }}
                >
                  <rect x="20" y="6" width="8" height="44" fill={C.accent} />
                  <rect
                    x="10"
                    y="16"
                    width="10"
                    height="34"
                    fill={C.accent}
                    opacity="0.65"
                  />
                  <rect
                    x="28"
                    y="16"
                    width="10"
                    height="34"
                    fill={C.accent}
                    opacity="0.65"
                  />
                  <rect
                    x="3"
                    y="26"
                    width="7"
                    height="24"
                    fill={C.accent}
                    opacity="0.35"
                  />
                  <rect
                    x="38"
                    y="26"
                    width="7"
                    height="24"
                    fill={C.accent}
                    opacity="0.35"
                  />
                  <rect x="23" y="0" width="2" height="8" fill={C.accent} />
                </svg>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: C.white,
                    lineHeight: 1,
                  }}
                >
                  Splendor Holdings
                </span>
                <span
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 9,
                    fontWeight: 400,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: `${C.accent}99`,
                    marginTop: 5,
                  }}
                >
                  — Real Estate & Investments —
                </span>
              </div>

              <p
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 13,
                  fontWeight: 300,
                  color: "rgba(250,250,248,0.5)",
                  lineHeight: 1.85,
                  marginBottom: 28,
                  maxWidth: 320,
                }}
              >
                Kenya's most trusted real estate partner since 2005. We connect
                discerning buyers, sellers, and investors with exceptional
                properties across East Africa's most coveted locations.
              </p>

              {/* Contact info */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 28,
                }}
              >
                {[
                  {
                    Icon: MapPin,
                    text: "14 Riverside Drive, Westlands, Nairobi",
                  },
                  {
                    Icon: Phone,
                    text: "+254 700 123 456",
                    href: "tel:+254700123456",
                  },
                  {
                    Icon: Mail,
                    text: "info@splendorholdings.com",
                    href: "mailto:info@splendorholdings.com",
                  },
                ].map(({ Icon, text, href }, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 2,
                        background: `${C.accent}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <Icon size={13} color={C.accent} strokeWidth={1.8} />
                    </div>
                    {href ? (
                      <a
                        href={href}
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontSize: 12,
                          fontWeight: 300,
                          color: "rgba(250,250,248,0.5)",
                          textDecoration: "none",
                          lineHeight: 1.6,
                          paddingTop: 5,
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = C.accent)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color =
                            "rgba(250,250,248,0.5)")
                        }
                      >
                        {text}
                      </a>
                    ) : (
                      <span
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontSize: 12,
                          fontWeight: 300,
                          color: "rgba(250,250,248,0.5)",
                          lineHeight: 1.6,
                          paddingTop: 5,
                        }}
                      >
                        {text}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Socials */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    title={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sp-social"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = s.bg;
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(250,250,248,0.06)";
                      e.currentTarget.style.borderColor =
                        "rgba(250,250,248,0.1)";
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <LinkCol heading="Quick Links" links={quickLinks} />
            <LinkCol heading="Property Types" links={propertyTypes} />
            <LinkCol heading="Company" links={company} />
          </div>
        </div>

        {/* ══ BOTTOM BAR ══ */}
        <div
          style={{
            borderTop: "1px solid rgba(250,250,248,0.08)",
            padding: "20px clamp(1.5rem, 6vw, 6rem)",
            marginTop: 48,
          }}
        >
          <div className="sp-footer-bottom-row">
            <span
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 12,
                fontWeight: 300,
                color: "rgba(250,250,248,0.3)",
              }}
            >
              © {year} Splendor Holdings Ltd. All rights reserved. · Licensed
              Real Estate Agents, Kenya
            </span>

            <div className="sp-legal-links">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Cookie Policy",
                "Sitemap",
              ].map((t, i) => (
                <a key={i} href="#" className="sp-legal-link">
                  {t}
                </a>
              ))}
            </div>

            <span
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 11,
                fontWeight: 300,
                color: "rgba(250,250,248,0.2)",
              }}
            >
              Crafted with care in Nairobi 🇰🇪
            </span>
          </div>
        </div>
      </footer>

      {/* ── Scroll-to-top ── */}
      <button
        onClick={scrollTop}
        style={{
          position: "fixed",
          bottom: 90,
          right: 16,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: C.primary,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(10,17,114,0.4)",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.7)",
          transition:
            "opacity 0.35s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          zIndex: 40,
        }}
      >
        <svg
          width="48"
          height="48"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "rotate(-90deg)",
          }}
        >
          <circle
            cx="24"
            cy="24"
            r={R}
            fill="none"
            stroke={`${C.accent}22`}
            strokeWidth="2.5"
          />
          <circle
            cx="24"
            cy="24"
            r={R}
            fill="none"
            stroke={C.accent}
            strokeWidth="2.5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.2s ease" }}
          />
        </svg>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "relative", zIndex: 1 }}
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </>
  );
}
