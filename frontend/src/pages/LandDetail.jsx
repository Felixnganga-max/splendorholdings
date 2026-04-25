import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Maximize2,
  Ruler,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle2,
  TreePine,
  Mountain,
  Layers,
  FileText,
  Building2,
  Tag,
} from "lucide-react";
import axios from "axios";
import Gallery from "../components/Gallery";

const API_BASE_URL = "https://splendorholdings-2v47.vercel.app/api/v1";

// ─── Font injection ───────────────────────────────────────────────────────────
if (!document.querySelector("#land-detail-fonts")) {
  const l = document.createElement("link");
  l.id = "land-detail-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;500;700&display=swap";
  document.head.appendChild(l);
}

// ─── Tokens — earthy green land palette ──────────────────────────────────────
const T = {
  bg: "#f5f7f2",
  cardBg: "#ffffff",
  primary: "#2d5a3d",
  secondary: "#4a7c59",
  accent: "#d4af37",
  text: "#1a2e1f",
  muted: "#6b7c6e",
  border: "#dde8de",
  beige: "#ede8dc",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Lato', 'Helvetica Neue', Arial, sans-serif",
  grad: "linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)",
  accentGrad: "linear-gradient(135deg, #b8941f 0%, #d4af37 100%)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(property) {
  if (property.pricing?.label) return property.pricing.label;
  const n = property.pricing?.original;
  if (!n) return "—";
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `KES ${(n / 1_000).toFixed(0)}K`;
  return `KES ${n}`;
}

