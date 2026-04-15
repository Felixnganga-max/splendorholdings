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
} from "lucide-react";
import { useManageProperties } from "../Hooks/useManageProperties";
import { useNavigate } from "react-router-dom";

const STATUSES = ["active", "draft", "archived", "sold", "rented"];
const SORTS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Oldest", value: "createdAt" },
  { label: "Price ↑", value: "pricing.original" },
  { label: "Price ↓", value: "-pricing.original" },
  { label: "Most viewed", value: "-viewCount" },
  { label: "Featured", value: "-isFeatured -createdAt" },
];

// ── Design tokens ─────────────────────────────────────────────────────────────
const PURPLE = "#7B2D8B";
const DPURPLE = "#4A1060";
const CREAM = "#fdf8f3";
const BORDER = "#f0e6d8";
const MUTED = "#7a6555";
const LABEL = "#b8a090";

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
};

const card = {
  background: "#fff",
  borderRadius: 20,
  border: `1.5px solid ${BORDER}`,
  padding: 24,
};

// ── Shared primitives ─────────────────────────────────────────────────────────
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

const editInputBase = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: `1.5px solid ${BORDER}`,
  background: CREAM,
  fontFamily: "'Jost', sans-serif",
  fontSize: 13,
  color: "#1a0f00",
  outline: "none",
  boxSizing: "border-box",
  transition: "border 0.2s",
};

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
        ...editInputBase,
        ...(Icon ? { paddingLeft: 38 } : {}),
        ...props.style,
      }}
      onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
      onBlur={(e) => (e.target.style.borderColor = BORDER)}
    />
  </div>
);

const StatusPill = ({ status }) => {
  const map = {
    active: { bg: "#d1fae5", color: "#065f46" },
    draft: { bg: "#fef3c7", color: "#92400e" },
    archived: { bg: "#f3f4f6", color: "#4b5563" },
    sold: { bg: "#ede9fe", color: "#5b21b6" },
    rented: { bg: "#dbeafe", color: "#1e40af" },
  };
  const s = map[status] || map.draft;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
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

const IconBtn = ({ onClick, title, children, danger, active, activeColor }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      border: `1.5px solid ${danger ? "#fca5a5" : BORDER}`,
      background: active
        ? activeColor || PURPLE + "18"
        : danger
          ? "#fff5f5"
          : CREAM,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s",
      flexShrink: 0,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = danger
        ? "#dc2626"
        : activeColor || PURPLE;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = danger ? "#fca5a5" : BORDER;
    }}
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
        fontSize: 12,
        color: checked ? "#1a0f00" : MUTED,
        fontWeight: checked ? 500 : 400,
      }}
    >
      {label}
    </span>
  </label>
);

