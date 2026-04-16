import { useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Home,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ImageOff,
  Tag,
  Star,
  Percent,
  DollarSign,
  Calendar,
  CheckCircle,
  Upload,
  ArrowLeft,
  Building2,
  Layers,
  TrendingUp,
  Ruler,
  RefreshCw,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useManageProperties } from "../Hooks/useManageProperties";
import { useNavigate } from "react-router-dom";

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUSES = ["active", "draft", "archived", "sold", "rented"];
const LISTING_MODES = ["whole", "unit"];
const LISTING_INTENTS = ["sale", "rent", "both"];
const LAND_UNITS = ["acres", "hectares", "sqm", "sqft"];

const SORTS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Oldest", value: "createdAt" },
  { label: "Price ↑", value: "pricing.original" },
  { label: "Price ↓", value: "-pricing.original" },
  { label: "Most viewed", value: "-viewCount" },
  { label: "Featured", value: "-isFeatured -createdAt" },
];

// ── Tokens ─────────────────────────────────────────────────────────────────────
const P = "#7B2D8B";
const DP = "#4A1060";
const CREAM = "#fdf8f3";
const BORDER = "#f0e6d8";
const MUTED = "#7a6555";
const LABEL = "#b8a090";
const AMBER = "#b45309";

// ── Style helpers ──────────────────────────────────────────────────────────────
const card = {
  background: "#fff",
  borderRadius: 20,
  border: `1.5px solid ${BORDER}`,
  padding: 24,
};

const inputBase = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: `1.5px solid ${BORDER}`,
  background: CREAM,
  fontFamily: "'Jost', sans-serif",
  fontSize: 13,
  color: "#1a0f00",
  outline: "none",
  boxSizing: "border-box",
  transition: "border 0.2s",
};

const editBase = { ...inputBase, padding: "11px 14px", borderRadius: 12 };

// ── Primitives ─────────────────────────────────────────────────────────────────
const Field = ({ label, children, hint, required }) => (
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
      {required && <span style={{ color: "#dc2626", marginLeft: 3 }}>*</span>}
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

const focus = (e) => (e.target.style.borderColor = "#c2884a");
const blur = (e) => (e.target.style.borderColor = BORDER);

const Input = ({ icon: Icon, ...props }) => (
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
        ...editBase,
        ...(Icon ? { paddingLeft: 38 } : {}),
        ...props.style,
      }}
      onFocus={focus}
      onBlur={blur}
    />
  </div>
);

const EditSelect = ({ icon: Icon, children, ...props }) => (
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
          zIndex: 1,
        }}
      />
    )}
    <select
      {...props}
      style={{
        ...editBase,
        paddingRight: 32,
        ...(Icon ? { paddingLeft: 38 } : {}),
        cursor: "pointer",
        appearance: "none",
        ...props.style,
      }}
      onFocus={focus}
      onBlur={blur}
    >
      {children}
    </select>
  </div>
);

const StatusPill = ({ status }) => {
  const m = {
    active: { bg: "#d1fae5", c: "#065f46" },
    draft: { bg: "#fef3c7", c: "#92400e" },
    archived: { bg: "#f3f4f6", c: "#4b5563" },
    sold: { bg: "#ede9fe", c: "#5b21b6" },
    rented: { bg: "#dbeafe", c: "#1e40af" },
  };
  const s = m[status] || m.draft;
  return (
    <span
      style={{
        background: s.bg,
        color: s.c,
        fontSize: 10,
        fontWeight: 600,
        fontFamily: "'Jost',sans-serif",
        padding: "3px 9px",
        borderRadius: 99,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {status}
    </span>
  );
};

const IntentBadge = ({ intent }) => {
  const m = {
    sale: { bg: "#fef3c7", c: "#92400e" },
    rent: { bg: "#dbeafe", c: "#1e40af" },
    both: { bg: "#f3e8ff", c: "#6b21a8" },
  };
  const s = m[intent] || m.sale;
  return (
    <span
      style={{
        background: s.bg,
        color: s.c,
        fontSize: 9,
        fontWeight: 700,
        fontFamily: "'Jost',sans-serif",
        padding: "2px 8px",
        borderRadius: 99,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {intent}
    </span>
  );
};

const IconBtn = ({ onClick, title, children, danger, active, activeColor }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      border: `1.5px solid ${danger ? "#fca5a5" : BORDER}`,
      background: active ? activeColor || P + "18" : danger ? "#fff5f5" : CREAM,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s",
      flexShrink: 0,
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.borderColor = danger
        ? "#dc2626"
        : activeColor || P)
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.borderColor = danger ? "#fca5a5" : BORDER)
    }
  >
    {children}
  </button>
);

const Backdrop = ({ children, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      overflowY: "auto",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ width: "100%", maxWidth: 780 }}
    >
      {children}
    </div>
  </div>
);

const Toggle = ({ checked, onChange, label, activeColor = P }) => (
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
        fontSize: 12,
        color: checked ? "#1a0f00" : MUTED,
        fontWeight: checked ? 500 : 400,
      }}
    >
      {label}
    </span>
  </label>
);

