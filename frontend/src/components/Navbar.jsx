import { useState, useEffect } from "react";
import { MapPin, Mail, Phone, Menu, X } from "lucide-react";
import assets from "../assets/assets";

if (!document.querySelector("#splendor-nav-fonts")) {
  const l = document.createElement("link");
  l.id = "splendor-nav-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap";
  document.head.appendChild(l);
}

const ROYAL = "#0A1172";
const NAVY = "#1A3A5C";
const GOLD = "#D4AF37";
const CREAM = "#EDE8DC";
const OFFWHITE = "#FAFAF8";

const navLinks = [
  { label: "Properties", href: "/listings" },
  { label: "Looking for Land?", href: "/looking-for-a-piece-of-land" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
];

function NavItem({ link, scrolled }) {
  const textColor = scrolled ? "rgba(237,232,220,0.85)" : "#FFFFFF";

  return (
    <div style={{ position: "relative" }}>
      <a
        href={link.href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontFamily: "'Lato', sans-serif",
          fontSize: 12,
          fontWeight: 400,
          letterSpacing: "0.04em",
          color: textColor,
          textDecoration: "none",
          padding: "4px 2px",
          transition: "color 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
        onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
      >
        {link.label}
      </a>
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Always royal blue — slightly deeper shade when scrolled for depth
  const navBg = scrolled ? "#0C1580" : ROYAL;

  return (
    <>
      <style>{`
        @keyframes mobileSlideIn {
          from { opacity:0; transform:translateX(100%); }
          to   { opacity:1; transform:translateX(0); }
        }
        .topbar-link:hover { color: ${GOLD} !important; }
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
        @media (max-width: 640px) {
          .topbar-text { display: none; }
        }
      `}</style>

      <header
        style={{ position: "sticky", top: 0, zIndex: 9000, width: "100%" }}
      >
        {/* ── TOP INFO BAR ── */}
        <div
          style={{
            background: ROYAL,
            padding: "6px clamp(1rem,4vw,3rem)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            borderBottom: `1px solid rgba(212,175,55,0.2)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(12px,3vw,32px)",
              flexWrap: "wrap",
            }}
          >
            {[
              { Icon: MapPin, text: "Senteu Plaza, Kilimani, Nairobi" },
              {
                Icon: Mail,
                text: "sally@splendorholdings.com",
                href: "mailto:sally@splendorholdings.com",
              },
              {
                Icon: Phone,
                text: "+254 725 504 985",
                href: "tel:+254725504985",
              },
            ].map(({ Icon, text, href }, i) =>
              href ? (
                <a
                  key={i}
                  href={href}
                  className="topbar-link"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 11,
                    color: "rgba(237,232,220,0.80)",
                    textDecoration: "none",
                    fontWeight: 300,
                    letterSpacing: "0.03em",
                    transition: "color 0.2s",
                  }}
                >
                  <Icon size={11} strokeWidth={1.8} color={GOLD} />
                  <span className="topbar-text">{text}</span>
                </a>
              ) : (
                <span
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 11,
                    fontFamily: "'Lato', sans-serif",
                    color: "rgba(237,232,220,0.80)",
                    fontWeight: 300,
                    letterSpacing: "0.03em",
                  }}
                >
                  <Icon size={11} strokeWidth={1.8} color={GOLD} />
                  <span className="topbar-text">{text}</span>
                </span>
              ),
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(212,175,55,0.12)",
              border: `1px solid rgba(212,175,55,0.30)`,
              borderRadius: 99,
              padding: "3px 12px",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 0 2px rgba(34,197,94,0.25)",
              }}
            />
            <span
              style={{
                fontFamily: "'Lato'",
                fontSize: 10,
                color: "rgba(237,232,220,0.80)",
                letterSpacing: "0.08em",
              }}
            >
              Open Today · 8AM – 6PM
            </span>
          </div>
        </div>

        {/* ── MAIN NAV BAR ── */}
        <div
          style={{
            background: navBg,
            borderBottom: `1px solid rgba(212,175,55,0.15)`,
            boxShadow: scrolled ? `0 4px 24px rgba(10,17,114,0.35)` : "none",
            transition: "all 0.35s ease",
          }}
        >
          <div
            style={{
              maxWidth: 1440,
              margin: "0 auto",
              padding: "0 clamp(1rem,4vw,3rem)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 60,
            }}
          >
            {/* LEFT NAV */}
            <nav
              className="desktop-nav"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(16px,2vw,30px)",
              }}
            >
              {navLinks.slice(0, 3).map((link, i) => (
                <NavItem key={i} link={link} scrolled={scrolled} />
              ))}
            </nav>

            {/* CENTER LOGO */}
            <a
              href="/"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                flexShrink: 0,
                userSelect: "none",
                padding: "0 clamp(8px,2vw,32px)",
                background: ROYAL,
                height: 60,
                minWidth: 300,
                borderLeft: `1px solid rgba(212,175,55,0.15)`,
                borderRight: `1px solid rgba(212,175,55,0.15)`,
              }}
            >
              <img
                src={assets.logo}
                alt="Splendor Holdings"
                style={{
                  height: 80,
                  width: 200,
                  objectFit: "contain",
                  marginBottom: 4,
                }}
              />
            </a>

            {/* RIGHT NAV */}
            <nav
              className="desktop-nav"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(16px,2vw,30px)",
              }}
            >
              {navLinks.slice(3).map((link, i) => (
                <NavItem key={i} link={link} scrolled={scrolled} />
              ))}

              <a
                href="/authentication"
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  background: "transparent",
                  color: GOLD,
                  textDecoration: "none",
                  padding: "7px 18px",
                  borderRadius: 99,
                  border: `1.5px solid ${GOLD}`,
                  whiteSpace: "nowrap",
                  transition: "all 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = GOLD;
                  e.currentTarget.style.color = ROYAL;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = GOLD;
                }}
              >
                Account
              </a>
            </nav>

            {/* HAMBURGER */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="mobile-hamburger"
              aria-label="Toggle menu"
              style={{
                display: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 6,
                color: "#FFFFFF",
                borderRadius: 8,
                transition: "background 0.2s",
              }}
            >
              {menuOpen ? (
                <X size={22} strokeWidth={1.8} />
              ) : (
                <Menu size={22} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {menuOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 8999 }}>
            <div
              onClick={() => setMenuOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(10,17,114,0.55)",
                backdropFilter: "blur(3px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: "min(320px, 88vw)",
                background: OFFWHITE,
                display: "flex",
                flexDirection: "column",
                animation:
                  "mobileSlideIn 0.32s cubic-bezier(0.22,1,0.36,1) forwards",
                overflowY: "auto",
              }}
            >
              {/* Panel header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderBottom: `1px solid ${CREAM}`,
                  background: ROYAL,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 16,
                      fontWeight: 700,
                      color: OFFWHITE,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Splendor Holdings
                  </span>
                  <span
                    style={{
                      fontFamily: "'Lato'",
                      fontSize: 9,
                      color: GOLD,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      marginTop: 3,
                      fontWeight: 700,
                    }}
                  >
                    Real Estate & Investments
                  </span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: GOLD,
                    padding: 4,
                  }}
                >
                  <X size={20} strokeWidth={1.8} />
                </button>
              </div>

              {/* Nav links */}
              <nav style={{ padding: "8px 0", flex: 1 }}>
                {navLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "block",
                      padding: "12px 20px",
                      fontFamily: "'Lato'",
                      fontSize: 13,
                      fontWeight: 400,
                      color: ROYAL,
                      textDecoration: "none",
                      borderBottom: `1px solid ${CREAM}`,
                      transition: "background 0.2s, color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = CREAM;
                      e.currentTarget.style.color = GOLD;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.color = ROYAL;
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* Mobile CTA */}
              <div
                style={{
                  padding: "16px 20px 28px",
                  borderTop: `1px solid ${CREAM}`,
                }}
              >
                <a
                  href="/listings"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: ROYAL,
                    color: GOLD,
                    textDecoration: "none",
                    borderRadius: 10,
                    border: `1.5px solid ${GOLD}`,
                    padding: "12px 20px",
                    fontFamily: "'Lato'",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  View All Properties
                </a>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {[
                    {
                      Icon: Phone,
                      text: "+254 725 504 985",
                      href: "tel:+254725504985",
                    },
                    {
                      Icon: Mail,
                      text: "sally@splendorholdings.com",
                      href: "mailto:sally@splendorholdings.com",
                    },
                  ].map(({ Icon, text, href }, i) => (
                    <a
                      key={i}
                      href={href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontFamily: "'Lato'",
                        fontSize: 12.5,
                        color: NAVY,
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = ROYAL)
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.color = NAVY)}
                    >
                      <Icon size={14} color={GOLD} strokeWidth={1.8} />
                      {text}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