const OrDivider = () => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 10, margin: "2px 0" }}
  >
    <div style={{ flex: 1, height: 1, background: BORDER }} />
    <span
      style={{
        fontFamily: "'Jost',sans-serif",
        fontSize: 10,
        color: "#c8b09a",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      or
    </span>
    <div style={{ flex: 1, height: 1, background: BORDER }} />
  </div>
);

const SectionTitle = ({ children }) => (
  <h3
    style={{
      fontFamily: "'Cormorant Garamond',serif",
      fontSize: 18,
      fontWeight: 700,
      color: "#1a0f00",
      marginBottom: 20,
    }}
  >
    {children}
  </h3>
);

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
    closeEdit,
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

  const handleDrop = (e) => {
    e.preventDefault();
    addEditImages(e.dataTransfer.files);
  };
  const handleFileInput = (e) => {
    addEditImages(e.target.files);
    e.target.value = "";
  };

  const offerMode = editForm.offerMode || "none";

  return (
    <div style={{ padding: "36px 40px", maxWidth: 960, margin: "0 auto" }}>
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
          Edit: {editing.name}
        </h1>
      </div>

      {/* Success */}
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

      {/* Error */}
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
        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Images */}
          <div style={card}>
            <SectionTitle>Images</SectionTitle>

            {/* Existing images */}
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
                    gridTemplateColumns: "repeat(auto-fill, minmax(80px,1fr))",
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
                            bottom: 4,
                            left: 4,
                            background: PURPLE,
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

            {/* Upload new images */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileEditRef.current?.click()}
              style={{
                border: "2px dashed #e8ddd2",
                borderRadius: 14,
                padding: "24px 20px",
                textAlign: "center",
                background: CREAM,
                cursor: "pointer",
                transition: "all 0.2s",
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
                Add more photos or{" "}
                <span style={{ color: PURPLE, fontWeight: 600 }}>browse</span>
              </p>
              <input
                ref={fileEditRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={handleFileInput}
              />
            </div>

            {/* New image previews */}
            {editImages.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(80px,1fr))",
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

          {/* Core details */}
          <div style={card}>
            <SectionTitle>Property Details</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Field label="Property Name">
                <Input
                  icon={Home}
                  value={editForm.name}
                  onChange={setEditField("name")}
                  placeholder="e.g. Amalia Springs"
                />
              </Field>
              <Field label="Location">
                <Input
                  icon={MapPin}
                  value={editForm.location}
                  onChange={setEditField("location")}
                  placeholder="e.g. Kiamiti Road, Nairobi"
                />
              </Field>

              {/* Base price */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Price (KES)">
                  <Input
                    icon={DollarSign}
                    value={editForm.price}
                    onChange={setEditField("price")}
                    type="number"
                    min="0"
                    placeholder="24500000"
                  />
                </Field>
                <Field label="Price Label" hint="e.g. Per month">
                  <Input
                    icon={Tag}
                    value={editForm.priceLabel}
                    onChange={setEditField("priceLabel")}
                    placeholder="Per month"
                  />
                </Field>
              </div>

              {/* Offer / Discount */}
              <div
                style={{
                  background: "#fdf6ee",
                  border: `1.5px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <p
                  style={{
                    fontFamily: "'Jost',sans-serif",
                    fontSize: 11,
                    fontWeight: 500,
                    color: LABEL,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
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

                {/* Mode selector */}
                <div style={{ display: "flex", gap: 6 }}>
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
                          offerMode === m ? "none" : `1.5px solid ${BORDER}`,
                        background:
                          offerMode === m
                            ? m === "none"
                              ? "#6b7280"
                              : `linear-gradient(135deg,${PURPLE},${DPURPLE})`
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
                      placeholder="e.g. 10"
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
                      placeholder="e.g. 22000000"
                    />
                  </Field>
                )}

                {offerMode !== "none" && (
                  <Field label="Offer Expires">
                    <Input
                      icon={Calendar}
                      value={editForm.offerExpiresAt}
                      onChange={setEditField("offerExpiresAt")}
                      type="date"
                    />
                  </Field>
                )}

                {/* Live pricing preview */}
                {editPricingPreview &&
                  offerMode !== "none" &&
                  editPricingPreview.savings > 0 && (
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 10,
                        padding: "10px 14px",
                        border: `1.5px solid #6ee7b7`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Jost',sans-serif",
                          fontSize: 12,
                          color: MUTED,
                        }}
                      >
                        Effective price
                      </span>
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
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#059669",
                          }}
                        >
                          {formatKES(editPricingPreview.effective)}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Jost',sans-serif",
                            fontSize: 11,
                            color: "#dc2626",
                            fontWeight: 600,
                          }}
                        >
                          {editPricingPreview.savingsPct}% off
                        </span>
                      </div>
                    </div>
                  )}
              </div>

              {/* Beds / Baths / Area */}
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
                    icon={Bed}
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
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Classification */}
          <div style={card}>
            <SectionTitle>Classification</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Field label="Property Type">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {propertyTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setEditDirect("type", t)}
                      style={{
                        fontFamily: "'Jost',sans-serif",
                        fontSize: 12,
                        fontWeight: editForm.type === t ? 600 : 400,
                        padding: "8px 14px",
                        borderRadius: 99,
                        border:
                          editForm.type === t
                            ? "none"
                            : `1.5px solid ${BORDER}`,
                        background:
                          editForm.type === t
                            ? `linear-gradient(135deg,${PURPLE},${DPURPLE})`
                            : CREAM,
                        color: editForm.type === t ? "#fff" : MUTED,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Badge">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {badges.map((b) => (
                    <button
                      key={b}
                      onClick={() =>
                        setEditDirect("badge", editForm.badge === b ? "" : b)
                      }
                      style={{
                        fontFamily: "'Jost',sans-serif",
                        fontSize: 12,
                        fontWeight: editForm.badge === b ? 600 : 400,
                        padding: "8px 14px",
                        borderRadius: 99,
                        border:
                          editForm.badge === b
                            ? "none"
                            : `1.5px solid ${BORDER}`,
                        background: editForm.badge === b ? "#b45309" : CREAM,
                        color: editForm.badge === b ? "#fff" : MUTED,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Status">
                <select
                  value={editForm.status}
                  onChange={setEditField("status")}
                  style={{
                    ...editInputBase,
                    paddingRight: 32,
                    cursor: "pointer",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
                  onBlur={(e) => (e.target.style.borderColor = BORDER)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Description & Features */}
          <div style={card}>
            <SectionTitle>Description & Features</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Field label="Description">
                <textarea
                  value={editForm.description}
                  onChange={setEditField("description")}
                  rows={4}
                  placeholder="Describe the property…"
                  style={{
                    ...editInputBase,
                    resize: "vertical",
                    lineHeight: 1.7,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
                  onBlur={(e) => (e.target.style.borderColor = BORDER)}
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
                    placeholder="e.g. Swimming pool, BQ, Solar…"
                    style={{
                      ...editInputBase,
                      fontSize: 12,
                      padding: "10px 14px",
                    }}
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
                  {(editForm.features || []).map((f, i) => (
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

          {/* Listing options */}
          <div style={card}>
            <SectionTitle>Listing Options</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Toggle
                checked={editForm.isVisible}
                onChange={(v) => setEditDirect("isVisible", v)}
                label="Visible to public"
                activeColor={PURPLE}
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

          {/* Save button */}
          <button
            onClick={submitEdit}
            disabled={editLoading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              border: "none",
              background: editLoading
                ? "#9ca3af"
                : `linear-gradient(135deg,${PURPLE},${DPURPLE})`,
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
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function Properties() {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "edit"

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
    categoriesLoading,
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

  // ── Edit view ──────────────────────────────────────────────────────────────
  if (view === "edit") {
    return <EditView onBack={handleBack} hook={hook} />;
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "36px 40px", maxWidth: 1100, margin: "0 auto" }}>
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
            background: `linear-gradient(135deg,${PURPLE},${DPURPLE})`,
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
              onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
          </div>
          {/* Type */}
          <select
            value={filters.type}
            onChange={(e) => setFilter("type", e.target.value)}
            style={{
              ...inputBase,
              width: "auto",
              paddingRight: 32,
              cursor: "pointer",
            }}
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
              paddingRight: 32,
              cursor: "pointer",
            }}
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
              paddingRight: 32,
              cursor: "pointer",
            }}
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
                border: `1.5px solid ${filters.isFeatured === "true" ? PURPLE : BORDER}`,
                background:
                  filters.isFeatured === "true" ? PURPLE + "18" : CREAM,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "'Jost',sans-serif",
                fontSize: 11,
                color: filters.isFeatured === "true" ? PURPLE : MUTED,
                fontWeight: filters.isFeatured === "true" ? 600 : 400,
              }}
            >
              <Star
                size={12}
                fill={filters.isFeatured === "true" ? PURPLE : "none"}
                color={filters.isFeatured === "true" ? PURPLE : MUTED}
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
              padding: "10px 16px",
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
            <SlidersHorizontal size={13} /> Refresh
          </button>
        </div>
        <p
          style={{
            fontFamily: "'Jost',sans-serif",
            fontSize: 11,
            color: LABEL,
            marginTop: 12,
          }}
        >
          {total} propert{total === 1 ? "y" : "ies"} found
        </p>
      </div>

      {/* List error */}
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
            color={PURPLE}
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
              background: `${PURPLE}12`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Home size={24} color={PURPLE} strokeWidth={1.5} />
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

      {/* Property grid */}
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
            const effective =
              pricing.effectivePrice ?? pricing.original ?? p.price;
            const savings = pricing.savingsPercent;

            return (
              <div
                key={p._id}
                style={{
                  ...card,
                  padding: 0,
                  overflow: "hidden",
                  transition: "box-shadow 0.2s",
                  opacity: p.isVisible ? 1 : 0.65,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(123,45,139,0.12)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
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
                        background: "#b45309",
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
                  {p.isFeatured && (
                    <span style={{ position: "absolute", top: 10, right: 10 }}>
                      <Star size={15} fill="#F59E0B" color="#F59E0B" />
                    </span>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      top: p.isFeatured ? 30 : 10,
                      right: 10,
                    }}
                  >
                    <StatusPill status={p.status} />
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
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
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

                  {/* Price */}
                  <div style={{ marginBottom: 14 }}>
                    {hasOffer ? (
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
                          color: PURPLE,
                        }}
                      >
                        {formatKES(pricing.original ?? p.price)}
                      </span>
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
                        e.currentTarget.style.borderColor = PURPLE;
                        e.currentTarget.style.color = PURPLE;
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
                  n === page
                    ? `linear-gradient(135deg,${PURPLE},${DPURPLE})`
                    : CREAM,
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
                <strong>{deleting.name}</strong> will be permanently removed
                along with all its images. This cannot be undone.
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
                  padding: "13px",
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
                  padding: "13px",
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
