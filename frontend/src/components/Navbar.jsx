import { useState, useEffect, useRef } from "react";
import { MapPin, Mail, Phone, Menu, X, ChevronDown } from "lucide-react";

/* ── Fonts ── */
if (!document.querySelector("#slendor-nav-fonts")) {
  const l = document.createElement("link");
  l.id = "slendor-nav-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

const navLinks = [
  {
    label: "Properties",
    href: "/listings",
    children: [
      { label: "All Listings", href: "/listings" },
      { label: "Villas & Estates", href: "/listings" },
      { label: "Apartments", href: "/listings" },
      { label: "Townhouses", href: "/listings" },
      { label: "Land & Plots", href: "/listings" },
      { label: "Off-Plan Projects", href: "/listings" },
    ],
  },
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

/* ── Dropdown menu ── */
function Dropdown({ items, visible }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 16px 56px rgba(0,0,0,0.13)",
        border: "1px solid #f0e8df",
        minWidth: 200,
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(-8px)",
        transition:
          "opacity 0.22s ease, transform 0.22s cubic-bezier(0.22,1,0.36,1)",
        zIndex: 100,
      }}
    >
      {/* amber top line */}
      <div
        style={{
          height: 2,
          background: "linear-gradient(90deg,#F59E0B,#c2884a)",
        }}
      />
      {items.map((item, i) => (
        <a
          key={i}
          href={item.href}
          style={{
            display: "block",
            padding: "11px 20px",
            fontFamily: "'Jost', sans-serif",
            fontSize: 12.5,
            fontWeight: 400,
            color: "#3d2c1a",
            textDecoration: "none",
            borderBottom: i < items.length - 1 ? "1px solid #faf4ee" : "none",
            transition: "background 0.18s, color 0.18s, padding 0.18s",
            letterSpacing: "0.03em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fdf8f2";
            e.currentTarget.style.color = "#c2884a";
            e.currentTarget.style.paddingLeft = "26px";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#3d2c1a";
            e.currentTarget.style.paddingLeft = "20px";
          }}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}

/* ── Nav link with optional dropdown ── */
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

  const color = scrolled ? "#3d2c1a" : "#1a0d00";

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
          fontFamily: "'Jost', sans-serif",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: color,
          textDecoration: "none",
          padding: "6px 2px",
          position: "relative",
          transition: "color 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#c2884a")}
        onMouseLeave={(e) => (e.currentTarget.style.color = color)}
      >
        {link.label}
        {link.children && (
          <ChevronDown
            size={11}
            strokeWidth={2}
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.25s ease",
              color: "#c2884a",
            }}
          />
        )}
        {/* Underline hover effect */}
        <span
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1.5,
            borderRadius: 2,
            background: "linear-gradient(90deg,#F59E0B,#c2884a)",
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
  const [openMobile, setOpenMobile] = useState(null); // index of open mobile accordion

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes mobileSlideIn {
          from { opacity:0; transform:translateX(100%); }
          to   { opacity:1; transform:translateX(0); }
        }
        .nav-topbar-link:hover { color: #F59E0B !important; }
      `}</style>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9000,
          width: "100%",
          fontFamily: "'Jost', sans-serif",
        }}
      >
        {/* ══════════════════════
            TOP INFO BAR
        ══════════════════════ */}
        <div
          style={{
            background: scrolled ? "#0e0600" : "#111",
            transition: "background 0.4s ease",
            padding: "7px clamp(1rem,4vw,3rem)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Contact info */}
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
                text: "info@slendorholdings.com",
                href: "mailto:info@slendorholdings.com",
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
                  className="nav-topbar-link"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 11.5,
                    color: "rgba(255,235,200,0.72)",
                    textDecoration: "none",
                    fontWeight: 300,
                    letterSpacing: "0.03em",
                    transition: "color 0.2s",
                  }}
                >
                  <Icon size={12} strokeWidth={1.8} color="#F59E0B" />
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
                    color: "rgba(255,235,200,0.72)",
                    fontWeight: 300,
                    letterSpacing: "0.03em",
                  }}
                >
                  <Icon size={12} strokeWidth={1.8} color="#F59E0B" />
                  <span className="topbar-text">{text}</span>
                </span>
              ),
            )}
          </div>

          {/* Right badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(245,158,11,0.10)",
                border: "1px solid rgba(245,158,11,0.22)",
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
                  fontFamily: "'Jost'",
                  fontSize: 10.5,
                  color: "rgba(255,235,200,0.75)",
                  letterSpacing: "0.08em",
                }}
              >
                Open Today · 8AM – 6PM
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════
            MAIN NAV BAR
        ══════════════════════ */}
        <div
          style={{
            background: scrolled ? "rgba(255,252,248,0.97)" : "#fff",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            borderBottom: scrolled ? "1px solid #f0e5d8" : "1px solid #f5ede6",
            boxShadow: scrolled
              ? "0 4px 32px rgba(0,0,0,0.08)"
              : "0 1px 0 rgba(0,0,0,0.04)",
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
            {/* ── LEFT NAV (desktop) ── */}
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(16px,2.5vw,36px)",
              }}
              className="desktop-nav"
            >
              {navLinks.slice(0, 3).map((link, i) => (
                <NavItem key={i} link={link} scrolled={scrolled} />
              ))}
            </nav>

            {/* ── CENTER LOGO ── */}
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
              {/* SVG skyline mark */}
              <svg
                width="38"
                height="42"
                viewBox="0 0 48 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginBottom: 5 }}
              >
                <rect x="20" y="6" width="8" height="44" fill="#1a0d00" />
                <rect
                  x="10"
                  y="16"
                  width="10"
                  height="34"
                  fill="#1a0d00"
                  opacity="0.70"
                />
                <rect
                  x="28"
                  y="16"
                  width="10"
                  height="34"
                  fill="#1a0d00"
                  opacity="0.70"
                />
                <rect
                  x="3"
                  y="26"
                  width="7"
                  height="24"
                  fill="#1a0d00"
                  opacity="0.38"
                />
                <rect
                  x="38"
                  y="26"
                  width="7"
                  height="24"
                  fill="#1a0d00"
                  opacity="0.38"
                />
                <rect x="23" y="0" width="2" height="8" fill="#c2884a" />
                {/* Amber spire tip */}
                <rect
                  x="20"
                  y="6"
                  width="8"
                  height="3"
                  fill="#c2884a"
                  opacity="0.5"
                />
              </svg>

              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(13px,1.4vw,16px)",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#1a0d00",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                Slendor Holdings
              </span>
              <span
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 8,
                  letterSpacing: "0.30em",
                  textTransform: "uppercase",
                  color: "#c2884a",
                  marginTop: 3,
                  whiteSpace: "nowrap",
                }}
              >
                — Real Estate & Investments —
              </span>
            </a>

            {/* ── RIGHT NAV (desktop) ── */}
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(16px,2.5vw,36px)",
              }}
              className="desktop-nav"
            >
              {navLinks.slice(3).map((link, i) => (
                <NavItem key={i} link={link} scrolled={scrolled} />
              ))}
              {/* CTA button */}
              <a
                href="/listings"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  background: "linear-gradient(135deg,#c2884a,#7B2D8B)",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "9px 20px",
                  borderRadius: 99,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 16px rgba(194,136,74,0.25)",
                  transition: "all 0.25s",
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
                View Listings
              </a>
            </nav>

            {/* ── HAMBURGER (mobile) ── */}
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
                color: "#1a0d00",
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

        {/* ══════════════════════════════
            MOBILE MENU — slide in from right
        ══════════════════════════════ */}
        {menuOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 8999,
            }}
          >
            {/* Backdrop */}
            <div
              onClick={() => setMenuOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(10,4,0,0.55)",
                backdropFilter: "blur(3px)",
              }}
            />

            {/* Panel */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: "min(340px, 88vw)",
                background: "#fdf8f2",
                boxShadow: "-8px 0 48px rgba(0,0,0,0.18)",
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
                  borderBottom: "1px solid #f0e5d8",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#1a0d00",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                    }}
                  >
                    Slendor Holdings
                  </span>
                  <span
                    style={{
                      fontFamily: "'Jost'",
                      fontSize: 9,
                      color: "#c2884a",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      marginTop: 2,
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
                    color: "#9a7c5a",
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
                            fontFamily: "'Jost'",
                            fontSize: 13,
                            fontWeight: 500,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#1a0d00",
                            borderBottom: "1px solid #f5ede6",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#faf3ec")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "none")
                          }
                        >
                          {link.label}
                          <ChevronDown
                            size={14}
                            strokeWidth={1.8}
                            color="#c2884a"
                            style={{
                              transform:
                                openMobile === i
                                  ? "rotate(180deg)"
                                  : "rotate(0)",
                              transition: "transform 0.25s",
                            }}
                          />
                        </button>
                        {/* Accordion children */}
                        <div
                          style={{
                            maxHeight:
                              openMobile === i
                                ? `${link.children.length * 46}px`
                                : 0,
                            overflow: "hidden",
                            transition:
                              "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
                            background: "#fffcf8",
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
                                fontFamily: "'Jost'",
                                fontSize: 12.5,
                                color: "#6b4e2a",
                                textDecoration: "none",
                                borderBottom: "1px solid #f5ede6",
                                letterSpacing: "0.03em",
                                transition: "color 0.2s, padding 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#c2884a";
                                e.currentTarget.style.paddingLeft = "44px";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#6b4e2a";
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
                          fontFamily: "'Jost'",
                          fontSize: 13,
                          fontWeight: 500,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#1a0d00",
                          textDecoration: "none",
                          borderBottom: "1px solid #f5ede6",
                          transition: "background 0.2s, color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#faf3ec";
                          e.currentTarget.style.color = "#c2884a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "none";
                          e.currentTarget.style.color = "#1a0d00";
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
                  borderTop: "1px solid #f0e5d8",
                }}
              >
                <a
                  href="/listings"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg,#c2884a,#7B2D8B)",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: 12,
                    padding: "14px 24px",
                    fontFamily: "'Jost'",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    boxShadow: "0 6px 24px rgba(194,136,74,0.28)",
                    marginBottom: 14,
                  }}
                >
                  View All Properties
                </a>
                {/* Contact strip */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginTop: 6,
                  }}
                >
                  {[
                    {
                      Icon: Phone,
                      text: "+254 700 123 456",
                      href: "tel:+254700123456",
                    },
                    {
                      Icon: Mail,
                      text: "info@slendorholdings.com",
                      href: "mailto:info@slendorholdings.com",
                    },
                  ].map(({ Icon, text, href }, i) => (
                    <a
                      key={i}
                      href={href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontFamily: "'Jost'",
                        fontSize: 12.5,
                        color: "#7a5c3a",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#c2884a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#7a5c3a")
                      }
                    >
                      <Icon size={14} color="#c2884a" strokeWidth={1.8} />
                      {text}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Responsive show/hide styles ── */}
      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
        @media (max-width: 640px) {
          .topbar-text { display: none; }
        }
      `}</style>
    </>
  );
}
