import { useState, useEffect, useRef } from "react";
import { MapPin, Mail, Phone, Menu, X, ChevronDown } from "lucide-react";

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
const DARK = "#0D0D0D";

const navLinks = [
  { label: "Properties", href: "/listings" },
  { label: "Buy & Sell", href: "#" },
  { label: "Rentals", href: "#" },
  {
    label: "Services",
    href: "#",
    children: [
      { label: "Property Management", href: "#" },
      { label: "Investment Advisory", href: "#" },
      { label: "Valuations", href: "#" },
    ],
  },
  { label: "About", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
];

function Dropdown({ items, visible }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 14px)",
        left: "50%",
        transform: visible
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(-10px)",
        background: OFFWHITE,
        borderRadius: 12,
        boxShadow: "0 20px 60px rgba(10,17,114,0.14)",
        border: `1px solid ${CREAM}`,
        minWidth: 210,
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition:
          "opacity 0.22s ease, transform 0.22s cubic-bezier(0.22,1,0.36,1)",
        zIndex: 100,
      }}
    >
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg,${ROYAL},${GOLD})`,
        }}
      />
      {items.map((item, i) => (
        <a
          key={i}
          href={item.href}
          style={{
            display: "block",
            padding: "11px 20px",
            fontFamily: "'Lato', sans-serif",
            fontSize: 12.5,
            fontWeight: 400,
            color: NAVY,
            textDecoration: "none",
            borderBottom: i < items.length - 1 ? `1px solid ${CREAM}` : "none",
            transition: "background 0.18s, color 0.18s, padding-left 0.18s",
            letterSpacing: "0.03em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = CREAM;
            e.currentTarget.style.color = ROYAL;
            e.currentTarget.style.paddingLeft = "28px";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = NAVY;
            e.currentTarget.style.paddingLeft = "20px";
          }}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}

function NavItem({ link, scrolled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const textColor = scrolled ? NAVY : ROYAL;

  return (
    <div
      ref={ref}
      style={{ position: "relative" }}
      onMouseEnter={() => link.children && setOpen(true)}
      onMouseLeave={() => link.children && setOpen(false)}
    >
      <a
        href={link.href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontFamily: "'Lato', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.11em",
          textTransform: "uppercase",
          color: textColor,
          textDecoration: "none",
          padding: "6px 2px",
          position: "relative",
          transition: "color 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
        onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
      >
        {link.label}
        {link.children && (
          <ChevronDown
            size={11}
            strokeWidth={2.5}
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.25s ease",
              color: GOLD,
            }}
          />
        )}
        <span
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1.5,
            borderRadius: 2,
            background: GOLD,
            transform: open ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left",
            transition: "transform 0.25s ease",
          }}
        />
      </a>
      {link.children && <Dropdown items={link.children} visible={open} />}
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMobile, setOpenMobile] = useState(null);

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
            padding: "7px clamp(1rem,4vw,3rem)",
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
              { Icon: MapPin, text: "14 Riverside Drive, Westlands, Nairobi" },
              {
                Icon: Mail,
                text: "info@splendorholdings.com",
                href: "mailto:info@splendorholdings.com",
              },
              {
                Icon: Phone,
                text: "+254 700 123 456",
                href: "tel:+254700123456",
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
                    fontSize: 11.5,
                    color: "rgba(237,232,220,0.80)",
                    textDecoration: "none",
                    fontWeight: 300,
                    letterSpacing: "0.03em",
                    transition: "color 0.2s",
                  }}
                >
                  <Icon size={12} strokeWidth={1.8} color={GOLD} />
                  <span className="topbar-text">{text}</span>
                </a>
              ) : (
                <span
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 11.5,
                    fontFamily: "'Lato', sans-serif",
                    color: "rgba(237,232,220,0.80)",
                    fontWeight: 300,
                    letterSpacing: "0.03em",
                  }}
                >
                  <Icon size={12} strokeWidth={1.8} color={GOLD} />
                  <span className="topbar-text">{text}</span>
                </span>
              ),
            )}
          </div>

          {/* Open badge */}
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
                fontSize: 10.5,
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
            background: scrolled ? `rgba(250,250,248,0.97)` : OFFWHITE,
            backdropFilter: scrolled ? "blur(12px)" : "none",
            borderBottom: `1px solid ${CREAM}`,
            boxShadow: scrolled
              ? `0 4px 32px rgba(10,17,114,0.08)`
              : `0 1px 0 rgba(10,17,114,0.04)`,
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
              height: 72,
            }}
          >
            {/* LEFT NAV */}
            <nav
              className="desktop-nav"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(16px,2.5vw,36px)",
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
                textDecoration: "none",
                flexShrink: 0,
                userSelect: "none",
                padding: "0 clamp(8px,2vw,32px)",
              }}
            >
              {/* Royal crown SVG mark */}
              <svg
                width="38"
                height="36"
                viewBox="0 0 48 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginBottom: 5 }}
              >
                {/* Base building */}
                <rect x="19" y="12" width="10" height="30" fill={ROYAL} />
                <rect
                  x="9"
                  y="20"
                  width="10"
                  height="22"
                  fill={ROYAL}
                  opacity="0.65"
                />
                <rect
                  x="29"
                  y="20"
                  width="10"
                  height="22"
                  fill={ROYAL}
                  opacity="0.65"
                />
                <rect
                  x="2"
                  y="28"
                  width="7"
                  height="14"
                  fill={ROYAL}
                  opacity="0.30"
                />
                <rect
                  x="39"
                  y="28"
                  width="7"
                  height="14"
                  fill={ROYAL}
                  opacity="0.30"
                />
                {/* Gold spire */}
                <rect x="23" y="0" width="2" height="14" fill={GOLD} />
                <polygon points="24,0 21,8 27,8" fill={GOLD} />
                {/* Gold accent band */}
                <rect
                  x="19"
                  y="12"
                  width="10"
                  height="2.5"
                  fill={GOLD}
                  opacity="0.6"
                />
              </svg>

              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(13px,1.4vw,15px)",
                  fontWeight: 700,
                  letterSpacing: "0.20em",
                  textTransform: "uppercase",
                  color: ROYAL,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                Splendor Holdings
              </span>
              <span
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 8,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: GOLD,
                  marginTop: 4,
                  whiteSpace: "nowrap",
                  fontWeight: 700,
                }}
              >
                — Real Estate & Investments —
              </span>
            </a>

            {/* RIGHT NAV */}
            <nav
              className="desktop-nav"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(16px,2.5vw,36px)",
              }}
            >
              {navLinks.slice(3).map((link, i) => (
                <NavItem key={i} link={link} scrolled={scrolled} />
              ))}
              {/* CTA */}
              <a
                href="/authentication"
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  background: ROYAL,
                  color: GOLD,
                  textDecoration: "none",
                  padding: "9px 22px",
                  borderRadius: 99,
                  border: `1.5px solid ${GOLD}`,
                  whiteSpace: "nowrap",
                  boxShadow: `0 4px 16px rgba(10,17,114,0.18)`,
                  transition: "all 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = GOLD;
                  e.currentTarget.style.color = ROYAL;
                  e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = ROYAL;
                  e.currentTarget.style.color = GOLD;
                  e.currentTarget.style.transform = "scale(1)";
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
                color: ROYAL,
                borderRadius: 8,
                transition: "background 0.2s",
              }}
            >
              {menuOpen ? (
                <X size={24} strokeWidth={1.8} />
              ) : (
                <Menu size={24} strokeWidth={1.8} />
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
                width: "min(340px, 88vw)",
                background: OFFWHITE,
                boxShadow: "-8px 0 48px rgba(10,17,114,0.18)",
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
                  padding: "20px 22px 16px",
                  borderBottom: `1px solid ${CREAM}`,
                  background: ROYAL,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 17,
                      fontWeight: 700,
                      color: OFFWHITE,
                      letterSpacing: "0.14em",
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
                  <X size={22} strokeWidth={1.8} />
                </button>
              </div>

              {/* Nav links */}
              <nav style={{ padding: "10px 0", flex: 1 }}>
                {navLinks.map((link, i) => (
                  <div key={i}>
                    {link.children ? (
                      <>
                        <button
                          onClick={() =>
                            setOpenMobile(openMobile === i ? null : i)
                          }
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "13px 22px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "'Lato'",
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: "0.10em",
                            textTransform: "uppercase",
                            color: ROYAL,
                            borderBottom: `1px solid ${CREAM}`,
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = CREAM)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "none")
                          }
                        >
                          {link.label}
                          <ChevronDown
                            size={14}
                            strokeWidth={2}
                            color={GOLD}
                            style={{
                              transform:
                                openMobile === i
                                  ? "rotate(180deg)"
                                  : "rotate(0)",
                              transition: "transform 0.25s",
                            }}
                          />
                        </button>
                        <div
                          style={{
                            maxHeight:
                              openMobile === i
                                ? `${link.children.length * 46}px`
                                : 0,
                            overflow: "hidden",
                            transition:
                              "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
                            background: CREAM,
                          }}
                        >
                          {link.children.map((child, ci) => (
                            <a
                              key={ci}
                              href={child.href}
                              onClick={() => setMenuOpen(false)}
                              style={{
                                display: "block",
                                padding: "11px 36px",
                                fontFamily: "'Lato'",
                                fontSize: 12.5,
                                color: NAVY,
                                textDecoration: "none",
                                borderBottom: `1px solid rgba(10,17,114,0.08)`,
                                letterSpacing: "0.03em",
                                transition: "color 0.2s, padding-left 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = ROYAL;
                                e.currentTarget.style.paddingLeft = "44px";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = NAVY;
                                e.currentTarget.style.paddingLeft = "36px";
                              }}
                            >
                              {child.label}
                            </a>
                          ))}
                        </div>
                      </>
                    ) : (
                      <a
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: "block",
                          padding: "13px 22px",
                          fontFamily: "'Lato'",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: "0.10em",
                          textTransform: "uppercase",
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
                    )}
                  </div>
                ))}
              </nav>

              {/* Mobile CTA */}
              <div
                style={{
                  padding: "20px 22px 32px",
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
                    borderRadius: 12,
                    border: `1.5px solid ${GOLD}`,
                    padding: "14px 24px",
                    fontFamily: "'Lato'",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 16,
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
                      text: "+254 700 123 456",
                      href: "tel:+254700123456",
                    },
                    {
                      Icon: Mail,
                      text: "info@splendorholdings.com",
                      href: "mailto:info@splendorholdings.com",
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