const SectionHead = ({ icon: Icon, children }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}
  >
    {Icon && (
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: `${P}14`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={13} color={P} />
      </div>
    )}
    <h3
      style={{
        fontFamily: "'Cormorant Garamond',serif",
        fontSize: 18,
        fontWeight: 700,
        color: "#1a0f00",
        margin: 0,
      }}
    >
      {children}
    </h3>
  </div>
);

const Pills = ({ options, value, onChange, colorFn }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {options.map((opt) => {
      const active = value === opt;
      const bg = active
        ? colorFn?.(opt) || `linear-gradient(135deg,${P},${DP})`
        : CREAM;
      return (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            fontFamily: "'Jost',sans-serif",
            fontSize: 12,
            fontWeight: active ? 600 : 400,
            padding: "7px 14px",
            borderRadius: 99,
            border: active ? "none" : `1.5px solid ${BORDER}`,
            background: bg,
            color: active ? "#fff" : MUTED,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

// ─── Pricing preview widget ───────────────────────────────────────────────────
const PricingPreview = ({ preview, formatKES }) => {
  if (!preview || preview.savings <= 0) return null;
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: "10px 14px",
        border: "1.5px solid #6ee7b7",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span
        style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, color: MUTED }}
      >
        Effective price
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            fontFamily: "'Jost',sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: "#059669",
          }}
        >
          {formatKES(preview.effective)}
        </span>
        <span
          style={{
            fontFamily: "'Jost',sans-serif",
            fontSize: 11,
            color: "#dc2626",
            fontWeight: 600,
          }}
        >
          {preview.savingsPct}% off
        </span>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// EDIT VIEW
// ════════════════════════════════════════════════════════════════════════════
function EditView({ onBack, hook }) {
  const fileEditRef = useRef(null);
  const {
    editing,
    editForm,
    editImages,
    editLoading,
    editError,
    editSuccess,
    editPricingPreview,
    featureInput,
    setFeatureInput,
    setEditField,
    setEditDirect,
    addEditImages,
    removeNewImage,
    removeExistingImage,
    addFeature,
    removeFeature,
    submitEdit,
    propertyTypes,
    badges,
    formatKES,
  } = hook;

  if (!editing) return null;

  const offerMode = editForm.offerMode || "none";
  const intent = editForm.listingIntent || "sale";
  const mode = editForm.listingMode || "whole";
  const showSale = intent === "sale" || intent === "both";
  const showRent = intent === "rent" || intent === "both";

  const handleDrop = (e) => {
    e.preventDefault();
    addEditImages(e.dataTransfer.files);
  };
  const handleFile = (e) => {
    addEditImages(e.target.files);
    e.target.value = "";
  };

  const intentColor = (i) => ({ sale: "#b45309", rent: "#1e40af", both: P })[i];

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1020, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={onBack}
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
          <ArrowLeft size={14} /> Back to properties
        </button>
        <p
          style={{
            fontFamily: "'Jost',sans-serif",
            fontSize: 12,
            color: AMBER,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 500,
            marginBottom: 6,
          }}
        >
          Property Management
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(1.6rem,3vw,2.4rem)",
              fontWeight: 700,
              color: "#1a0f00",
              margin: 0,
            }}
          >
            {editing.displayName || editing.name}
          </h1>
          <IntentBadge intent={editing.listingIntent || "sale"} />
        </div>
      </div>

      {editSuccess && (
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
            Property updated successfully!
          </span>
        </div>
      )}
      {editError && (
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
            {editError}
          </span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {/* ── LEFT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Images */}
          <div style={card}>
            <SectionHead icon={Upload}>Images</SectionHead>
            {editing.images?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontFamily: "'Jost',sans-serif",
                    fontSize: 11,
                    color: LABEL,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Current images
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(78px,1fr))",
                    gap: 8,
                  }}
                >
                  {editing.images.map((img, idx) => (
                    <div
                      key={img._id}
                      style={{
                        position: "relative",
                        borderRadius: 10,
                        overflow: "hidden",
                        aspectRatio: "1",
                        border:
                          idx === 0
                            ? `2px solid ${P}`
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
                            bottom: 4,
                            left: 4,
                            background: P,
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: 600,
                            fontFamily: "'Jost',sans-serif",
                            padding: "2px 6px",
                            borderRadius: 99,
                          }}
                        >
                          PRIMARY
                        </span>
                      )}
                      <button
                        onClick={() => removeExistingImage(img._id)}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "rgba(220,38,38,0.85)",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <X size={10} color="#fff" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileEditRef.current?.click()}
              style={{
                border: "2px dashed #e8ddd2",
                borderRadius: 14,
                padding: "20px",
                textAlign: "center",
                background: CREAM,
                cursor: "pointer",
                transition: "border-color 0.2s",
                marginBottom: editImages.length ? 12 : 0,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#c2884a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#e8ddd2")
              }
            >
              <Upload
                size={16}
                color={P}
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
                Add photos or{" "}
                <span style={{ color: P, fontWeight: 600 }}>browse</span>
              </p>
              <input
                ref={fileEditRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={handleFile}
              />
            </div>
            {editImages.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(78px,1fr))",
                  gap: 8,
                }}
              >
                {editImages.map(({ preview }, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      borderRadius: 10,
                      overflow: "hidden",
                      aspectRatio: "1",
                      border: "2px solid #6ee7b7",
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
                    <span
                      style={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        background: "#059669",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 600,
                        fontFamily: "'Jost',sans-serif",
                        padding: "2px 6px",
                        borderRadius: 99,
                      }}
                    >
                      NEW
                    </span>
                    <button
                      onClick={() => removeNewImage(idx)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.6)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <X size={10} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Identity */}
          <div style={card}>
            <SectionHead icon={Home}>Identity</SectionHead>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Field label="Property Name" required>
                <Input
                  icon={Home}
                  value={editForm.name}
                  onChange={setEditField("name")}
                  placeholder="e.g. 2 Bedroom Apartment"
                />
              </Field>

              <Field
                label="Listing Mode"
                hint="'Unit' = one apartment / floor inside a larger building"
              >
                <Pills
                  options={LISTING_MODES}
                  value={mode}
                  onChange={(v) => setEditDirect("listingMode", v)}
                />
              </Field>

              {mode === "unit" && (
                <Field
                  label="Building / Complex Name"
                  required
                  hint="e.g. Sunshine Apartments"
                >
                  <Input
                    icon={Building2}
                    value={editForm.buildingName || ""}
                    onChange={setEditField("buildingName")}
                    placeholder="e.g. Sunshine Apartments"
                  />
                </Field>
              )}

              <Field label="Location" required>
                <Input
                  icon={MapPin}
                  value={editForm.location}
                  onChange={setEditField("location")}
                  placeholder="e.g. Kiamiti Road, Nairobi"
                />
              </Field>
            </div>
          </div>

          {/* Pricing */}
          <div style={card}>
            <SectionHead icon={TrendingUp}>Pricing</SectionHead>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Intent */}
              <Field
                label="Listing Intent"
                hint="What you're offering on this property"
              >
                <div style={{ display: "flex", gap: 8 }}>
                  {LISTING_INTENTS.map((i) => {
                    const active = intent === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setEditDirect("listingIntent", i)}
                        style={{
                          fontFamily: "'Jost',sans-serif",
                          fontSize: 12,
                          fontWeight: active ? 600 : 400,
                          padding: "8px 16px",
                          borderRadius: 99,
                          border: active ? "none" : `1.5px solid ${BORDER}`,
                          background: active ? intentColor(i) : CREAM,
                          color: active ? "#fff" : MUTED,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          textTransform: "capitalize",
                        }}
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Sale pricing */}
              {showSale && (
                <div
                  style={{
                    background: "#fdf6ee",
                    border: `1.5px solid ${BORDER}`,
                    borderRadius: 14,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Jost',sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      color: AMBER,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    For Sale
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <Field label="Sale Price (KES)" required>
                      <Input
                        icon={DollarSign}
                        value={editForm.price}
                        onChange={setEditField("price")}
                        type="number"
                        min="0"
                        placeholder="24500000"
                      />
                    </Field>
                    <Field label="Price Label" hint="e.g. Negotiable">
                      <Input
                        icon={Tag}
                        value={editForm.priceLabel}
                        onChange={setEditField("priceLabel")}
                        placeholder="e.g. Negotiable"
                      />
                    </Field>
                  </div>

                  {/* Offer / Discount */}
                  <div>
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
                      Offer / Discount{" "}
                      <span
                        style={{
                          fontWeight: 400,
                          textTransform: "none",
                          letterSpacing: 0,
                          color: "#c8b09a",
                        }}
                      >
                        — pick one
                      </span>
                    </p>
                    <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                      {["none", "percent", "fixed"].map((m) => (
                        <button
                          key={m}
                          onClick={() => setEditDirect("offerMode", m)}
                          style={{
                            fontFamily: "'Jost',sans-serif",
                            fontSize: 11,
                            fontWeight: offerMode === m ? 600 : 400,
                            padding: "6px 14px",
                            borderRadius: 99,
                            border:
                              offerMode === m
                                ? "none"
                                : `1.5px solid ${BORDER}`,
                            background:
                              offerMode === m
                                ? m === "none"
                                  ? "#6b7280"
                                  : `linear-gradient(135deg,${P},${DP})`
                                : CREAM,
                            color: offerMode === m ? "#fff" : MUTED,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {m === "none"
                            ? "No offer"
                            : m === "percent"
                              ? "% Discount"
                              : "Fixed price"}
                        </button>
                      ))}
                    </div>
                    {offerMode === "percent" && (
                      <Field label="Discount (%)" hint="0–99">
                        <Input
                          icon={Percent}
                          value={editForm.discountPercent}
                          onChange={setEditField("discountPercent")}
                          type="number"
                          min="0"
                          max="99"
                          placeholder="10"
                        />
                      </Field>
                    )}
                    {offerMode === "fixed" && (
                      <Field label="Fixed Offer Price (KES)">
                        <Input
                          icon={DollarSign}
                          value={editForm.offerPrice}
                          onChange={setEditField("offerPrice")}
                          type="number"
                          min="0"
                          placeholder="22000000"
                        />
                      </Field>
                    )}
                    {offerMode !== "none" && (
                      <div style={{ marginTop: 12 }}>
                        <Field label="Offer Expires">
                          <Input
                            icon={Calendar}
                            value={editForm.offerExpiresAt}
                            onChange={setEditField("offerExpiresAt")}
                            type="date"
                          />
                        </Field>
                      </div>
                    )}
                    <div style={{ marginTop: 12 }}>
                      <PricingPreview
                        preview={editPricingPreview}
                        formatKES={formatKES}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Rental pricing */}
              {showRent && (
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1.5px solid #bfdbfe",
                    borderRadius: 14,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Jost',sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#1e40af",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    For Rent
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <Field label="Per Day (KES)">
                      <Input
                        icon={Calendar}
                        value={editForm.rentPerDay}
                        onChange={setEditField("rentPerDay")}
                        type="number"
                        min="0"
                        placeholder="e.g. 15000"
                      />
                    </Field>
                    <Field label="Per Month (KES)">
                      <Input
                        icon={Calendar}
                        value={editForm.rentPerMonth}
                        onChange={setEditField("rentPerMonth")}
                        type="number"
                        min="0"
                        placeholder="e.g. 85000"
                      />
                    </Field>
                  </div>
                  <Field label="Rental Label" hint="e.g. Short stay available">
                    <Input
                      icon={Tag}
                      value={editForm.rentalLabel}
                      onChange={setEditField("rentalLabel")}
                      placeholder="e.g. Short stay available"
                    />
                  </Field>
                  {!editForm.rentPerDay && !editForm.rentPerMonth && (
                    <p
                      style={{
                        fontFamily: "'Jost',sans-serif",
                        fontSize: 11,
                        color: "#dc2626",
                      }}
                    >
                      At least one of per-day or per-month is required.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Specs */}
          <div style={card}>
            <SectionHead icon={Maximize2}>Specs</SectionHead>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Beds">
                  <Input
                    icon={Bed}
                    value={editForm.beds}
                    onChange={setEditField("beds")}
                    type="number"
                    min="0"
                    placeholder="4"
                  />
                </Field>
                <Field label="Baths">
                  <Input
                    icon={Bath}
                    value={editForm.baths}
                    onChange={setEditField("baths")}
                    type="number"
                    min="0"
                    placeholder="3"
                  />
                </Field>
                <Field label="Area m²">
                  <Input
                    icon={Maximize2}
                    value={editForm.area}
                    onChange={setEditField("area")}
                    type="number"
                    min="0"
                    placeholder="250"
                  />
                </Field>
              </div>

              {/* Land area */}
              <div
                style={{
                  background: CREAM,
                  border: `1.5px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Jost',sans-serif",
                    fontSize: 11,
                    color: LABEL,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Land Area{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: 0,
                      color: "#c8b09a",
                    }}
                  >
                    — optional
                  </span>
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: 12,
                  }}
                >
                  <Field label="Value">
                    <Input
                      icon={Ruler}
                      value={editForm.landAreaValue}
                      onChange={setEditField("landAreaValue")}
                      type="number"
                      min="0"
                      placeholder="e.g. 0.5"
                    />
                  </Field>
                  <Field label="Unit">
                    <EditSelect
                      value={editForm.landAreaUnit}
                      onChange={setEditField("landAreaUnit")}
                    >
                      {LAND_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </EditSelect>
                  </Field>
                </div>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div style={card}>
            <SectionHead icon={Layers}>Classification</SectionHead>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Field label="Property Type" required>
                <Pills
                  options={propertyTypes}
                  value={editForm.type}
                  onChange={(t) => setEditDirect("type", t)}
                />
              </Field>

              <Field label="Badge">
                <Pills
                  options={badges}
                  value={editForm.badge}
                  onChange={(b) =>
                    setEditDirect("badge", editForm.badge === b ? "" : b)
                  }
                  colorFn={() => AMBER}
                />
              </Field>

              <Field label="Status">
                <EditSelect
                  value={editForm.status}
                  onChange={setEditField("status")}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </EditSelect>
              </Field>
            </div>
          </div>

          {/* Description & Features */}
          <div style={card}>
            <SectionHead icon={Home}>Description & Features</SectionHead>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Field label="Description">
                <textarea
                  value={editForm.description}
                  onChange={setEditField("description")}
                  rows={4}
                  placeholder="Describe the property…"
                  style={{ ...editBase, resize: "vertical", lineHeight: 1.7 }}
                  onFocus={focus}
                  onBlur={blur}
                />
              </Field>
              <Field label="Key Features" hint="Press Enter or click + to add">
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addFeature())
                    }
                    placeholder="e.g. Swimming pool, Solar, BQ…"
                    style={{ ...editBase, fontSize: 12, padding: "10px 14px" }}
                    onFocus={focus}
                    onBlur={blur}
                  />
                  <button
                    onClick={addFeature}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      border: "none",
                      background: `linear-gradient(135deg,${P},${DP})`,
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
                  {(editForm.features || []).map((f, i) => (
                    <span
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        background: "#f3e8ff",
                        color: P,
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
                        <X size={10} color={P} />
                      </button>
                    </span>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* Listing Options */}
          <div style={card}>
            <SectionHead icon={SlidersHorizontal}>Listing Options</SectionHead>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Toggle
                checked={editForm.isVisible}
                onChange={(v) => setEditDirect("isVisible", v)}
                label="Visible to public"
                activeColor={P}
              />
              <Toggle
                checked={editForm.isSoldOut}
                onChange={(v) => setEditDirect("isSoldOut", v)}
                label="Mark as sold out"
                activeColor="#6b7280"
              />
              <Toggle
                checked={editForm.isFeatured}
                onChange={(v) => setEditDirect("isFeatured", v)}
                label="Featured listing"
                activeColor="#F59E0B"
              />
              {editForm.isFeatured && (
                <Field label="Featured Until" hint="Leave blank for indefinite">
                  <Input
                    icon={Calendar}
                    value={editForm.featuredUntil}
                    onChange={setEditField("featuredUntil")}
                    type="date"
                  />
                </Field>
              )}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={submitEdit}
            disabled={editLoading}
            style={{
              width: "100%",
              padding: 16,
              borderRadius: 14,
              border: "none",
              background: editLoading
                ? "#9ca3af"
                : `linear-gradient(135deg,${P},${DP})`,
              color: "#fff",
              fontFamily: "'Jost',sans-serif",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: editLoading ? "not-allowed" : "pointer",
              boxShadow: editLoading
                ? "none"
                : "0 8px 28px rgba(123,45,139,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "filter 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!editLoading) {
                e.currentTarget.style.filter = "brightness(1.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {editLoading ? (
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

// ════════════════════════════════════════════════════════════════════════════
// FILTER PANEL (collapsible advanced filters)
// ════════════════════════════════════════════════════════════════════════════
function AdvancedFilters({ filters, setFilter, propertyTypes, badges }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          borderRadius: 10,
          border: `1.5px solid ${open ? P : BORDER}`,
          background: open ? P + "0f" : CREAM,
          cursor: "pointer",
          fontFamily: "'Jost',sans-serif",
          fontSize: 12,
          color: open ? P : MUTED,
          fontWeight: open ? 600 : 400,
          whiteSpace: "nowrap",
        }}
      >
        <Filter size={13} /> Advanced{" "}
        <ChevronDown
          size={12}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            ...card,
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
            gap: 16,
          }}
        >
          <div>
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
              Listing Intent
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["", ...LISTING_INTENTS].map((i) => {
                const active = filters.listingIntent === i;
                const colors = { sale: "#b45309", rent: "#1e40af", both: P };
                return (
                  <button
                    key={i}
                    onClick={() => setFilter("listingIntent", i)}
                    style={{
                      fontFamily: "'Jost',sans-serif",
                      fontSize: 11,
                      fontWeight: active ? 600 : 400,
                      padding: "5px 12px",
                      borderRadius: 99,
                      border: active ? "none" : `1.5px solid ${BORDER}`,
                      background: active ? (i ? colors[i] : "#374151") : CREAM,
                      color: active ? "#fff" : MUTED,
                      cursor: "pointer",
                    }}
                  >
                    {i || "All"}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
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
              Listing Mode
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["", ...LISTING_MODES].map((m) => {
                const active = filters.listingMode === m;
                return (
                  <button
                    key={m}
                    onClick={() => setFilter("listingMode", m)}
                    style={{
                      fontFamily: "'Jost',sans-serif",
                      fontSize: 11,
                      fontWeight: active ? 600 : 400,
                      padding: "5px 12px",
                      borderRadius: 99,
                      border: active ? "none" : `1.5px solid ${BORDER}`,
                      background: active
                        ? `linear-gradient(135deg,${P},${DP})`
                        : CREAM,
                      color: active ? "#fff" : MUTED,
                      cursor: "pointer",
                    }}
                  >
                    {m || "All"}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
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
              Badge
            </p>
            <select
              value={filters.badge}
              onChange={(e) => setFilter("badge", e.target.value)}
              style={{
                ...inputBase,
                paddingRight: 28,
                cursor: "pointer",
                appearance: "none",
              }}
              onFocus={focus}
              onBlur={blur}
            >
              <option value="">All badges</option>
              {badges.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
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
              Price Range (KES)
            </p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={filters.minPrice}
                onChange={(e) => setFilter("minPrice", e.target.value)}
                type="number"
                min="0"
                placeholder="Min"
                style={{ ...inputBase, flex: 1, padding: "9px 12px" }}
                onFocus={focus}
                onBlur={blur}
              />
              <span
                style={{
                  color: LABEL,
                  fontSize: 12,
                  fontFamily: "'Jost',sans-serif",
                }}
              >
                –
              </span>
              <input
                value={filters.maxPrice}
                onChange={(e) => setFilter("maxPrice", e.target.value)}
                type="number"
                min="0"
                placeholder="Max"
                style={{ ...inputBase, flex: 1, padding: "9px 12px" }}
                onFocus={focus}
                onBlur={blur}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function Properties() {
  const navigate = useNavigate();
  const [view, setView] = useState("list");

  const hook = useManageProperties();
  const {
    properties,
    total,
    pages,
    page,
    setPage,
    filters,
    setFilter,
    listLoading,
    listError,
    fetchProperties,
    propertyTypes,
    badges,
    toggleVisibility,
    toggleSoldOut,
    openEdit,
    deleting,
    deleteLoading,
    deleteError,
    openDelete,
    closeDelete,
    confirmDelete,
    formatKES,
  } = hook;

  const handleOpenEdit = (property) => {
    openEdit(property);
    setView("edit");
  };
  const handleBack = () => {
    hook.closeEdit();
    setView("list");
  };

  if (view === "edit") return <EditView onBack={handleBack} hook={hook} />;

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1160, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "'Jost',sans-serif",
              fontSize: 12,
              color: AMBER,
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
            All Properties
          </h1>
        </div>
        <button
          onClick={() => navigate("/admin/properties/add")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 20px",
            borderRadius: 12,
            border: "none",
            background: `linear-gradient(135deg,${P},${DP})`,
            color: "#fff",
            fontFamily: "'Jost',sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 18px rgba(123,45,139,0.25)",
          }}
        >
          <Plus size={15} /> Add Property
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...card, marginBottom: 24, padding: "18px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto auto auto",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search
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
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Search properties…"
              style={{ ...inputBase, paddingLeft: 38 }}
              onFocus={focus}
              onBlur={blur}
            />
          </div>
          {/* Type */}
          <select
            value={filters.type}
            onChange={(e) => setFilter("type", e.target.value)}
            style={{
              ...inputBase,
              width: "auto",
              paddingRight: 28,
              cursor: "pointer",
              appearance: "none",
            }}
            onFocus={focus}
            onBlur={blur}
          >
            <option value="">All types</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            style={{
              ...inputBase,
              width: "auto",
              paddingRight: 28,
              cursor: "pointer",
              appearance: "none",
            }}
            onFocus={focus}
            onBlur={blur}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => setFilter("sort", e.target.value)}
            style={{
              ...inputBase,
              width: "auto",
              paddingRight: 28,
              cursor: "pointer",
              appearance: "none",
            }}
            onFocus={focus}
            onBlur={blur}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {/* Quick filters */}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() =>
                setFilter(
                  "isFeatured",
                  filters.isFeatured === "true" ? "" : "true",
                )
              }
              title="Featured only"
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: `1.5px solid ${filters.isFeatured === "true" ? P : BORDER}`,
                background: filters.isFeatured === "true" ? P + "18" : CREAM,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "'Jost',sans-serif",
                fontSize: 11,
                color: filters.isFeatured === "true" ? P : MUTED,
                fontWeight: filters.isFeatured === "true" ? 600 : 400,
              }}
            >
              <Star
                size={12}
                fill={filters.isFeatured === "true" ? P : "none"}
                color={filters.isFeatured === "true" ? P : MUTED}
              />{" "}
              Featured
            </button>
            <button
              onClick={() =>
                setFilter(
                  "isSoldOut",
                  filters.isSoldOut === "true" ? "" : "true",
                )
              }
              title="Sold out only"
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: `1.5px solid ${filters.isSoldOut === "true" ? "#6b7280" : BORDER}`,
                background: filters.isSoldOut === "true" ? "#6b728018" : CREAM,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "'Jost',sans-serif",
                fontSize: 11,
                color: filters.isSoldOut === "true" ? "#374151" : MUTED,
                fontWeight: filters.isSoldOut === "true" ? 600 : 400,
              }}
            >
              <Tag size={12} /> Sold Out
            </button>
          </div>
          {/* Refresh */}
          <button
            onClick={fetchProperties}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: `1.5px solid ${BORDER}`,
              background: CREAM,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "'Jost',sans-serif",
              fontSize: 12,
              color: MUTED,
            }}
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {/* Advanced filters */}
        <AdvancedFilters
          filters={filters}
          setFilter={setFilter}
          propertyTypes={propertyTypes}
          badges={badges}
        />

        <p
          style={{
            fontFamily: "'Jost',sans-serif",
            fontSize: 11,
            color: LABEL,
            marginTop: 12,
          }}
        >
          {total} propert{total === 1 ? "y" : "ies"} found
          {(filters.listingIntent ||
            filters.listingMode ||
            filters.minPrice ||
            filters.maxPrice ||
            filters.badge) && (
            <button
              onClick={() => {
                setFilter("listingIntent", "");
                setFilter("listingMode", "");
                setFilter("minPrice", "");
                setFilter("maxPrice", "");
                setFilter("badge", "");
              }}
              style={{
                marginLeft: 12,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Jost',sans-serif",
                fontSize: 11,
                color: "#dc2626",
                fontWeight: 500,
              }}
            >
              Clear filters ×
            </button>
          )}
        </p>
      </div>

      {/* Error */}
      {listError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fef2f2",
            border: "1.5px solid #fca5a5",
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 20,
          }}
        >
          <AlertCircle size={16} color="#dc2626" />
          <span
            style={{
              fontFamily: "'Jost',sans-serif",
              fontSize: 13,
              color: "#dc2626",
            }}
          >
            {listError}
          </span>
        </div>
      )}

      {/* Loading */}
      {listLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "60px 0",
          }}
        >
          <Loader2
            size={28}
            color={P}
            style={{ animation: "spin 0.8s linear infinite" }}
          />
        </div>
      )}

      {/* Empty */}
      {!listLoading && properties.length === 0 && !listError && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `${P}12`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Home size={24} color={P} strokeWidth={1.5} />
          </div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 22,
              fontWeight: 700,
              color: "#1a0f00",
              marginBottom: 8,
            }}
          >
            No properties found
          </p>
          <p
            style={{
              fontFamily: "'Jost',sans-serif",
              fontSize: 13,
              color: MUTED,
            }}
          >
            Try adjusting your filters or add a new listing.
          </p>
        </div>
      )}

      {/* Grid */}
      {!listLoading && properties.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: 20,
            marginBottom: 28,
          }}
        >
          {properties.map((p) => {
            const img = p.primaryImage || p.images?.[0]?.url;
            const pricing = p.pricing || {};
            const hasOffer = pricing.hasActiveOffer;
            const effective = pricing.effectivePrice ?? pricing.original;
            const savings = pricing.savingsPercent;
            const rp = p.rentalPricing;

            return (
              <div
                key={p._id}
                style={{
                  ...card,
                  padding: 0,
                  overflow: "hidden",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  opacity: p.isVisible ? 1 : 0.65,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(123,45,139,0.12)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Image */}
                <div
                  style={{
                    position: "relative",
                    height: 180,
                    background: "#f5ece3",
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
                      <ImageOff size={28} color="#d4b8a0" strokeWidth={1.3} />
                    </div>
                  )}
                  {p.isSoldOut && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.42)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Jost',sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#fff",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          border: "2px solid rgba(255,255,255,0.6)",
                          padding: "6px 18px",
                          borderRadius: 99,
                        }}
                      >
                        Sold Out
                      </span>
                    </div>
                  )}
                  {!p.isVisible && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0,0,0,0.55)",
                        padding: "4px 0",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Jost',sans-serif",
                          fontSize: 10,
                          color: "#fff",
                          fontWeight: 600,
                          letterSpacing: "0.12em",
                        }}
                      >
                        HIDDEN FROM PUBLIC
                      </span>
                    </div>
                  )}
                  {p.badge && !p.isSoldOut && (
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background: AMBER,
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 700,
                        fontFamily: "'Jost',sans-serif",
                        padding: "3px 9px",
                        borderRadius: 99,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                  {hasOffer && (
                    <span
                      style={{
                        position: "absolute",
                        top: p.badge && !p.isSoldOut ? 32 : 10,
                        left: 10,
                        background: "#dc2626",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 700,
                        fontFamily: "'Jost',sans-serif",
                        padding: "3px 9px",
                        borderRadius: 99,
                      }}
                    >
                      {savings}% OFF
                    </span>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 4,
                    }}
                  >
                    {p.isFeatured && (
                      <Star size={15} fill="#F59E0B" color="#F59E0B" />
                    )}
                    <StatusPill status={p.status} />
                    <IntentBadge intent={p.listingIntent || "sale"} />
                  </div>
                  {p.images?.length > 1 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 10,
                        background: "rgba(0,0,0,0.55)",
                        color: "#fff",
                        fontSize: 10,
                        fontFamily: "'Jost',sans-serif",
                        padding: "2px 8px",
                        borderRadius: 99,
                      }}
                    >
                      +{p.images.length - 1} photos
                    </span>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: "16px 18px 18px" }}>
                  {/* Name + building */}
                  {p.buildingName && (
                    <p
                      style={{
                        fontFamily: "'Jost',sans-serif",
                        fontSize: 10,
                        color: LABEL,
                        marginBottom: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Building2 size={10} color={LABEL} /> {p.buildingName}
                    </p>
                  )}
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#1a0f00",
                      marginBottom: 4,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Jost',sans-serif",
                      fontSize: 12,
                      color: MUTED,
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <MapPin size={11} color="#c2884a" /> {p.location}
                  </p>

                  {/* Specs row */}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginBottom: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {p.beds > 0 && (
                      <span
                        style={{
                          fontFamily: "'Jost',sans-serif",
                          fontSize: 11,
                          color: MUTED,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Bed size={11} color="#c2884a" />
                        {p.beds} bd
                      </span>
                    )}
                    {p.baths > 0 && (
                      <span
                        style={{
                          fontFamily: "'Jost',sans-serif",
                          fontSize: 11,
                          color: MUTED,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Bath size={11} color="#c2884a" />
                        {p.baths} ba
                      </span>
                    )}
                    {p.area > 0 && (
                      <span
                        style={{
                          fontFamily: "'Jost',sans-serif",
                          fontSize: 11,
                          color: MUTED,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Maximize2 size={11} color="#c2884a" />
                        {p.area} m²
                      </span>
                    )}
                    {p.landArea && (
                      <span
                        style={{
                          fontFamily: "'Jost',sans-serif",
                          fontSize: 11,
                          color: MUTED,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Ruler size={11} color="#c2884a" />
                        {p.landArea.value} {p.landArea.unit}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "'Jost',sans-serif",
                        fontSize: 11,
                        color: MUTED,
                        marginLeft: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Eye size={11} color="#c2884a" /> {p.viewCount || 0}
                    </span>
                  </div>

                  {/* Pricing */}
                  <div style={{ marginBottom: 14 }}>
                    {/* Sale pricing */}
                    {pricing.original != null &&
                      (hasOffer ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'Jost',sans-serif",
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#dc2626",
                            }}
                          >
                            {formatKES(effective)}
                          </span>
                          <span
                            style={{
                              fontFamily: "'Jost',sans-serif",
                              fontSize: 12,
                              color: MUTED,
                              textDecoration: "line-through",
                            }}
                          >
                            {formatKES(pricing.original)}
                          </span>
                        </div>
                      ) : (
                        <span
                          style={{
                            fontFamily: "'Jost',sans-serif",
                            fontSize: 15,
                            fontWeight: 700,
                            color: P,
                          }}
                        >
                          {formatKES(pricing.original)}
                        </span>
                      ))}
                    {/* Rental pricing */}
                    {rp && (rp.rentPerMonth || rp.rentPerDay) && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: pricing.original != null ? 4 : 0,
                          flexWrap: "wrap",
                        }}
                      >
                        {rp.rentPerMonth && (
                          <span
                            style={{
                              fontFamily: "'Jost',sans-serif",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#1e40af",
                            }}
                          >
                            {formatKES(rp.rentPerMonth)}
                            <span style={{ fontWeight: 400, fontSize: 10 }}>
                              /mo
                            </span>
                          </span>
                        )}
                        {rp.rentPerDay && (
                          <span
                            style={{
                              fontFamily: "'Jost',sans-serif",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#1e40af",
                            }}
                          >
                            {formatKES(rp.rentPerDay)}
                            <span style={{ fontWeight: 400, fontSize: 10 }}>
                              /day
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "9px 0",
                        borderRadius: 10,
                        border: `1.5px solid ${BORDER}`,
                        background: CREAM,
                        cursor: "pointer",
                        fontFamily: "'Jost',sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        color: MUTED,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = P;
                        e.currentTarget.style.color = P;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = BORDER;
                        e.currentTarget.style.color = MUTED;
                      }}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <IconBtn
                      onClick={() => toggleVisibility(p)}
                      title={p.isVisible ? "Hide" : "Show"}
                      active={!p.isVisible}
                      activeColor="#374151"
                    >
                      {p.isVisible ? (
                        <Eye size={13} color={MUTED} />
                      ) : (
                        <EyeOff size={13} color="#374151" />
                      )}
                    </IconBtn>
                    <IconBtn
                      onClick={() => toggleSoldOut(p)}
                      title={p.isSoldOut ? "Mark available" : "Mark sold out"}
                      active={p.isSoldOut}
                      activeColor="#6b7280"
                    >
                      <Tag size={13} color={p.isSoldOut ? "#374151" : MUTED} />
                    </IconBtn>
                    <IconBtn
                      onClick={() => openDelete(p)}
                      title="Delete"
                      danger
                    >
                      <Trash2 size={13} color="#dc2626" />
                    </IconBtn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: `1.5px solid ${BORDER}`,
              background: CREAM,
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={15} color={MUTED} />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: n === page ? "none" : `1.5px solid ${BORDER}`,
                background:
                  n === page ? `linear-gradient(135deg,${P},${DP})` : CREAM,
                color: n === page ? "#fff" : MUTED,
                fontFamily: "'Jost',sans-serif",
                fontSize: 13,
                fontWeight: n === page ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: `1.5px solid ${BORDER}`,
              background: CREAM,
              cursor: page === pages ? "not-allowed" : "pointer",
              opacity: page === pages ? 0.4 : 1,
            }}
          >
            <ChevronRight size={15} color={MUTED} />
          </button>
        </div>
      )}

      {/* Delete modal */}
      {deleting && (
        <Backdrop onClose={closeDelete}>
          <div style={{ ...card, maxWidth: 440, margin: "0 auto" }}>
            <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Trash2 size={22} color="#dc2626" strokeWidth={1.5} />
              </div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#1a0f00",
                  marginBottom: 8,
                }}
              >
                Delete property?
              </h2>
              <p
                style={{
                  fontFamily: "'Jost',sans-serif",
                  fontSize: 13,
                  color: MUTED,
                  lineHeight: 1.6,
                }}
              >
                <strong>{deleting.displayName || deleting.name}</strong> will be
                permanently removed along with all its images. This cannot be
                undone.
              </p>
            </div>
            {deleteError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fef2f2",
                  border: "1.5px solid #fca5a5",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 16,
                }}
              >
                <AlertCircle size={14} color="#dc2626" />
                <span
                  style={{
                    fontFamily: "'Jost',sans-serif",
                    fontSize: 12,
                    color: "#dc2626",
                  }}
                >
                  {deleteError}
                </span>
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 8,
              }}
            >
              <button
                onClick={closeDelete}
                style={{
                  padding: 13,
                  borderRadius: 12,
                  border: `1.5px solid ${BORDER}`,
                  background: CREAM,
                  cursor: "pointer",
                  fontFamily: "'Jost',sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: MUTED,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                style={{
                  padding: 13,
                  borderRadius: 12,
                  border: "none",
                  background: deleteLoading ? "#9ca3af" : "#dc2626",
                  color: "#fff",
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  fontFamily: "'Jost',sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {deleteLoading ? (
                  <>
                    <Loader2
                      size={14}
                      style={{ animation: "spin 0.8s linear infinite" }}
                    />{" "}
                    Deleting…
                  </>
                ) : (
                  "Yes, delete"
                )}
              </button>
            </div>
          </div>
        </Backdrop>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
