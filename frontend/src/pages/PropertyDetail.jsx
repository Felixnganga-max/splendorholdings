import { useState, useEffect } from "react";
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
import axios from "axios";
import Gallery from "../components/Gallery";

// Try both possible API URLs
const API_BASE_URL = "https://splendorholdings-2v47.vercel.app/api/v1";

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
<Gallery />;

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
  const [liked, setLiked] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [interestForm, setInterestForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    preferredDate: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  // Fetch property from API
  // Fetch property from API
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError("No property ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        console.log("Fetching property ID:", id);

        const response = await axios.get(`${API_BASE_URL}/properties/${id}`, {
          headers,
        });

        console.log("API Response:", response.data);

        // Fix: Handle your API's response structure
        if (
          response.data.status === "success" &&
          response.data.data?.property
        ) {
          setProperty(response.data.data.property);
        } else if (response.data.success && response.data.data) {
          // Fallback for alternative response structure
          setProperty(response.data.data);
        } else {
          setError("Property not found in database");
        }
      } catch (err) {
        console.error("Fetch error:", err);

        if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
          setError(
            "Cannot connect to backend server. Please make sure it's running on port 5000",
          );
        } else if (err.response?.status === 404) {
          setError(`Property with ID "${id}" does not exist.`);
        } else if (err.response?.status === 500) {
          setError("Server error. Check your backend console.");
        } else {
          setError(err.response?.data?.message || "Failed to load property");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);
  // Handle inquiry submission
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        property: id,
        name: inquiryForm.name,
        email: inquiryForm.email,
        phone: inquiryForm.phone,
        message: inquiryForm.message,
        inquiryType: "general",
      };

      const response = await axios.post(`${API_BASE_URL}/inquiries`, payload, {
        headers,
      });

      if (response.data.success) {
        setSubmitMessage({
          type: "success",
          text: "Your inquiry has been sent! We'll get back to you soon.",
        });
        setInquiryForm({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => setBookingOpen(false), 2000);
      } else {
        setSubmitMessage({
          type: "error",
          text: response.data.message || "Failed to send inquiry",
        });
      }
    } catch (err) {
      console.error("Inquiry error:", err);
      setSubmitMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to send inquiry",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle interest submission
  const handleInterestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setSubmitMessage({
          type: "error",
          text: "Please login or create an account to show interest in this property.",
        });
        setSubmitting(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        property: id,
        items: [
          {
            property: id,
            unitType: property?.type || "Property",
            quantity: 1,
            price: property?.price || 0,
          },
        ],
        buyerInfo: {
          name: interestForm.fullName,
          email: interestForm.email,
          phone: interestForm.phone,
        },
        specialRequests: interestForm.message,
        preferredDate: interestForm.preferredDate,
      };

      const response = await axios.post(`${API_BASE_URL}/orders`, payload, {
        headers,
      });

      if (response.data.success) {
        setSubmitMessage({
          type: "success",
          text: "Interest registered successfully! Our team will contact you shortly.",
        });
        setInterestForm({
          fullName: "",
          email: "",
          phone: "",
          preferredDate: "",
          message: "",
        });
        setTimeout(() => setInterestOpen(false), 2000);
      } else {
        setSubmitMessage({
          type: "error",
          text: response.data.message || "Failed to register interest",
        });
      }
    } catch (err) {
      console.error("Interest error:", err);
      setSubmitMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to register interest",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
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
                borderTop: "3px solid #c2884a",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <div style={{ fontSize: 14, color: "#9a7c5a", marginTop: 16 }}>
              Loading property details...
            </div>
            <div style={{ fontSize: 12, color: "#b8a090", marginTop: 8 }}>
              Property ID: {id}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !property) {
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
          <div
            style={{
              fontSize: 48,
              marginBottom: 20,
            }}
          >
            🔍
          </div>
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
              : "Property Not Found"}
          </p>
          <p
            style={{
              fontSize: 14,
              color: "#9a7c5a",
              marginBottom: 24,
              whiteSpace: "pre-line",
              textAlign: "left",
              background: "#f5f0ea",
              padding: 16,
              borderRadius: 12,
              fontFamily: "monospace",
              fontSize: 12,
            }}
          >
            {error || `Property with ID "${id}" does not exist.`}
          </p>

          {error?.includes("Cannot connect") && (
            <div style={{ textAlign: "left", marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                To fix this:
              </p>
              <ol
                style={{
                  fontSize: 13,
                  color: "#6b5c4a",
                  marginLeft: 20,
                  lineHeight: 1.6,
                }}
              >
                <li>Open a terminal in your backend folder</li>
                <li>
                  Run:{" "}
                  <code
                    style={{
                      background: "#e8ddd2",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    npm start
                  </code>
                </li>
                <li>Make sure MongoDB is running</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}

          <button style={S.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Go back to listings
          </button>
        </div>
      </div>
    );
  }

  // Transform API property data
  const p = {
    id: property._id,
    name: property.name || "Property Name",
    location: property.location || "Location",
    price: property.priceLabel || `$${property.price?.toLocaleString() || "0"}`,
    badge: property.badge || property.type || "For Sale",
    badgeColor: property.isSoldOut
      ? "#dc2626"
      : property.isFeatured
        ? "#7B2D8B"
        : "#1d4ed8",
    imgs: property.images?.map((img) => img.url) || [],
    beds: property.beds || 0,
    baths: property.baths || 0,
    area: property.area || 0,
    description: property.description || "No description available.",
    amenities: property.features || [],
    rating: property.rating || 4.5,
    reviews: property.reviews || 0,
    floors: property.floors,
    yearBuilt: property.yearBuilt,
    type: property.type,
    garage: property.garage,
    status: property.isSoldOut
      ? "Sold Out"
      : property.isVisible
        ? "Available"
        : "Coming Soon",
    pricing: property.pricing || [],
    agent: property.agent || {
      name: "Sales Team",
      initials: "ST",
      role: "Property Consultant",
    },
  };

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} strokeWidth={2} />
          Back to listings
        </button>

        <Gallery imgs={p.imgs} badge={p.badge} badgeColor={p.badgeColor} />

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
              ({p.reviews} reviews)
            </span>
          </div>
        </div>

        <div style={S.divider} />

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

        <SectionTitle>Amenities</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "2px 0",
            marginTop: 14,
          }}
        >
          {(p.amenities || []).map((a) => (
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
            {p.agent.initials}
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
              {p.agent.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
                marginTop: 2,
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {p.agent.role}
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
              onClick={() => setInterestOpen(true)}
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
            >
              Show Interest
            </button>
          </div>
        </div>
      </div>

      {/* Ask a Question Modal */}
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
              Ask a Question
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

            {submitMessage.text && (
              <div
                style={{
                  padding: "10px 15px",
                  borderRadius: 10,
                  marginBottom: 20,
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
              <div style={{ marginBottom: 16 }}>
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
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={inquiryForm.name}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, name: e.target.value })
                  }
                  placeholder="Jane Doe"
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

              <div style={{ marginBottom: 16 }}>
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
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={inquiryForm.email}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, email: e.target.value })
                  }
                  placeholder="jane@example.com"
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

              <div style={{ marginBottom: 16 }}>
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={inquiryForm.phone}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, phone: e.target.value })
                  }
                  placeholder="+254 7XX XXX XXX"
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

              <div style={{ marginBottom: 24 }}>
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
                  Your Question *
                </label>
                <textarea
                  required
                  rows={3}
                  value={inquiryForm.message}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, message: e.target.value })
                  }
                  placeholder="I'm interested in this property and would like to know more about..."
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
                    resize: "vertical",
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
                  marginTop: 8,
                  background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Sending..." : "Send Question"}
              </button>
            </form>

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

      {/* Show Interest Modal */}
      {interestOpen && (
        <div
          onClick={() => setInterestOpen(false)}
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
              Show Interest
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#9a7c5a",
                marginBottom: 24,
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {p.name} · {p.price}
            </p>

            {submitMessage.text && (
              <div
                style={{
                  padding: "10px 15px",
                  borderRadius: 10,
                  marginBottom: 20,
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

            <form onSubmit={handleInterestSubmit}>
              <div style={{ marginBottom: 16 }}>
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
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={interestForm.fullName}
                  onChange={(e) =>
                    setInterestForm({
                      ...interestForm,
                      fullName: e.target.value,
                    })
                  }
                  placeholder="Jane Doe"
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

              <div style={{ marginBottom: 16 }}>
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
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={interestForm.email}
                  onChange={(e) =>
                    setInterestForm({ ...interestForm, email: e.target.value })
                  }
                  placeholder="jane@example.com"
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

              <div style={{ marginBottom: 16 }}>
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
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={interestForm.phone}
                  onChange={(e) =>
                    setInterestForm({ ...interestForm, phone: e.target.value })
                  }
                  placeholder="+254 7XX XXX XXX"
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

              <div style={{ marginBottom: 16 }}>
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
                  Preferred Viewing Date
                </label>
                <input
                  type="date"
                  value={interestForm.preferredDate}
                  onChange={(e) =>
                    setInterestForm({
                      ...interestForm,
                      preferredDate: e.target.value,
                    })
                  }
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

              <div style={{ marginBottom: 24 }}>
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
                  Additional Message
                </label>
                <textarea
                  rows={3}
                  value={interestForm.message}
                  onChange={(e) =>
                    setInterestForm({
                      ...interestForm,
                      message: e.target.value,
                    })
                  }
                  placeholder="Any specific requirements or questions..."
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
                    resize: "vertical",
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
                  marginTop: 8,
                  background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Submitting..." : "Submit Interest"}
              </button>
            </form>

            <button
              onClick={() => setInterestOpen(false)}
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
