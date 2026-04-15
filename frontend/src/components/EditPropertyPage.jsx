import { useRef, useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Upload,
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Maximize2,
  Tag,
  Percent,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Plus,
  ArrowLeft,
  Star,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api/v1";
const getToken = () => localStorage.getItem("accessToken");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

// ── Design tokens ─────────────────────────────────────────────────────────────
const PURPLE = "#7B2D8B";
const DPURPLE = "#4A1060";
const CREAM = "#fdf8f3";
const BORDER = "#f0e6d8";
const MUTED = "#7a6555";
const LABEL = "#b8a090";

const inputBase = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: `1.5px solid ${BORDER}`,
  background: CREAM,
  fontFamily: "'Jost',sans-serif",
  fontSize: 13,
  color: "#1a0f00",
  outline: "none",
  boxSizing: "border-box",
  transition: "border 0.2s",
};
const card = {
  background: "#fff",
  borderRadius: 20,
  border: `1.5px solid ${BORDER}`,
  padding: 24,
};

// ── Primitives ────────────────────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <div>
    <label
      style={{
        fontFamily: "'Jost',sans-serif",
        fontSize: 11,
        fontWeight: 500,
        color: LABEL,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        display: "block",
        marginBottom: 8,
      }}
    >
      {label}
    </label>
    {children}
    {hint && (
      <p
        style={{
          fontFamily: "'Jost',sans-serif",
          fontSize: 11,
          color: "#c8b09a",
          marginTop: 5,
        }}
      >
        {hint}
      </p>
    )}
  </div>
);

const IconInput = ({ icon: Icon, ...props }) => (
  <div style={{ position: "relative" }}>
    {Icon && (
      <Icon
        size={14}
        color="#c2884a"
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />
    )}
    <input
      {...props}
      style={{
        ...inputBase,
        ...(Icon ? { paddingLeft: 38 } : {}),
        ...props.style,
      }}
      onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
      onBlur={(e) => (e.target.style.borderColor = BORDER)}
    />
  </div>
);

const Toggle = ({ checked, onChange, label, activeColor = PURPLE }) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
    }}
  >
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 99,
        position: "relative",
        background: checked ? activeColor : "#e5e7eb",
        transition: "background 0.2s",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </div>
    <span
      style={{
        fontFamily: "'Jost',sans-serif",
        fontSize: 13,
        color: checked ? "#1a0f00" : MUTED,
        fontWeight: checked ? 500 : 400,
      }}
    >
      {label}
    </span>
  </label>
);

const PillBtn = ({ active, onClick, children, activeStyle }) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: "'Jost',sans-serif",
      fontSize: 12,
      fontWeight: active ? 600 : 400,
      padding: "8px 14px",
      borderRadius: 99,
      border: active ? "none" : `1.5px solid ${BORDER}`,
      background: active
        ? activeStyle?.bg || `linear-gradient(135deg,${PURPLE},${DPURPLE})`
        : "#fdf8f3",
      color: active ? activeStyle?.color || "#fff" : MUTED,
      cursor: "pointer",
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.borderColor = "#c2884a";
        e.currentTarget.style.color = PURPLE;
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.borderColor = BORDER;
        e.currentTarget.style.color = MUTED;
      }
    }}
  >
    {children}
  </button>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatKES = (amount) => {
  if (!amount && amount !== 0) return "—";
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `KES ${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K`;
  return `KES ${Number(amount).toLocaleString()}`;
};

const calcEffective = (original, offerMode, discountPercent, offerPrice) => {
  if (!original) return 0;
  const orig = Number(original);
  if (offerMode === "percent" && discountPercent)
    return orig * (1 - Number(discountPercent) / 100);
  if (offerMode === "fixed" && offerPrice) return Number(offerPrice);
  return orig;
};

const STATUSES = ["active", "draft", "archived", "sold", "rented"];