function formatLandArea(landArea) {
  if (!landArea?.value) return null;
  const { value, unit } = landArea;
  const display = Number.isInteger(value) ? value : value.toFixed(2);
  return `${display} ${unit}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 5,
        marginBottom: 18,
      }}
    >
      <span
        style={{
          fontFamily: T.sans,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: T.secondary,
        }}
      >
        {children}
      </span>
      <div
        style={{
          height: 2,
          background: T.accentGrad,
          borderRadius: 2,
          width: 40,
        }}
      />
    </div>
  );
}

function SpecCard({ icon: Icon, label, value, accent }) {
  return (
    <div
      style={{
        background: T.cardBg,
        borderRadius: 16,
        padding: "18px 20px",
        border: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: accent ? "rgba(212,175,55,0.12)" : "rgba(45,90,61,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon
          size={17}
          color={accent ? T.accent : T.secondary}
          strokeWidth={1.8}
        />
      </div>
      <div>
        <div
          style={{
            fontSize: 10,
            color: T.muted,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: T.sans,
            marginBottom: 3,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: T.text,
            fontFamily: T.sans,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Main LandDetail page ─────────────────────────────────────────────────────
export default function LandDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (!id) {
      setError("No property ID provided");
      setLoading(false);
      return;
    }
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_BASE_URL}/properties/${id}`, {
          headers,
        });
        const data = response.data;
        if (data.status === "success" && data.data?.property) {
          setProperty(data.data.property);
        } else if (data.success && data.data) {
          setProperty(data.data);
        } else {
          setError("Property not found.");
        }
      } catch (err) {
        if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
          setError("Cannot connect to server.");
        } else if (err.response?.status === 404) {
          setError(`Plot with ID "${id}" does not exist.`);
        } else {
          setError(err.response?.data?.message || "Failed to load property.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          background: T.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              width: 44,
              height: 44,
              border: `3px solid ${T.border}`,
              borderTop: `3px solid ${T.secondary}`,
              borderRadius: "50%",
              animation: "ld-spin 0.9s linear infinite",
            }}
          />
          <style>{`@keyframes ld-spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              fontFamily: T.sans,
              fontSize: 13,
              color: T.muted,
              marginTop: 16,
            }}
          >
            Loading plot details…
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div
        style={{
          background: T.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <TreePine
            size={52}
            color={T.secondary}
            strokeWidth={1.2}
            style={{ marginBottom: 20 }}
          />
          <div
            style={{
              fontFamily: T.serif,
              fontSize: 26,
              fontWeight: 700,
              color: T.text,
              marginBottom: 12,
            }}
          >
            Plot Not Found
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: T.muted,
              background: T.beige,
              padding: 16,
              borderRadius: 12,
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            {error}
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              borderRadius: 99,
              background: T.grad,
              border: "none",
              color: "#fff",
              fontFamily: T.sans,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={15} /> Back to Land &amp; Plots
          </button>
        </div>
      </div>
    );
  }

  const price = formatPrice(property);
  const landArea = formatLandArea(property.landArea);
  const imgs = property.images?.map((img) => img.url) || [];
  const status = property.isSoldOut
    ? "Sold Out"
    : property.isVisible
      ? "Available"
      : "Coming Soon";

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.sans }}>
      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .spec-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .spec-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "0 clamp(1rem, 4vw, 2.5rem) 80px",
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "24px 0 18px",
            fontFamily: T.sans,
            fontSize: 13,
            fontWeight: 500,
            color: T.secondary,
            background: "none",
            border: "none",
            cursor: "pointer",
            letterSpacing: "0.04em",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = T.primary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = T.secondary)}
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back to Land &amp; Plots
        </button>

        {/* Gallery */}
        <div style={{ borderRadius: 24, overflow: "hidden", marginBottom: 32 }}>
          <Gallery
            imgs={imgs}
            badge={property.badge}
            badgeColor={property.isSoldOut ? "#dc2626" : "#2d5a3d"}
            propertyName={property.name}
          />
        </div>

        {/* Title + Price row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 24,
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            {/* Badge strip */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: T.grad,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "4px 14px",
                  borderRadius: 99,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: T.sans,
                }}
              >
                {property.badge ?? "Land"}
              </span>
              <span
                style={{
                  background: "rgba(45,90,61,0.08)",
                  color: T.secondary,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "4px 14px",
                  borderRadius: 99,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: T.sans,
                  border: `1px solid rgba(45,90,61,0.2)`,
                }}
              >
                {property.type ?? "Land"}
              </span>
              {property.listingIntent === "rent" ||
              property.listingIntent === "both" ? (
                <span
                  style={{
                    background: "rgba(212,175,55,0.12)",
                    color: "#9a7500",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 14px",
                    borderRadius: 99,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontFamily: T.sans,
                    border: "1px solid rgba(212,175,55,0.3)",
                  }}
                >
                  For Lease
                </span>
              ) : null}
            </div>

            <h1
              style={{
                fontFamily: T.serif,
                fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
                fontWeight: 700,
                lineHeight: 1.08,
                color: T.text,
                marginBottom: 10,
              }}
            >
              {property.name}
              {property.buildingName && (
                <span
                  style={{
                    display: "block",
                    fontSize: "0.6em",
                    fontWeight: 400,
                    color: T.muted,
                    fontStyle: "italic",
                    marginTop: 4,
                  }}
                >
                  {property.buildingName}
                </span>
              )}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={14} color={T.accent} strokeWidth={2} />
              <span
                style={{ fontSize: 14, color: T.muted, fontFamily: T.sans }}
              >
                {property.location}
              </span>
            </div>
          </div>

          {/* Price block */}
          <div
            style={{
              background: T.cardBg,
              border: `1px solid ${T.border}`,
              borderRadius: 20,
              padding: "20px 24px",
              textAlign: "right",
              minWidth: 160,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: T.muted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: T.sans,
                marginBottom: 6,
              }}
            >
              Listed Price
            </div>
            <div
              style={{
                fontFamily: T.serif,
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 700,
                color: T.text,
                lineHeight: 1,
              }}
            >
              {price}
            </div>
            {property.pricing?.hasActiveOffer && (
              <div
                style={{
                  fontSize: 11,
                  color: T.secondary,
                  fontFamily: T.sans,
                  marginTop: 6,
                  fontWeight: 700,
                }}
              >
                {property.pricing.offerLabel}
              </div>
            )}
            {/* Rental pricing if applicable */}
            {property.rentalPricing?.label && (
              <div
                style={{
                  fontSize: 12,
                  color: T.muted,
                  fontFamily: T.sans,
                  marginTop: 4,
                }}
              >
                {property.rentalPricing.label}
              </div>
            )}
          </div>
        </div>

        {/* Quick specs pill row */}
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "center",
            padding: "14px 20px",
            background: T.cardBg,
            borderRadius: 16,
            border: `1px solid ${T.border}`,
            marginBottom: 36,
          }}
        >
          {landArea && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Ruler size={15} color={T.accent} strokeWidth={1.8} />
              <span
                style={{ fontSize: 14, color: T.muted, fontFamily: T.sans }}
              >
                <strong style={{ color: T.text }}>{landArea}</strong> land area
              </span>
            </div>
          )}
          {property.area > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Maximize2 size={14} color={T.accent} strokeWidth={1.8} />
              <span
                style={{ fontSize: 14, color: T.muted, fontFamily: T.sans }}
              >
                <strong style={{ color: T.text }}>{property.area} m²</strong>{" "}
                built-up
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Globe size={14} color={T.accent} strokeWidth={1.8} />
            <span style={{ fontSize: 14, color: T.muted, fontFamily: T.sans }}>
              <strong style={{ color: T.text }}>{status}</strong>
            </span>
          </div>
          {property.listingMode && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Layers size={14} color={T.accent} strokeWidth={1.8} />
              <span
                style={{ fontSize: 14, color: T.muted, fontFamily: T.sans }}
              >
                <strong style={{ color: T.text }}>
                  {property.listingMode === "unit"
                    ? "Unit / Section"
                    : "Whole Parcel"}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, ${T.border}, transparent)`,
            marginBottom: 32,
          }}
        />

        {/* Description */}
        {property.description && (
          <>
            <SectionTitle>About This Plot</SectionTitle>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.9,
                color: T.muted,
                fontFamily: T.sans,
                fontWeight: 300,
                maxWidth: 760,
                marginBottom: 36,
              }}
            >
              {property.description}
            </p>
            <div
              style={{
                height: 1,
                background: `linear-gradient(90deg, ${T.border}, transparent)`,
                marginBottom: 32,
              }}
            />
          </>
        )}

        {/* Features / Amenities */}
        {property.features?.length > 0 && (
          <>
            <SectionTitle>Features &amp; Highlights</SectionTitle>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "4px 0",
                marginBottom: 36,
              }}
            >
              {property.features.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "8px 0",
                    fontSize: 14,
                    color: T.muted,
                    fontFamily: T.sans,
                  }}
                >
                  <CheckCircle2 size={14} color={T.secondary} strokeWidth={2} />
                  {f}
                </div>
              ))}
            </div>
            <div
              style={{
                height: 1,
                background: `linear-gradient(90deg, ${T.border}, transparent)`,
                marginBottom: 32,
              }}
            />
          </>
        )}

        {/* Overview / Spec cards */}
        <SectionTitle>Plot Overview</SectionTitle>
        <div
          className="spec-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 40,
          }}
        >
          {landArea && (
            <SpecCard icon={Ruler} label="Land Area" value={landArea} accent />
          )}
          {property.area > 0 && (
            <SpecCard
              icon={Maximize2}
              label="Built-up"
              value={`${property.area} m²`}
            />
          )}
          {property.type && (
            <SpecCard icon={Building2} label="Type" value={property.type} />
          )}
          {property.listingMode && (
            <SpecCard
              icon={Layers}
              label="Listing Mode"
              value={property.listingMode === "unit" ? "Unit" : "Whole"}
            />
          )}
          {property.listingIntent && (
            <SpecCard
              icon={Tag}
              label="Intent"
              value={
                property.listingIntent === "both"
                  ? "Sale & Lease"
                  : property.listingIntent === "rent"
                    ? "For Lease"
                    : "For Sale"
              }
            />
          )}
          <SpecCard icon={Globe} label="Status" value={status} />
          {property.landArea?.unit && (
            <SpecCard
              icon={Mountain}
              label="Land Unit"
              value={property.landArea.unit}
            />
          )}
          {property.buildingName && (
            <SpecCard
              icon={FileText}
              label="Development"
              value={property.buildingName}
            />
          )}
        </div>

        {/* Contact + Inquiry */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, ${T.border}, transparent)`,
            marginBottom: 32,
          }}
        />
       
      </div>
    </div>
  );
}
