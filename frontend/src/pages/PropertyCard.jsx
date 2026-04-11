import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  BarChart2,
  MapPin,
  Star,
  Bed,
  Bath,
  Maximize2,
  Home,
  Calendar,
  Building2,
  Car,
  Globe,
  Phone,
  ChevronLeft,
  ChevronRight,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { properties } from "../lib/data";

/* ── Font injection ── */
if (!document.querySelector("#slendor-fonts")) {
  const l = document.createElement("link");
  l.id = "slendor-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

/* ── Styles ── */
const S = {
  page: {
    fontFamily: "'Jost', sans-serif",
    background: "#fdf8f3",
    minHeight: "100vh",
    color: "#1a0f00",
  },
  inner: {
    maxWidth: 1040,
    margin: "0 auto",
    padding: "0 clamp(1.2rem, 4vw, 3rem) 80px",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "22px 0 18px",
    fontFamily: "'Jost', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    color: "#9a7c5a",
    background: "none",
    border: "none",
    cursor: "pointer",
    letterSpacing: "0.04em",
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, #f0e8df, transparent)",
    margin: "32px 0",
  },
};

/* ── Gallery ── */
function Gallery({ imgs = [], badge, badgeColor }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () => setActive((a) => (a - 1 + imgs.length) % imgs.length);
  const next = () => setActive((a) => (a + 1) % imgs.length);

  // Main + 2 side thumbs visible; overlay shows remaining count
  const remaining = imgs.length - 3;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "230px 230px",
          gap: 6,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {/* Main image */}
        <div
          style={{ gridRow: "1 / 3", position: "relative", cursor: "pointer" }}
          onClick={() => {
            setActive(0);
            setLightbox(true);
          }}
        >
          <img
            src={imgs[0]}
            alt="Main"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(10,5,0,0.35) 100%)",
            }}
          />
          {badge && (
            <span
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                background: badgeColor || "#1d4ed8",
                color: "#fff",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "4px 12px",
                borderRadius: 99,
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Side thumbnails */}
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 6 }}>
          {[imgs[1], imgs[2]].map((src, i) =>
            src ? (
              <div
                key={i}
                style={{ position: "relative", cursor: "pointer" }}
                onClick={() => {
                  setActive(i + 1);
                  setLightbox(true);
                }}
              >
                <img
                  src={src}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {i === 1 && remaining > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(10,5,0,0.52)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <Camera size={20} color="#fff" strokeWidth={1.5} />
                    <span
                      style={{
                        color: "#fff",
                        fontSize: 13,
                        fontFamily: "'Jost', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      +{remaining} Photos
                    </span>
                  </div>
                )}
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.93)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            style={{
              position: "absolute",
              left: 24,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={22} color="#fff" />
          </button>

          <img
            src={imgs[active]}
            alt=""
            style={{
              maxHeight: "85vh",
              maxWidth: "85vw",
              borderRadius: 12,
              objectFit: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            style={{
              position: "absolute",
              right: 24,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={22} color="#fff" />
          </button>

          <div
            style={{
              position: "absolute",
              bottom: 28,
              display: "flex",
              gap: 8,
            }}
          >
            {imgs.map((_, i) => (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(i);
                }}
                style={{
                  width: i === active ? 22 : 8,
                  height: 8,
                  borderRadius: 99,
                  background:
                    i === active ? "#F59E0B" : "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>

          <span
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              fontFamily: "'Jost', sans-serif",
            }}
          >
            {active + 1} / {imgs.length}
          </span>
        </div>
      )}
    </>
  );
}

/* ── Overview card ── */
function OvCard({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "16px 18px",
        border: "1px solid #f0e8df",
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <Icon size={18} color="#c2884a" strokeWidth={1.6} />
      </div>
      <div
        style={{
          fontSize: 10,
          color: "#b8a090",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 3,
          fontFamily: "'Jost', sans-serif",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: "#1a0f00",
          fontFamily: "'Jost', sans-serif",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ── Section title ── */
function SectionTitle({ children }) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#b45309",
        }}
      >
        {children}
      </span>
      <div style={{ height: 2, background: "#c2884a", borderRadius: 2 }} />
    </div>
  );
}

/* ── Main component ── */
export default function PropertyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const [liked, setLiked] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Prefer router state (instant, no lookup), fall back to find by id
  const p = state?.property ?? properties.find((x) => x.id === Number(id));

  // 404 guard
  if (!p) {
    return (
      <div
        style={{
          ...S.page,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 28,
              marginBottom: 12,
              color: "#1a0f00",
            }}
          >
            Property not found
          </p>
          <button style={S.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Go back
          </button>
        </div>
      </div>
    );
  }

  const agent = p.agent ?? {
    name: "Our Agent",
    initials: "OA",
    role: "Property Consultant",
  };

  return (
    <div style={S.page}>
      <div style={S.inner}>
        {/* Back */}
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} strokeWidth={2} />
          Back to listings
        </button>

        {/* Gallery */}
        <Gallery
          imgs={p.imgs ?? []}
          badge={p.badge}
          badgeColor={p.badgeColor}
        />

        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 16,
            alignItems: "flex-start",
            marginTop: 28,
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                background: "#dbeafe",
                color: "#1e40af",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "3px 12px",
                borderRadius: 99,
                marginBottom: 10,
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {p.badge}
            </span>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 700,
                lineHeight: 1.08,
                color: "#1a0f00",
                marginBottom: 8,
              }}
            >
              {p.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <MapPin size={13} color="#b45309" strokeWidth={2} />
              <span
                style={{
                  fontSize: 13,
                  color: "#9a7c5a",
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                {p.location}
              </span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 10,
                color: "#b8a090",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 4,
                fontFamily: "'Jost', sans-serif",
              }}
            >
              Listed Price
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700,
                color: "#1a0f00",
                lineHeight: 1,
              }}
            >
              {p.price}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 14,
                justifyContent: "flex-end",
              }}
            >
              {[
                { Icon: BarChart2, title: "Compare" },
                {
                  Icon: Heart,
                  title: "Save",
                  onClick: () => setLiked((l) => !l),
                  active: liked,
                },
                { Icon: Share2, title: "Share" },
              ].map(({ Icon, title, onClick, active }) => (
                <button
                  key={title}
                  title={title}
                  onClick={onClick}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1.5px solid #e8ddd2",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                >
                  <Icon
                    size={14}
                    color={active ? "#ef4444" : "#9a7c5a"}
                    fill={active && title === "Save" ? "#ef4444" : "none"}
                    strokeWidth={1.8}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features bar */}
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: 20,
            padding: "14px 20px",
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #f0e8df",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#b8a090",
              fontFamily: "'Jost', sans-serif",
            }}
          >
            Features:
          </span>
          {p.beds > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Bed size={14} color="#c2884a" strokeWidth={1.8} />
              <span
                style={{
                  fontSize: 13,
                  color: "#6b5c4a",
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                <strong style={{ color: "#1a0f00" }}>{p.beds}</strong> Bedroom
                {p.beds > 1 ? "s" : ""}
              </span>
            </div>
          )}
          {p.baths > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Bath size={14} color="#c2884a" strokeWidth={1.8} />
              <span
                style={{
                  fontSize: 13,
                  color: "#6b5c4a",
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                <strong style={{ color: "#1a0f00" }}>{p.baths}</strong> Bathroom
                {p.baths > 1 ? "s" : ""}
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Maximize2 size={13} color="#c2884a" strokeWidth={1.8} />
            <span
              style={{
                fontSize: 13,
                color: "#6b5c4a",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              <strong style={{ color: "#1a0f00" }}>{p.area} m²</strong>
            </span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Star size={13} fill="#F59E0B" color="#F59E0B" />
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#1a0f00",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {p.rating}
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#b8a090",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              ({p.reviews ?? 0} reviews)
            </span>
          </div>
        </div>

        <div style={S.divider} />

        {/* Description */}
        <SectionTitle>Description</SectionTitle>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.85,
            color: "#7a6555",
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
            marginTop: 14,
            maxWidth: 760,
          }}
        >
          {p.description}
        </p>

        <div style={S.divider} />

        {/* Amenities */}
        <SectionTitle>Amenities</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "2px 0",
            marginTop: 14,
          }}
        >
          {(p.amenities ?? []).map((a) => (
            <div
              key={a}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 0",
                fontSize: 13,
                color: "#6b5c4a",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              <CheckCircle2 size={13} color="#c2884a" strokeWidth={2} />
              {a}
            </div>
          ))}
        </div>

        <div style={S.divider} />

        {/* Pricing table */}
        {p.pricing?.length > 0 && (
          <>
            <SectionTitle>Pricing</SectionTitle>
            <div style={{ overflowX: "auto", marginTop: 14 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                <thead>
                  <tr>
                    {["Unit Type", "Size (sqm)", "DSQ", "Price From"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            borderBottom: "2px solid #f0e8df",
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#b8a090",
                            background: "#fdf8f3",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {p.pricing.map((row, i) => (
                    <tr
                      key={i}
                      style={{ background: i % 2 === 0 ? "#fff" : "#fdf8f3" }}
                    >
                      <td
                        style={{
                          padding: "12px 12px",
                          borderBottom: "1px solid #f5ede3",
                          color: "#1a0f00",
                          fontWeight: 500,
                        }}
                      >
                        {row.unit}
                      </td>
                      <td
                        style={{
                          padding: "12px 12px",
                          borderBottom: "1px solid #f5ede3",
                          color: "#7a6555",
                        }}
                      >
                        {row.size}
                      </td>
                      <td
                        style={{
                          padding: "12px 12px",
                          borderBottom: "1px solid #f5ede3",
                          color: "#7a6555",
                        }}
                      >
                        {row.dsq}
                      </td>
                      <td
                        style={{
                          padding: "12px 12px",
                          borderBottom: "1px solid #f5ede3",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 17,
                            fontWeight: 700,
                            color: "#1a0f00",
                          }}
                        >
                          {row.price}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={S.divider} />
          </>
        )}

        {/* Overview */}
        <SectionTitle>Overview</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
            marginTop: 14,
          }}
        >
          {p.floors != null && (
            <OvCard icon={Home} label="Floors" value={p.floors} />
          )}
          {p.beds != null && (
            <OvCard
              icon={Bed}
              label="Bedrooms"
              value={p.beds > 0 ? p.beds : "—"}
            />
          )}
          {p.baths != null && (
            <OvCard
              icon={Bath}
              label="Bathrooms"
              value={p.baths > 0 ? p.baths : "—"}
            />
          )}
          <OvCard icon={Maximize2} label="Area" value={`${p.area} m²`} />
          {p.yearBuilt != null && (
            <OvCard icon={Calendar} label="Year Built" value={p.yearBuilt} />
          )}
          <OvCard icon={Building2} label="Type" value={p.type} />
          {p.garage != null && (
            <OvCard icon={Car} label="Garage" value={p.garage} />
          )}
          {p.status && <OvCard icon={Globe} label="Status" value={p.status} />}
        </div>

        {/* Agent CTA */}
        <div
          style={{
            marginTop: 40,
            background: "linear-gradient(135deg, #7B2D8B 0%, #4A1060 100%)",
            borderRadius: 20,
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              color: "#fff",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {agent.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "#fff",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {agent.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
                marginTop: 2,
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {agent.role}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "11px 22px",
                borderRadius: 99,
                background: "transparent",
                border: "1.5px solid rgba(255,255,255,0.45)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              <Phone size={13} />
              Call Agent
            </button>
            <button
              onClick={() => setBookingOpen(true)}
              style={{
                padding: "11px 22px",
                borderRadius: 99,
                background: "#fff",
                border: "none",
                color: "#4A1060",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "filter 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = "brightness(0.94)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.filter = "brightness(1)")
              }
            >
              Book Viewing
            </button>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {bookingOpen && (
        <div
          onClick={() => setBookingOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(10,5,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fdf8f3",
              borderRadius: 20,
              padding: "36px 32px",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 26,
                fontWeight: 700,
                marginBottom: 6,
                color: "#1a0f00",
              }}
            >
              Book a Viewing
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#9a7c5a",
                marginBottom: 24,
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {p.name} · {p.location}
            </p>
            {[
              { label: "Full Name", type: "text", placeholder: "Jane Doe" },
              {
                label: "Phone Number",
                type: "tel",
                placeholder: "+254 7XX XXX XXX",
              },
              { label: "Preferred Date", type: "date", placeholder: "" },
            ].map(({ label, type, placeholder }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#b8a090",
                    marginBottom: 6,
                    fontFamily: "'Jost', sans-serif",
                  }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e8ddd2",
                    background: "#fff",
                    fontSize: 14,
                    fontFamily: "'Jost', sans-serif",
                    color: "#1a0f00",
                    outline: "none",
                  }}
                />
              </div>
            ))}
            <button
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 99,
                marginTop: 8,
                background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Confirm Booking
            </button>
            <button
              onClick={() => setBookingOpen(false)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: 10,
                background: "none",
                border: "none",
                fontSize: 13,
                color: "#b8a090",
                cursor: "pointer",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