// ════════════════════════════════════════════════════════════════════════════
// EDIT PROPERTY PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function EditPropertyPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  // ── Categories ──────────────────────────────────────────────────────────────
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [badgeOptions, setBadgeOptions] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/categories`, {
      headers: authHeaders(),
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        const cats = data.data?.categories || [];
        setPropertyTypes(
          cats.filter((c) => c.kind === "type").map((c) => c.label),
        );
        setBadgeOptions(
          cats.filter((c) => c.kind === "badge").map((c) => c.label),
        );
      })
      .catch(() => {});
  }, []);

  // ── Load property ───────────────────────────────────────────────────────────
  const [property, setProperty] = useState(location.state?.property || null);
  const [fetchLoading, setFetchLoading] = useState(!property);

  useEffect(() => {
    if (property) return;
    setFetchLoading(true);
    fetch(`${API_BASE}/properties/${id}`, {
      headers: authHeaders(),
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setProperty(data.data?.property);
        setFetchLoading(false);
      })
      .catch(() => setFetchLoading(false));
  }, [id]);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setFormState] = useState(null);

  useEffect(() => {
    if (!property) return;
    const p = property.pricing || {};
    let offerMode = "none";
    if (p.discountPercent != null) offerMode = "percent";
    else if (p.offerPrice != null) offerMode = "fixed";

    setFormState({
      name: property.name || "",
      location: property.location || "",
      price: p.original ?? property.price ?? "",
      priceLabel: p.label || property.priceLabel || "",
      beds: property.beds ?? "",
      baths: property.baths ?? "",
      area: property.area ?? "",
      type: property.type || "",
      badge: property.badge || "",
      description: property.description || "",
      features: property.features || [],
      status: property.status || "active",
      // Offer
      offerMode,
      discountPercent: p.discountPercent ?? "",
      offerPrice: p.offerPrice ?? "",
      offerExpiresAt: p.offerExpiresAt
        ? new Date(p.offerExpiresAt).toISOString().split("T")[0]
        : "",
      // Toggles
      isVisible: property.isVisible ?? true,
      isSoldOut: property.isSoldOut ?? false,
      isFeatured: property.isFeatured ?? false,
      featuredUntil: property.featuredUntil
        ? new Date(property.featuredUntil).toISOString().split("T")[0]
        : "",
    });
    setImages(property.images || []);
  }, [property]);

  // ── Image state ─────────────────────────────────────────────────────────────
  const [images, setImages] = useState([]); // existing Cloudinary images
  const [newFiles, setNewFiles] = useState([]); // { file, preview }
  const [removingImg, setRemovingImg] = useState(null);

  // ── Features ────────────────────────────────────────────────────────────────
  const [featureInput, setFeatureInput] = useState("");

  // ── Submit state ────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (fetchLoading)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}
      >
        <Loader2
          size={32}
          color={PURPLE}
          style={{ animation: "spin 0.8s linear infinite" }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  if (!form)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ fontFamily: "'Jost',sans-serif", color: MUTED }}>
          Property not found.
        </p>
      </div>
    );

  // ── Pricing live preview ────────────────────────────────────────────────────
  const effective = calcEffective(
    form.price,
    form.offerMode,
    form.discountPercent,
    form.offerPrice,
  );
  const savings = Number(form.price) - effective;
  const savingsPct =
    form.price && savings > 0
      ? Math.round((savings / Number(form.price)) * 100)
      : 0;
  const hasOffer = form.offerMode !== "none" && savings > 0;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const set = (key) => (e) => {
    setFormState((prev) => ({ ...prev, [key]: e.target.value }));
    setError("");
  };
  const setDirect = (key, val) => {
    setFormState((prev) => ({ ...prev, [key]: val }));
    setError("");
  };

  const addFiles = (files) => {
    const incoming = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setNewFiles((prev) => [...prev, ...incoming].slice(0, 10 - images.length));
  };

  const removeNewFile = (idx) => {
    setNewFiles((prev) => {
      const c = [...prev];
      URL.revokeObjectURL(c[idx].preview);
      c.splice(idx, 1);
      return c;
    });
  };

  const removeExisting = async (imgId) => {
    setRemovingImg(imgId);
    try {
      const res = await fetch(`${API_BASE}/properties/${id}/images/${imgId}`, {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setImages(data.data.property.images);
    } catch (e) {
      setError(e.message);
    } finally {
      setRemovingImg(null);
    }
  };

  const addFeature = () => {
    const t = featureInput.trim();
    if (!t || form.features.includes(t)) return;
    setDirect("features", [...form.features, t]);
    setFeatureInput("");
  };

  const removeFeature = (i) =>
    setDirect(
      "features",
      form.features.filter((_, idx) => idx !== i),
    );

  const submit = async () => {
    if (!form.name.trim()) {
      setError("Property name is required.");
      return;
    }
    if (!form.location.trim()) {
      setError("Location is required.");
      return;
    }
    if (!form.price) {
      setError("Price is required.");
      return;
    }
    if (!form.type) {
      setError("Property type is required.");
      return;
    }
    if (
      form.offerMode === "percent" &&
      (Number(form.discountPercent) < 0 || Number(form.discountPercent) > 99)
    ) {
      setError("Discount must be between 0 and 99%.");
      return;
    }
    if (
      form.offerMode === "fixed" &&
      Number(form.offerPrice) >= Number(form.price)
    ) {
      setError("Offer price must be less than the original price.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const body = new FormData();
      const scalars = [
        "name",
        "location",
        "beds",
        "baths",
        "area",
        "type",
        "badge",
        "description",
        "status",
      ];
      scalars.forEach((f) => {
        if (form[f] !== undefined && form[f] !== "") body.append(f, form[f]);
      });
      body.append("price", form.price);
      if (form.priceLabel) body.append("priceLabel", form.priceLabel);

      if (form.offerMode === "percent" && form.discountPercent !== "") {
        body.append("discountPercent", form.discountPercent);
        if (form.offerExpiresAt)
          body.append("offerExpiresAt", form.offerExpiresAt);
      } else if (form.offerMode === "fixed" && form.offerPrice !== "") {
        body.append("offerPrice", form.offerPrice);
        if (form.offerExpiresAt)
          body.append("offerExpiresAt", form.offerExpiresAt);
      } else if (form.offerMode === "none") {
        body.append("clearOffer", "true");
      }

      body.append("isVisible", form.isVisible);
      body.append("isSoldOut", form.isSoldOut);
      body.append("isFeatured", form.isFeatured);
      if (form.featuredUntil) body.append("featuredUntil", form.featuredUntil);

      form.features.forEach((ft) => body.append("features", ft));
      newFiles.forEach(({ file }) => body.append("images", file));

      const res = await fetch(`${API_BASE}/properties/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        credentials: "include",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed.");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("/admin/properties");
      }, 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 960, margin: "0 auto" }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => navigate("/admin/properties")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Jost',sans-serif",
            fontSize: 12,
            color: MUTED,
            marginBottom: 16,
            padding: 0,
          }}
        >
          <ArrowLeft size={14} /> Back to Properties
        </button>
        <p
          style={{
            fontFamily: "'Jost',sans-serif",
            fontSize: 12,
            color: "#b45309",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 500,
            marginBottom: 6,
          }}
        >
          Property Management
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "clamp(1.8rem,3vw,2.6rem)",
            fontWeight: 700,
            color: "#1a0f00",
          }}
        >
          Edit Property
        </h1>
      </div>

      {/* ── Banners ── */}
      {success && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#d1fae5",
            border: "1.5px solid #6ee7b7",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 28,
          }}
        >
          <CheckCircle size={18} color="#0d6e5e" />
          <span
            style={{
              fontFamily: "'Jost',sans-serif",
              fontSize: 13,
              color: "#0d6e5e",
              fontWeight: 500,
            }}
          >
            Saved! Redirecting…
          </span>
        </div>
      )}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#fef2f2",
            border: "1.5px solid #fca5a5",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 28,
          }}
        >
          <AlertCircle size={18} color="#dc2626" />
          <span
            style={{
              fontFamily: "'Jost',sans-serif",
              fontSize: 13,
              color: "#dc2626",
              fontWeight: 500,
            }}
          >
            {error}
          </span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Core details */}
          <div style={card}>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#1a0f00",
                marginBottom: 20,
              }}
            >
              Property Details
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Field label="Property Name *">
                <IconInput
                  icon={Home}
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g. Amalia Springs"
                />
              </Field>
              <Field label="Location *">
                <IconInput
                  icon={MapPin}
                  value={form.location}
                  onChange={set("location")}
                  placeholder="e.g. Kiamiti Road, Nairobi"
                />
              </Field>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Beds">
                  <IconInput
                    icon={Bed}
                    value={form.beds}
                    onChange={set("beds")}
                    type="number"
                    placeholder="4"
                  />
                </Field>
                <Field label="Baths">
                  <IconInput
                    icon={Bath}
                    value={form.baths}
                    onChange={set("baths")}
                    type="number"
                    placeholder="3"
                  />
                </Field>
                <Field label="Area m²">
                  <IconInput
                    icon={Maximize2}
                    value={form.area}
                    onChange={set("area")}
                    type="number"
                    placeholder="250"
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  rows={4}
                  placeholder="Describe the property…"
                  style={{ ...inputBase, resize: "vertical", lineHeight: 1.7 }}
                  onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
                  onBlur={(e) => (e.target.style.borderColor = BORDER)}
                />
              </Field>
              <Field label="Key Features" hint="Press Enter or click + to add">
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addFeature())
                    }
                    placeholder="e.g. Swimming pool, BQ…"
                    style={{ ...inputBase, fontSize: 12, padding: "10px 14px" }}
                    onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  />
                  <button
                    onClick={addFeature}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      border: "none",
                      background: `linear-gradient(135deg,${PURPLE},${DPURPLE})`,
                      color: "#fff",
                      cursor: "pointer",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {form.features.map((f, i) => (
                    <span
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        background: "#f3e8ff",
                        color: PURPLE,
                        fontSize: 11,
                        fontWeight: 500,
                        padding: "4px 10px",
                        borderRadius: 99,
                        fontFamily: "'Jost',sans-serif",
                      }}
                    >
                      {f}
                      <button
                        onClick={() => removeFeature(i)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <X size={10} color={PURPLE} />
                      </button>
                    </span>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* ── Pricing & Offers ── */}
          <div style={card}>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#1a0f00",
                marginBottom: 4,
              }}
            >
              Pricing & Offers
            </h3>
            <p
              style={{
                fontFamily: "'Jost',sans-serif",
                fontSize: 12,
                color: MUTED,
                marginBottom: 20,
              }}
            >
              Set the original price, then optionally apply a discount or fixed
              offer.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Original Price (KES) *">
                  <IconInput
                    icon={DollarSign}
                    value={form.price}
                    onChange={set("price")}
                    type="number"
                    placeholder="24500000"
                  />
                </Field>
                <Field label="Price Label" hint="e.g. Per month">
                  <IconInput
                    icon={Tag}
                    value={form.priceLabel}
                    onChange={set("priceLabel")}
                    placeholder="Per month"
                  />
                </Field>
              </div>

              {/* Offer mode selector */}
              <Field label="Offer Type">
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { val: "none", label: "No offer" },
                    { val: "percent", label: "% Discount" },
                    { val: "fixed", label: "Fixed price" },
                  ].map(({ val, label }) => (
                    <PillBtn
                      key={val}
                      active={form.offerMode === val}
                      onClick={() => setDirect("offerMode", val)}
                    >
                      {label}
                    </PillBtn>
                  ))}
                </div>
              </Field>

              {/* Percent mode */}
              {form.offerMode === "percent" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <Field label="Discount %" hint="0 – 99">
                    <div style={{ position: "relative" }}>
                      <Percent
                        size={14}
                        color="#c2884a"
                        style={{
                          position: "absolute",
                          left: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        value={form.discountPercent}
                        onChange={set("discountPercent")}
                        type="number"
                        min={0}
                        max={99}
                        placeholder="35"
                        style={{ ...inputBase, paddingLeft: 38 }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#c2884a")
                        }
                        onBlur={(e) => (e.target.style.borderColor = BORDER)}
                      />
                    </div>
                  </Field>
                  <Field label="Offer Expires">
                    <div style={{ position: "relative" }}>
                      <Calendar
                        size={14}
                        color="#c2884a"
                        style={{
                          position: "absolute",
                          left: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        value={form.offerExpiresAt}
                        onChange={set("offerExpiresAt")}
                        type="date"
                        style={{ ...inputBase, paddingLeft: 38 }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#c2884a")
                        }
                        onBlur={(e) => (e.target.style.borderColor = BORDER)}
                      />
                    </div>
                  </Field>
                </div>
              )}

              {/* Fixed mode */}
              {form.offerMode === "fixed" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <Field
                    label="Offer Price (KES)"
                    hint="Must be less than original"
                  >
                    <IconInput
                      icon={DollarSign}
                      value={form.offerPrice}
                      onChange={set("offerPrice")}
                      type="number"
                      placeholder="20000000"
                    />
                  </Field>
                  <Field label="Offer Expires">
                    <div style={{ position: "relative" }}>
                      <Calendar
                        size={14}
                        color="#c2884a"
                        style={{
                          position: "absolute",
                          left: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        value={form.offerExpiresAt}
                        onChange={set("offerExpiresAt")}
                        type="date"
                        style={{ ...inputBase, paddingLeft: 38 }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#c2884a")
                        }
                        onBlur={(e) => (e.target.style.borderColor = BORDER)}
                      />
                    </div>
                  </Field>
                </div>
              )}

              {/* Live pricing preview */}
              {form.price && (
                <div
                  style={{
                    background: hasOffer ? "#fef3c7" : CREAM,
                    borderRadius: 14,
                    padding: "14px 18px",
                    border: `1.5px solid ${hasOffer ? "#fcd34d" : BORDER}`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Jost',sans-serif",
                      fontSize: 11,
                      color: LABEL,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Pricing Preview
                  </p>
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 10 }}
                  >
                    {hasOffer ? (
                      <>
                        <span
                          style={{
                            fontFamily: "'Cormorant Garamond',serif",
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#dc2626",
                          }}
                        >
                          {formatKES(effective)}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Jost',sans-serif",
                            fontSize: 14,
                            color: MUTED,
                            textDecoration: "line-through",
                          }}
                        >
                          {formatKES(Number(form.price))}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Jost',sans-serif",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "2px 8px",
                            borderRadius: 99,
                          }}
                        >
                          Save {formatKES(savings)} ({savingsPct}% off)
                        </span>
                      </>
                    ) : (
                      <span
                        style={{
                          fontFamily: "'Cormorant Garamond',serif",
                          fontSize: 22,
                          fontWeight: 700,
                          color: "#1a0f00",
                        }}
                      >
                        {formatKES(Number(form.price))}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Classification */}
          <div style={card}>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#1a0f00",
                marginBottom: 20,
              }}
            >
              Classification
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Field label="Property Type *">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {propertyTypes.map((t) => (
                    <PillBtn
                      key={t}
                      active={form.type === t}
                      onClick={() => setDirect("type", t)}
                    >
                      {t}
                    </PillBtn>
                  ))}
                </div>
              </Field>
              <Field label="Badge">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {badgeOptions.map((b) => (
                    <PillBtn
                      key={b}
                      active={form.badge === b}
                      onClick={() =>
                        setDirect("badge", form.badge === b ? "" : b)
                      }
                      activeStyle={{ bg: "#b45309", color: "#fff" }}
                    >
                      {b}
                    </PillBtn>
                  ))}
                </div>
              </Field>
              <Field label="Status">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {STATUSES.map((s) => (
                    <PillBtn
                      key={s}
                      active={form.status === s}
                      onClick={() => setDirect("status", s)}
                    >
                      {s}
                    </PillBtn>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* Visibility & Flags */}
          <div style={card}>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#1a0f00",
                marginBottom: 4,
              }}
            >
              Visibility & Flags
            </h3>
            <p
              style={{
                fontFamily: "'Jost',sans-serif",
                fontSize: 12,
                color: MUTED,
                marginBottom: 20,
              }}
            >
              Control what the public sees and how this listing is tagged.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Toggle
                checked={form.isVisible}
                onChange={(v) => setDirect("isVisible", v)}
                label={
                  form.isVisible ? "Visible to public" : "Hidden from public"
                }
                activeColor={PURPLE}
              />
              <Toggle
                checked={form.isSoldOut}
                onChange={(v) => setDirect("isSoldOut", v)}
                label={
                  form.isSoldOut ? "Marked as Sold Out" : "Mark as Sold Out"
                }
                activeColor="#6b7280"
              />
              <div>
                <Toggle
                  checked={form.isFeatured}
                  onChange={(v) => setDirect("isFeatured", v)}
                  label={form.isFeatured ? "Featured listing" : "Not featured"}
                  activeColor="#F59E0B"
                />
                {form.isFeatured && (
                  <div style={{ marginTop: 10 }}>
                    <Field
                      label="Featured Until"
                      hint="Leave blank to feature indefinitely"
                    >
                      <div style={{ position: "relative" }}>
                        <Calendar
                          size={14}
                          color="#c2884a"
                          style={{
                            position: "absolute",
                            left: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                          }}
                        />
                        <input
                          value={form.featuredUntil}
                          onChange={set("featuredUntil")}
                          type="date"
                          style={{ ...inputBase, paddingLeft: 38 }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#c2884a")
                          }
                          onBlur={(e) => (e.target.style.borderColor = BORDER)}
                        />
                      </div>
                    </Field>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div style={card}>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#1a0f00",
                marginBottom: 4,
              }}
            >
              Images
            </h3>
            <p
              style={{
                fontFamily: "'Jost',sans-serif",
                fontSize: 12,
                color: MUTED,
                marginBottom: 16,
              }}
            >
              First image is the cover. Max 10 total.
            </p>

            {/* Existing images */}
            {images.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(72px,1fr))",
                  gap: 7,
                  marginBottom: 16,
                }}
              >
                {images.map((img, idx) => (
                  <div
                    key={img._id}
                    style={{
                      position: "relative",
                      borderRadius: 8,
                      overflow: "hidden",
                      aspectRatio: "1",
                      border:
                        idx === 0
                          ? `2px solid ${PURPLE}`
                          : "2px solid transparent",
                    }}
                  >
                    <img
                      src={img.url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {idx === 0 && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 3,
                          left: 3,
                          background: PURPLE,
                          color: "#fff",
                          fontSize: 8,
                          fontWeight: 700,
                          fontFamily: "'Jost',sans-serif",
                          padding: "2px 5px",
                          borderRadius: 99,
                        }}
                      >
                        PRIMARY
                      </span>
                    )}
                    <button
                      onClick={() => removeExisting(img._id)}
                      disabled={removingImg === img._id}
                      style={{
                        position: "absolute",
                        top: 3,
                        right: 3,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.65)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      {removingImg === img._id ? (
                        <Loader2
                          size={8}
                          color="#fff"
                          style={{ animation: "spin 0.8s linear infinite" }}
                        />
                      ) : (
                        <X size={9} color="#fff" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            {images.length + newFiles.length < 10 && (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  addFiles(e.dataTransfer.files);
                }}
                style={{
                  border: "2px dashed #e8ddd2",
                  borderRadius: 12,
                  padding: "24px 20px",
                  textAlign: "center",
                  background: CREAM,
                  cursor: "pointer",
                  marginBottom: 10,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#c2884a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#e8ddd2")
                }
              >
                <Upload
                  size={18}
                  color={PURPLE}
                  strokeWidth={1.8}
                  style={{ margin: "0 auto 8px", display: "block" }}
                />
                <p
                  style={{
                    fontFamily: "'Jost',sans-serif",
                    fontSize: 12,
                    color: MUTED,
                  }}
                >
                  Drop or{" "}
                  <span style={{ color: PURPLE, fontWeight: 600 }}>browse</span>
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            {/* New file previews */}
            {newFiles.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(64px,1fr))",
                  gap: 7,
                }}
              >
                {newFiles.map(({ preview }, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      borderRadius: 8,
                      overflow: "hidden",
                      aspectRatio: "1",
                    }}
                  >
                    <img
                      src={preview}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      onClick={() => removeNewFile(idx)}
                      style={{
                        position: "absolute",
                        top: 3,
                        right: 3,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.65)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <X size={9} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              border: "none",
              background: loading
                ? "#9ca3af"
                : `linear-gradient(135deg,${PURPLE},${DPURPLE})`,
              color: "#fff",
              fontFamily: "'Jost',sans-serif",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: loading ? "none" : "0 8px 28px rgba(123,45,139,0.3)",
              transition: "filter 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.filter = "brightness(1.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />{" "}
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
