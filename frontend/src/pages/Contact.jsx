import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  ChevronDown,
  User,
  AtSign,
  Building2,
  MessageSquare,
  Search,
  X,
  Bed,
  Bath,
} from "lucide-react";
import axios from "axios";

if (!document.querySelector("#slendor-contact-fonts")) {
  const l = document.createElement("link");
  l.id = "slendor-contact-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

const API_BASE_URL = "https://splendorholdings-2v47.vercel.app/api/v1";

// ── Must exactly match the enum in the Inquiry model ─────────────────────────
const INQUIRY_TYPE_OPTIONS = [
  "Buying a Property",
  "Renting a Property",
  "Selling My Property",
  "Off-Plan Investment",
  "Property Valuation",
  "Property Management",
  "General Enquiry",
  "Viewing Request",
  "Price Inquiry",
  "Offer Intent",
  "Information",
];

// Display labels → inquiry type enum values
// If a label already matches the enum, it passes through as-is.
// This map only exists so the <select> options read naturally to users.
const INTEREST_DISPLAY = INQUIRY_TYPE_OPTIONS; // they're already user-friendly

const contactDetails = [
  {
    icon: MapPin,
    label: "Visit Us",
    value: "Senteu Plaza, Kilimani, Nairobi",
    sub: "Simba Lane, Nyali, Mombasa",
    accent: "#c2884a",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+254 725 504 985",
    sub: "Call or WhatsApp",
    href: "tel:+254725504985",
    accent: "#7B2D8B",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "sally@splendorholdings.com",
    sub: "We reply within 2 business hours",
    href: "mailto:sally@splendorholdings.com",
    accent: "#0d6e5e",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Mon – Sat: 8:00AM – 6:00PM",
    sub: "Sun: By Appointment",
    accent: "#c2410c",
  },
];

function useReveal() {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.15 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

/* ── Property search dropdown ── */
function PropertyPicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/properties?limit=100`);
        const data =
          res.data?.data?.properties ||
          res.data?.data ||
          res.data?.properties ||
          [];
        setProperties(Array.isArray(data) ? data : []);
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = properties.filter((p) => {
    const q = query.toLowerCase();
    return (
      !q ||
      (p.name || "").toLowerCase().includes(q) ||
      (p.location || "").toLowerCase().includes(q) ||
      (p.type || "").toLowerCase().includes(q)
    );
  });

  const selected = value ? properties.find((p) => p._id === value) : null;
  const borderColor = focused ? "#c2884a" : "#e2d5c8";
  const glow = focused ? "0 0 0 3px rgba(194,136,74,0.12)" : "none";

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        onClick={() => {
          setOpen((o) => !o);
          setFocused(true);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 14px",
          borderRadius: 12,
          border: `1.5px solid ${borderColor}`,
          background: focused ? "#fffdf9" : "#fdf9f5",
          boxShadow: glow,
          cursor: "pointer",
          transition: "all 0.25s ease",
          minHeight: 52,
        }}
      >
        <Building2
          size={15}
          color={focused ? "#c2884a" : "#c8a882"}
          strokeWidth={1.7}
          style={{ flexShrink: 0 }}
        />
        {selected ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 13,
                color: "#3d2413",
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {selected.name}
            </div>
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 11,
                color: "#b09070",
              }}
            >
              {selected.location}
            </div>
          </div>
        ) : (
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 13,
              color: "#b09070",
              flex: 1,
            }}
          >
            Search for a property (optional)
          </span>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {selected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setQuery("");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: 2,
              }}
            >
              <X size={13} color="#b09070" />
            </button>
          )}
          <ChevronDown
            size={13}
            color="#c2884a"
            style={{
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </div>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "#fff",
            borderRadius: 14,
            border: "1.5px solid #e2d5c8",
            boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
            zIndex: 100,
            maxHeight: 340,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid #f0e8df",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Search size={13} color="#c2884a" strokeWidth={2} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontFamily: "'Jost', sans-serif",
                fontSize: 13,
                color: "#3d2413",
                background: "transparent",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={12} color="#b09070" />
              </button>
            )}
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 13,
                  color: "#b09070",
                }}
              >
                Loading properties...
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 13,
                  color: "#b09070",
                }}
              >
                No properties found
              </div>
            ) : (
              filtered.map((p) => {
                const img =
                  p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url;
                const isSelected = value === p._id;
                return (
                  <div
                    key={p._id}
                    onClick={() => {
                      onChange(p._id);
                      setOpen(false);
                      setFocused(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      cursor: "pointer",
                      background: isSelected ? "#fdf3e7" : "transparent",
                      borderBottom: "1px solid #faf5ef",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "#fdf8f3";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 36,
                        borderRadius: 8,
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#f0e8df",
                      }}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={p.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Building2 size={14} color="#c2884a" />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#1a0f00",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 2,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: 10,
                            color: "#b09070",
                          }}
                        >
                          {p.location}
                        </span>
                        {p.beds > 0 && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              fontFamily: "'Jost', sans-serif",
                              fontSize: 10,
                              color: "#b09070",
                            }}
                          >
                            <Bed size={9} /> {p.beds}bd
                          </span>
                        )}
                        {p.baths > 0 && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              fontFamily: "'Jost', sans-serif",
                              fontSize: 10,
                              color: "#b09070",
                            }}
                          >
                            <Bath size={9} /> {p.baths}ba
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#7B2D8B",
                        flexShrink: 0,
                      }}
                    >
                      {p.priceLabel ||
                        (p.price
                          ? `KES ${(p.price / 1_000_000).toFixed(1)}M`
                          : "—")}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Single floating-label input ── */
function Field({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  required,
  options,
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || (value && value.length > 0);
  const isSelect = type === "select";
  const isTextarea = type === "textarea";
  const borderColor = focused ? "#c2884a" : "#e2d5c8";
  const glow = focused ? "0 0 0 3px rgba(194,136,74,0.12)" : "none";

  const baseStyle = {
    width: "100%",
    border: `1.5px solid ${borderColor}`,
    borderRadius: 12,
    background: focused ? "#fffdf9" : "#fdf9f5",
    fontFamily: "'Jost', sans-serif",
    fontSize: 13,
    color: "#3d2413",
    outline: "none",
    transition: "all 0.25s ease",
    boxShadow: glow,
    appearance: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ position: "relative" }}>
      <label
        style={{
          position: "absolute",
          left: Icon ? 44 : 16,
          top: active ? 9 : isTextarea ? 18 : "50%",
          transform: active || isTextarea ? "none" : "translateY(-50%)",
          fontSize: active ? 9 : 13,
          fontFamily: "'Jost', sans-serif",
          fontWeight: active ? 600 : 400,
          color: active ? "#c2884a" : "#b09070",
          letterSpacing: active ? "0.14em" : "0.02em",
          textTransform: active ? "uppercase" : "none",
          transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {label}
        {required && " *"}
      </label>

      {Icon && (
        <div
          style={{
            position: "absolute",
            left: 15,
            top: isTextarea ? 18 : "50%",
            transform: isTextarea ? "none" : "translateY(-50%)",
            color: focused ? "#c2884a" : "#c8a882",
            transition: "color 0.25s",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <Icon size={15} strokeWidth={1.7} />
        </div>
      )}

      {isTextarea ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={5}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...baseStyle,
            padding: "28px 16px 14px",
            resize: "none",
            lineHeight: 1.75,
          }}
        />
      ) : isSelect ? (
        <>
          <select
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              ...baseStyle,
              padding: active ? "26px 40px 10px 44px" : "18px 40px 18px 44px",
              cursor: "pointer",
            }}
          >
            <option value="" disabled></option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#c2884a",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        </>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...baseStyle,
            padding: active ? "26px 16px 10px 44px" : "18px 16px 18px 44px",
          }}
        />
      )}
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [parallax, setParallax] = useState(0);
  const heroRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

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

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setSendError("");
    try {
      // Auth.jsx stores the token as "accessToken"
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        message: form.message,
        // form.interest is already a valid enum value from INQUIRY_TYPE_OPTIONS,
        // or falls back to "General Enquiry" if none was selected.
        inquiryType: form.interest || "General Enquiry",
        ...(selectedPropertyId ? { property: selectedPropertyId } : {}),
      };

      await axios.post(`${API_BASE_URL}/inquiries`, payload, { headers });
      setSent(true);
    } catch (err) {
      setSendError(
        err.response?.data?.message ||
          "Failed to send. Please try again or email us directly.",
      );
    } finally {
      setSending(false);
    }
  };

  const [cardRef, cardVis] = useReveal();
  const [formRef2, formVis] = useReveal();

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
        @keyframes popIn    { from{ opacity:0; transform:scale(0.85); } to{ opacity:1; transform:scale(1); } }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.55fr;
          gap: 40px;
          align-items: start;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 960px) {
          .contact-grid { grid-template-columns: 1fr; }
          .detail-grid  { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 540px) {
          .detail-grid  { grid-template-columns: 1fr; }
          .form-row-2   { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          height: "52vh",
          minHeight: 400,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1800&q=85)",
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
              "linear-gradient(125deg,rgba(12,5,0,0.82) 0%,rgba(45,18,2,0.62) 45%,rgba(5,2,0,0.18) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 80% at 0% 100%, rgba(150,70,5,0.32) 0%, transparent 65%)",
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
              Contact
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
              Get in Touch
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
            Let's Find Your
            <br />
            <em style={{ color: "#fde68a" }}>Perfect Home</em>
          </h1>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1rem,1.7vw,1.28rem)",
              fontStyle: "italic",
              color: "rgba(253,230,138,0.8)",
              maxWidth: 440,
              lineHeight: 1.8,
            }}
          >
            Our dedicated specialists are ready to walk you through every step —
            from first enquiry to final key handover.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 30,
              flexWrap: "wrap",
            }}
          >
            {[
              {
                icon: Phone,
                text: "+254 725 504 985",
                href: "tel:+254725504985",
              },
              {
                icon: Mail,
                text: "sally@splendorholdings.com",
                href: "mailto:sally@splendorholdings.com",
              },
            ].map(({ icon: Icon, text, href }, i) => (
              <a
                key={i}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  background: "rgba(255,255,255,0.10)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 99,
                  padding: "10px 20px",
                  textDecoration: "none",
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
                <Icon size={13} color="#F59E0B" strokeWidth={2} />
                <span
                  style={{
                    fontFamily: "'Jost'",
                    fontSize: 12.5,
                    color: "#fff",
                  }}
                >
                  {text}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* BODY */}
      <div
        style={{
          maxWidth: 1240,
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
              Contact Us
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
            We'd Love to Hear From You
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
            Reach out by any channel — our team responds within 2 business hours
          </p>
        </div>

        {/* Info cards */}
        <div ref={cardRef} className="detail-grid" style={{ marginBottom: 48 }}>
          {contactDetails.map((d, i) => {
            const Icon = d.icon;
            return (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: "24px 22px",
                  border: "1.5px solid #f0e5d8",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.055)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  opacity: cardVis ? 1 : 0,
                  transform: cardVis ? "translateY(0)" : "translateY(24px)",
                  transition: `opacity 0.65s ease ${i * 100}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms`,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    flexShrink: 0,
                    background: `${d.accent}14`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} color={d.accent} strokeWidth={1.7} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Jost'",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: d.accent,
                      marginBottom: 6,
                    }}
                  >
                    {d.label}
                  </div>
                  {d.href ? (
                    <a
                      href={d.href}
                      style={{
                        display: "block",
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#1a0d00",
                        textDecoration: "none",
                        marginBottom: 4,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = d.accent)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#1a0d00")
                      }
                    >
                      {d.value}
                    </a>
                  ) : (
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#1a0d00",
                        marginBottom: 4,
                      }}
                    >
                      {d.value}
                    </div>
                  )}
                  <div
                    style={{
                      fontFamily: "'Jost'",
                      fontSize: 12,
                      color: "#b09070",
                      fontWeight: 300,
                    }}
                  >
                    {d.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two col */}
        <div className="contact-grid">
          {/* LEFT */}
          <div
            ref={formRef2}
            style={{
              opacity: formVis ? 1 : 0,
              transform: formVis ? "translateX(0)" : "translateX(-28px)",
              transition:
                "opacity 0.75s ease 0.15s, transform 0.75s cubic-bezier(0.22,1,0.36,1) 0.15s",
            }}
          >
            {/* Dark card */}
            <div
              style={{
                background: "linear-gradient(148deg, #1c0e02 0%, #2e1800 100%)",
                borderRadius: 20,
                padding: "34px 30px",
                position: "relative",
                overflow: "hidden",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle,rgba(245,158,11,0.14) 0%,transparent 65%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  left: -20,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle,rgba(123,45,139,0.10) 0%,transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 13,
                      background: "rgba(245,158,11,0.13)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MessageSquare
                      size={19}
                      color="#F59E0B"
                      strokeWidth={1.7}
                    />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    What to Expect
                  </h3>
                </div>
                <p
                  style={{
                    fontFamily: "'Jost'",
                    fontSize: 13,
                    color: "rgba(255,225,175,0.70)",
                    lineHeight: 1.85,
                    fontWeight: 300,
                    marginBottom: 22,
                  }}
                >
                  Submit your enquiry and a dedicated specialist reaches out
                  within{" "}
                  <strong style={{ color: "#fde68a", fontWeight: 500 }}>
                    2 business hours
                  </strong>{" "}
                  — no scripts, no pressure. Just honest, expert guidance.
                </p>
                {[
                  "Free, no-obligation consultation",
                  "Personalised property shortlist",
                  "Expert market & pricing insights",
                  "Full transaction support, start to finish",
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 11,
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#F59E0B,#b45309)",
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
                    <span
                      style={{
                        fontFamily: "'Jost'",
                        fontSize: 13,
                        color: "rgba(255,230,195,0.80)",
                        fontWeight: 300,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/254725504985"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "#fff",
                border: "1.5px solid #ede0d4",
                borderRadius: 16,
                padding: "18px 22px",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.055)",
                transition: "all 0.28s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 14px 44px rgba(0,0,0,0.10)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(0,0,0,0.055)";
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: "#25A244",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Jost'",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1a0d00",
                    marginBottom: 2,
                  }}
                >
                  WhatsApp Sally
                </div>
                <div
                  style={{
                    fontFamily: "'Jost'",
                    fontSize: 12,
                    color: "#9a7c5a",
                    fontWeight: 300,
                  }}
                >
                  +254 725 504 985 · Instant replies during business hours
                </div>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c2884a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginLeft: "auto" }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>

            {/* Map */}
            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                height: 220,
                marginTop: 22,
                boxShadow: "0 6px 30px rgba(0,0,0,0.09)",
              }}
            >
              <iframe
                title="Splendor Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.808792838638!2d36.80249931475417!3d-1.2696080990692!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f170c2b9f2a2f%3A0x1c2d9a3b4e5f6a7b!2sWestlands%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1680000000000!5m2!1sen!2ske"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "sepia(18%) saturate(85%)" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          {/* RIGHT — form */}
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: "clamp(26px,4vw,46px)",
              boxShadow: "0 12px 56px rgba(0,0,0,0.08)",
              border: "1.5px solid #f0e5d8",
              opacity: formVis ? 1 : 0,
              transform: formVis ? "translateX(0)" : "translateX(28px)",
              transition:
                "opacity 0.75s ease 0.25s, transform 0.75s cubic-bezier(0.22,1,0.36,1) 0.25s",
            }}
          >
            {sent ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 20px",
                  animation:
                    "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
                }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 22px",
                    boxShadow: "0 8px 32px rgba(34,197,94,0.25)",
                  }}
                >
                  <CheckCircle size={38} color="#fff" strokeWidth={2} />
                </div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#1a0d00",
                    marginBottom: 10,
                  }}
                >
                  Message Received!
                </h3>
                <p
                  style={{
                    fontFamily: "'Jost'",
                    fontSize: 13.5,
                    color: "#9a7c5a",
                    lineHeight: 1.75,
                    maxWidth: 300,
                    margin: "0 auto 28px",
                    fontWeight: 300,
                  }}
                >
                  Thank you,{" "}
                  <strong style={{ color: "#7B2D8B", fontWeight: 600 }}>
                    {form.name}
                  </strong>
                  . Sally will reach out within 2 business hours.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({
                      name: "",
                      email: "",
                      phone: "",
                      interest: "",
                      message: "",
                    });
                    setSelectedPropertyId(null);
                  }}
                  style={{
                    fontFamily: "'Jost'",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "12px 32px",
                    borderRadius: 99,
                    border: "2px solid #1a0d00",
                    background: "transparent",
                    color: "#1a0d00",
                    cursor: "pointer",
                    transition: "all 0.28s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1a0d00";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#1a0d00";
                  }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 30 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
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
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: "#b45309",
                      }}
                    >
                      Enquiry Form
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 26,
                      fontWeight: 700,
                      color: "#1a0d00",
                      marginBottom: 6,
                    }}
                  >
                    Send Us a Message
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Jost'",
                      fontSize: 13,
                      color: "#9a7c5a",
                      fontWeight: 300,
                      lineHeight: 1.7,
                    }}
                  >
                    Fill in the details below and we'll be in touch shortly.
                  </p>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div className="form-row-2">
                    <Field
                      label="Full Name"
                      icon={User}
                      value={form.name}
                      onChange={set("name")}
                      required
                    />
                    <Field
                      label="Email Address"
                      icon={AtSign}
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      required
                    />
                  </div>
                  <div className="form-row-2">
                    <Field
                      label="Phone Number"
                      icon={Phone}
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                    />
                    <Field
                      label="I'm Interested In"
                      icon={Building2}
                      type="select"
                      value={form.interest}
                      onChange={set("interest")}
                      options={INTEREST_DISPLAY}
                    />
                  </div>

                  {/* Property picker */}
                  <div>
                    <div
                      style={{
                        fontFamily: "'Jost'",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#c2884a",
                        marginBottom: 6,
                      }}
                    >
                      Property (optional)
                    </div>
                    <PropertyPicker
                      value={selectedPropertyId}
                      onChange={setSelectedPropertyId}
                    />
                    <div
                      style={{
                        fontFamily: "'Jost'",
                        fontSize: 11,
                        color: "#c8a882",
                        marginTop: 5,
                      }}
                    >
                      Select a property if your inquiry is about a specific
                      listing
                    </div>
                  </div>

                  <Field
                    label="Your Message"
                    type="textarea"
                    value={form.message}
                    onChange={set("message")}
                    required
                  />

                  {sendError && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "#fff0f0",
                        border: "1px solid #fca5a5",
                        fontFamily: "'Jost'",
                        fontSize: 13,
                        color: "#dc2626",
                      }}
                    >
                      {sendError}
                    </div>
                  )}

                  <p
                    style={{
                      fontFamily: "'Jost'",
                      fontSize: 11,
                      color: "#c8a882",
                      fontWeight: 300,
                      lineHeight: 1.7,
                    }}
                  >
                    By submitting you agree to our Privacy Policy. Your details
                    are never shared with third parties.
                  </p>

                  <button
                    onClick={submit}
                    disabled={
                      sending || !form.name || !form.email || !form.message
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      background: sending
                        ? "#9a7c5a"
                        : "linear-gradient(135deg,#c2884a,#7B2D8B)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 13,
                      padding: "17px 28px",
                      fontFamily: "'Jost'",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      cursor:
                        sending || !form.name || !form.email || !form.message
                          ? "not-allowed"
                          : "pointer",
                      width: "100%",
                      boxShadow: sending
                        ? "none"
                        : "0 8px 32px rgba(194,136,74,0.30)",
                      transition: "all 0.3s ease",
                      opacity:
                        !form.name || !form.email || !form.message ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!sending)
                        e.currentTarget.style.filter = "brightness(1.10)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = "brightness(1)";
                    }}
                  >
                    {sending ? (
                      <>
                        <div
                          style={{
                            width: 15,
                            height: 15,
                            borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Send Message
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
