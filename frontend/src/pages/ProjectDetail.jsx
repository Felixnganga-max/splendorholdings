import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Home,
  Calendar,
  Building2,
  Car,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle2,
  Clock,
  CheckCheck,
  TrendingUp,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import axios from "axios";
import Gallery from "../components/Gallery";

const API_BASE_URL = "https://splendorholdings-2v47.vercel.app/api/v1";

if (!document.querySelector("#slendor-fonts")) {
  const l = document.createElement("link");
  l.id = "slendor-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

// ─── Design tokens (matching Projects.jsx) ────────────────────────────────────
const B = {
  primary: "#0a1172",
  secondary: "#1a3a5c",
  accent: "#d4af37",
  beige: "#ede8dc",
  white: "#fafaf8",
  black: "#0d0d0d",
  text: "#1a1a2e",
  muted: "#6b7280",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Lato', 'Helvetica Neue', Arial, sans-serif",
  grad: "linear-gradient(135deg, #0a1172 0%, #1a3a5c 100%)",
  gradGold: "linear-gradient(135deg, #d4af37 0%, #b8962e 100%)",
  completedBg: "#1a7a4a",
  inProgressBg: "#b45309",
};

const S = {
  page: {
    fontFamily: "'Jost', sans-serif",
    background: "#fdf8f3",
    minHeight: "100vh",
    color: "#1a0f00",
  },
  inner: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "0 clamp(1rem, 4vw, 2.5rem) 80px",
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
    margin: "28px 0",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPrimaryImage(p) {
  if (!p.images?.length) return null;
  const primary = p.images.find((img) => img.isPrimary);
  return (primary ?? p.images[0])?.url ?? null;
}

function formatPrice(p) {
  if (p.pricing?.label) return p.pricing.label;
  const n = p.pricing?.original;
  if (!n) return "—";
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `KES ${(n / 1_000).toFixed(0)}K`;
  return `KES ${n}`;
}

// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const isCompleted = status === "completed";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: isCompleted ? B.completedBg : B.inProgressBg,
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        padding: "4px 12px",
        borderRadius: 99,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontFamily: B.sans,
      }}
    >
      {isCompleted ? (
        <CheckCheck size={10} strokeWidth={2.5} />
      ) : (
        <Clock size={10} strokeWidth={2.5} />
      )}
      {isCompleted ? "Completed" : "In Progress"}
    </span>
  );
}

// ─── Overview Card ────────────────────────────────────────────────────────────
function OvCard({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "16px 18px",
        border: "1px solid #f0e8df",
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <Icon size={18} color={B.accent} strokeWidth={1.6} />
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

// ─── Section Title ────────────────────────────────────────────────────────────
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
          color: B.inProgressBg,
        }}
      >
        {children}
      </span>
      <div style={{ height: 2, background: B.accent, borderRadius: 2 }} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    type: "Information",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError("No project ID provided");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_BASE_URL}/properties/${id}`, {
          headers,
        });
        if (
          response.data.status === "success" &&
          response.data.data?.property
        ) {
          setProject(response.data.data.property);
        } else if (response.data.success && response.data.data) {
          setProject(response.data.data);
        } else {
          setError("Project not found in database");
        }
      } catch (err) {
        if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
          setError("Cannot connect to backend server.");
        } else if (err.response?.status === 404) {
          setError(`Project with ID "${id}" does not exist.`);
        } else if (err.response?.status === 500) {
          setError("Server error. Check your backend console.");
        } else {
          setError(err.response?.data?.message || "Failed to load project");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const payload = {
        property: id,
        message: inquiryForm.message,
        type: inquiryForm.type,
        ...(token
          ? {}
          : {
              guestName: inquiryForm.name,
              guestEmail: inquiryForm.email,
              guestPhone: inquiryForm.phone,
            }),
      };
      const response = await axios.post(`${API_BASE_URL}/inquiries`, payload, {
        headers,
      });
      if (response.data.success || response.data.status === "success") {
        setSubmitMessage({
          type: "success",
          text: "Your inquiry has been sent! We'll be in touch soon.",
        });
        setInquiryForm({
          name: "",
          email: "",
          phone: "",
          message: "",
          type: "Information",
        });
        setTimeout(() => setInquiryOpen(false), 2200);
      } else {
        setSubmitMessage({
          type: "error",
          text: response.data.message || "Failed to send inquiry",
        });
      }
    } catch (err) {
      setSubmitMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to send inquiry",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.inner}>
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div
              style={{
                display: "inline-block",
                width: 40,
                height: 40,
                border: "3px solid #f0e8df",
                borderTop: `3px solid ${B.accent}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 14, color: "#9a7c5a", marginTop: 16 }}>
              Loading project details...
            </div>
            <div style={{ fontSize: 12, color: "#b8a090", marginTop: 8 }}>
              Project ID: {id}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !project) {
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
        <div style={{ textAlign: "center", maxWidth: 500, padding: "0 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔍</div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 28,
              marginBottom: 12,
              color: "#1a0f00",
            }}
          >
            {error?.includes("Cannot connect")
              ? "Backend Server Not Running"
              : "Project Not Found"}
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#9a7c5a",
              marginBottom: 24,
              whiteSpace: "pre-line",
              textAlign: "left",
              background: "#f5f0ea",
              padding: 16,
              borderRadius: 16,
              fontFamily: "monospace",
            }}
          >
            {error || `Project with ID "${id}" does not exist.`}
          </p>
          <button style={S.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Go back to projects
          </button>
        </div>
      </div>
    );
  }

  // ── Normalise data ──
  const p = {
    id: project._id,
    name: project.name || "Project Name",
    buildingName: project.buildingName || project.name || "Project Name",
    location: project.location || "Location",
    price: formatPrice(project),
    badge: project.badge ?? project.type ?? "Project",
    badgeColor: project.isSoldOut ? "#dc2626" : B.primary,
    imgs: project.images?.map((img) => img.url) || [],
    beds: project.beds || 0,
    baths: project.baths || 0,
    area: project.area || 0,
    description: project.description || "No description available.",
    amenities: project.features || [],
    floors: project.floors,
    yearBuilt: project.yearBuilt,
    type: project.type,
    garage: project.garage,
    projectStatus: project.projectStatus ?? "in-progress",
    isSoldOut: project.isSoldOut ?? false,
    pricing: project.pricing ?? [],
    pricingTable: project.pricingTable ?? [],
    rating: project.rating ?? null,
  };

  const isCompleted = p.projectStatus === "completed";

  return (
    <div style={S.page}>
      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .project-detail-inner { animation: fadeUp 0.5s ease forwards; }
      `}</style>

      <div style={S.inner} className="project-detail-inner">
        {/* Back button */}
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} strokeWidth={2} />
          Back to projects
        </button>

        {/* Gallery */}
        <div style={{ borderRadius: 24, overflow: "hidden", marginBottom: 28 }}>
          <Gallery
            imgs={p.imgs}
            badge={p.badge}
            badgeColor={p.badgeColor}
            propertyName={p.buildingName}
          />
        </div>

        {/* Title row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 16,
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div>
            {/* Status pill */}
            <div style={{ marginBottom: 10 }}>
              <StatusPill status={p.projectStatus} />
            </div>

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
              {p.buildingName}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <MapPin size={13} color={B.inProgressBg} strokeWidth={2} />
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

          {/* Price */}
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
              From
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
          </div>
        </div>

        {/* Quick specs pill */}
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "center",
            padding: "14px 20px",
            background: "#fff",
            borderRadius: 20,
            border: "1px solid #f0e8df",
            marginBottom: 0,
          }}
        >
          {p.beds > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Bed size={14} color={B.accent} strokeWidth={1.8} />
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
              <Bath size={14} color={B.accent} strokeWidth={1.8} />
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
          {p.area > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Maximize2 size={13} color={B.accent} strokeWidth={1.8} />
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
          )}
          {p.isSoldOut && (
            <span
              style={{
                marginLeft: "auto",
                background: "#fee2e2",
                color: "#dc2626",
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 99,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: B.sans,
              }}
            >
              Sold Out
            </span>
          )}
        </div>

        <div style={S.divider} />

        {/* Description */}
        <SectionTitle>About This Project</SectionTitle>
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

        {/* Amenities / Features */}
        {p.amenities.length > 0 && (
          <>
            <SectionTitle>Features & Amenities</SectionTitle>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "2px 0",
                marginTop: 14,
              }}
            >
              {p.amenities.map((a) => (
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
                  <CheckCircle2 size={13} color={B.accent} strokeWidth={2} />
                  {a}
                </div>
              ))}
            </div>
            <div style={S.divider} />
          </>
        )}

        {/* Pricing Table */}
        {(p.pricingTable?.length > 0 || p.pricing?.length > 0) &&
          (() => {
            const rows = p.pricingTable?.length ? p.pricingTable : p.pricing;
            if (!rows?.length) return null;
            return (
              <>
                <SectionTitle>Unit Pricing</SectionTitle>
                <div
                  style={{
                    overflowX: "auto",
                    marginTop: 14,
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #f0e8df",
                  }}
                >
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
                      {rows.map((row, i) => (
                        <tr
                          key={i}
                          style={{
                            background: i % 2 === 0 ? "#fff" : "#fdf8f3",
                          }}
                        >
                          <td
                            style={{
                              padding: "12px 12px",
                              borderBottom: "1px solid #f5ede3",
                              color: "#1a0f00",
                              fontWeight: 500,
                            }}
                          >
                            {row.unit ?? row.type ?? "—"}
                          </td>
                          <td
                            style={{
                              padding: "12px 12px",
                              borderBottom: "1px solid #f5ede3",
                              color: "#7a6555",
                            }}
                          >
                            {row.size ?? "—"}
                          </td>
                          <td
                            style={{
                              padding: "12px 12px",
                              borderBottom: "1px solid #f5ede3",
                              color: "#7a6555",
                            }}
                          >
                            {row.dsq ?? "—"}
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
                              {row.price ?? "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={S.divider} />
              </>
            );
          })()}

        {/* Overview grid */}
        <SectionTitle>Project Overview</SectionTitle>
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
          {p.beds > 0 && <OvCard icon={Bed} label="Bedrooms" value={p.beds} />}
          {p.baths > 0 && (
            <OvCard icon={Bath} label="Bathrooms" value={p.baths} />
          )}
          {p.area > 0 && (
            <OvCard icon={Maximize2} label="Area" value={`${p.area} m²`} />
          )}
          {p.yearBuilt != null && (
            <OvCard icon={Calendar} label="Year Built" value={p.yearBuilt} />
          )}
          {p.type && <OvCard icon={Building2} label="Type" value={p.type} />}
          {p.garage != null && (
            <OvCard icon={Car} label="Garage" value={p.garage} />
          )}
          <OvCard
            icon={isCompleted ? CheckCheck : Clock}
            label="Status"
            value={isCompleted ? "Completed" : "In Progress"}
          />
        </div>

        {/* Contact / Inquiry card */}
        <div
          style={{
            marginTop: 40,
            background: B.grad,
            borderRadius: 24,
            padding: "32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Gold accent circle */}
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: "50%",
              border: `1px solid rgba(212,175,55,0.20)`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -60,
              right: 20,
              width: 240,
              height: 240,
              borderRadius: "50%",
              border: `1px solid rgba(212,175,55,0.12)`,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(212,175,55,0.65)",
              marginBottom: 6,
              fontFamily: "'Jost', sans-serif",
            }}
          >
            Get in Touch
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 20,
            }}
          >
            Interested in this project?
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              {
                href: "mailto:sally@splendorholdings.com",
                Icon: Mail,
                label: "sally@splendorholdings.com",
              },
              {
                href: "tel:+254725504985",
                Icon: Phone,
                label: "0725 504 985 — Call or WhatsApp",
              },
              {
                href: "https://wa.me/254725504985",
                Icon: MessageCircle,
                label: "WhatsApp Sally",
                external: true,
              },
            ].map(({ href, Icon, label, external }) => (
              <a
                key={label}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#fff",
                  textDecoration: "none",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(212,175,55,0.30)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} color="#fff" strokeWidth={1.8} />
                </div>
                {label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setInquiryOpen(true)}
            style={{
              padding: "13px 32px",
              borderRadius: 99,
              background: B.accent,
              border: "none",
              color: B.primary,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Jost', sans-serif",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Send an Inquiry
          </button>
        </div>
      </div>

      {/* ── Inquiry Modal ── */}
      {inquiryOpen && (
        <div
          onClick={() => setInquiryOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(10,5,0,0.58)",
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
              borderRadius: 24,
              padding: "36px 32px",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setInquiryOpen(false)}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1.5px solid #e8ddd2",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} color={B.muted} />
            </button>

            {/* Status pill inside modal */}
            <div style={{ marginBottom: 10 }}>
              <StatusPill status={p.projectStatus} />
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 26,
                fontWeight: 700,
                marginBottom: 4,
                color: "#1a0f00",
              }}
            >
              Send an Inquiry
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#9a7c5a",
                marginBottom: 22,
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {p.buildingName} · {p.location}
            </p>

            {submitMessage.text && (
              <div
                style={{
                  padding: "10px 15px",
                  borderRadius: 12,
                  marginBottom: 18,
                  fontSize: 13,
                  background:
                    submitMessage.type === "success" ? "#d4edda" : "#f8d7da",
                  color:
                    submitMessage.type === "success" ? "#155724" : "#721c24",
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                {submitMessage.text}
              </div>
            )}

            <form onSubmit={handleInquirySubmit}>
              {/* Guest fields (show only if not logged in) */}
              {!localStorage.getItem("token") && (
                <>
                  {[
                    {
                      label: "Full Name",
                      key: "name",
                      type: "text",
                      placeholder: "Jane Doe",
                      required: false,
                    },
                    {
                      label: "Email *",
                      key: "email",
                      type: "email",
                      placeholder: "jane@example.com",
                      required: true,
                    },
                    {
                      label: "Phone (optional)",
                      key: "phone",
                      type: "tel",
                      placeholder: "+254 7XX XXX XXX",
                      required: false,
                    },
                  ].map(({ label, key, type, placeholder, required }) => (
                    <div key={key} style={{ marginBottom: 14 }}>
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
                        required={required}
                        value={inquiryForm[key]}
                        onChange={(e) =>
                          setInquiryForm({
                            ...inquiryForm,
                            [key]: e.target.value,
                          })
                        }
                        placeholder={placeholder}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 12,
                          border: "1.5px solid #e8ddd2",
                          background: "#fff",
                          fontSize: 14,
                          fontFamily: "'Jost', sans-serif",
                          color: "#1a0f00",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ))}
                </>
              )}

              {/* Inquiry type */}
              <div style={{ marginBottom: 14 }}>
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
                  Inquiry Type
                </label>
                <select
                  value={inquiryForm.type}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, type: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #e8ddd2",
                    background: "#fff",
                    fontSize: 14,
                    fontFamily: "'Jost', sans-serif",
                    color: "#1a0f00",
                    outline: "none",
                    appearance: "none",
                    boxSizing: "border-box",
                  }}
                >
                  {["Information", "Viewing", "Investment", "Other"].map(
                    (t) => (
                      <option key={t}>{t}</option>
                    ),
                  )}
                </select>
              </div>

              {/* Message */}
              <div style={{ marginBottom: 22 }}>
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
                  Message *
                </label>
                <textarea
                  required
                  rows={3}
                  value={inquiryForm.message}
                  onChange={(e) =>
                    setInquiryForm({
                      ...inquiryForm,
                      message: e.target.value,
                    })
                  }
                  placeholder="I'm interested in this project and would like to know more about..."
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #e8ddd2",
                    background: "#fff",
                    fontSize: 14,
                    fontFamily: "'Jost', sans-serif",
                    color: "#1a0f00",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 99,
                  background: B.grad,
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={14}
                      style={{
                        animation: "spin 0.8s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    Sending…
                  </>
                ) : (
                  "Send Inquiry"
                )}
              </button>
            </form>

            <button
              onClick={() => setInquiryOpen(false)}
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
