import { useRef } from "react";
import {
  Upload,
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Maximize2,
  CheckCircle,
  Plus,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Tag,
} from "lucide-react";
import { useAddProperty } from "../Hooks/useAddProperty";

const PROPERTY_TYPES = [
  "Villa",
  "Apartment",
  "Townhouse",
  "Maisonette",
  "Land/Plot",
  "Commercial",
];
const BADGES = ["Featured", "New Listing", "For Sale", "For Rent", "Off-Plan"];

// ── Reusable primitives ──────────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <div>
    <label
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: 11,
        fontWeight: 500,
        color: "#b8a090",
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
          fontFamily: "'Jost', sans-serif",
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

const inputBase = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid #f0e6d8",
  background: "#fdf8f3",
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
        ...inputBase,
        ...(Icon ? { paddingLeft: 38 } : {}),
        ...props.style,
      }}
      onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
      onBlur={(e) => (e.target.style.borderColor = "#f0e6d8")}
    />
  </div>
);

const card = {
  background: "#fff",
  borderRadius: 20,
  border: "1.5px solid #f0e6d8",
  padding: "24px",
};

// ── Main component ───────────────────────────────────────────────────────────
export default function AddPropertyPage() {
  const fileInputRef = useRef(null);

  const {
    form,
    set,
    setField,
    imageFiles,
    addImages,
    removeImage,
    featureInput,
    setFeatureInput,
    addFeature,
    removeFeature,
    loading,
    error,
    success,
    submit,
  } = useAddProperty();

  const handleDrop = (e) => {
    e.preventDefault();
    addImages(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    addImages(e.target.files);
    e.target.value = ""; // allow re-selecting same files
  };

  const handleSubmit = async () => {
    await submit();
  };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 960, margin: "0 auto" }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 36 }}>
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
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
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            fontWeight: 700,
            color: "#1a0f00",
          }}
        >
          Add New Property
        </h1>
      </div>

      {/* ── Success banner ── */}
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
            animation: "slideUp 0.3s ease",
          }}
        >
          <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
          <CheckCircle size={18} color="#0d6e5e" />
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 13,
              color: "#0d6e5e",
              fontWeight: 500,
            }}
          >
            Property listed successfully! It will appear on the site shortly.
          </span>
        </div>
      )}

      {/* ── Error banner ── */}
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
            animation: "slideUp 0.3s ease",
          }}
        >
          <AlertCircle size={18} color="#dc2626" />
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
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
        {/* ════════════════ LEFT COLUMN ════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Image upload */}
          <div style={card}>
            <Field
              label="Property Images"
              hint="First image will be the primary/cover image. Max 10 files, 5 MB each."
            >
              {/* Drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #e8ddd2",
                  borderRadius: 14,
                  padding: "32px 20px",
                  textAlign: "center",
                  background: "#fdf8f3",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  marginBottom: 16,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#c2884a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#e8ddd2")
                }
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#7B2D8B18,#4A106008)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <Upload size={18} color="#7B2D8B" strokeWidth={1.8} />
                </div>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 13,
                    color: "#7a6555",
                    marginBottom: 4,
                  }}
                >
                  Drag photos here or{" "}
                  <span style={{ color: "#7B2D8B", fontWeight: 600 }}>
                    browse
                  </span>
                </p>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 11,
                    color: "#c8b09a",
                  }}
                >
                  PNG, JPG, WEBP · up to 5 MB each · max 10 images
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileInput}
                />
              </div>

              {/* Preview grid */}
              {imageFiles.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                    gap: 8,
                  }}
                >
                  {imageFiles.map(({ preview }, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        borderRadius: 10,
                        overflow: "hidden",
                        aspectRatio: "1",
                        border:
                          idx === 0
                            ? "2px solid #7B2D8B"
                            : "2px solid transparent",
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
                      {/* Primary badge */}
                      {idx === 0 && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: 4,
                            left: 4,
                            background: "#7B2D8B",
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: 600,
                            fontFamily: "'Jost', sans-serif",
                            padding: "2px 6px",
                            borderRadius: 99,
                            letterSpacing: "0.05em",
                          }}
                        >
                          PRIMARY
                        </span>
                      )}
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
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
                  {/* Add more tile */}
                  {imageFiles.length < 10 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 10,
                        border: "2px dashed #e8ddd2",
                        background: "#fdf8f3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={16} color="#c8b09a" />
                    </div>
                  )}
                </div>
              )}
            </Field>
          </div>

          {/* Property details */}
          <div style={card}>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
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
                <Input
                  icon={Home}
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g. Amalia Springs"
                />
              </Field>
              <Field label="Location *">
                <Input
                  icon={MapPin}
                  value={form.location}
                  onChange={set("location")}
                  placeholder="e.g. Kiamiti Road, Nairobi"
                />
              </Field>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Price (KES) *">
                  <Input
                    icon={DollarSign}
                    value={form.price}
                    onChange={set("price")}
                    placeholder="24500000"
                    type="number"
                  />
                </Field>
                <Field label="Price Label" hint="e.g. Per month">
                  <Input
                    icon={Tag}
                    value={form.priceLabel}
                    onChange={set("priceLabel")}
                    placeholder="Per month"
                  />
                </Field>
              </div>
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
                    value={form.beds}
                    onChange={set("beds")}
                    placeholder="4"
                    type="number"
                  />
                </Field>
                <Field label="Baths">
                  <Input
                    icon={Bath}
                    value={form.baths}
                    onChange={set("baths")}
                    placeholder="3"
                    type="number"
                  />
                </Field>
                <Field label="Area m²">
                  <Input
                    icon={Maximize2}
                    value={form.area}
                    onChange={set("area")}
                    placeholder="250"
                    type="number"
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════ RIGHT COLUMN ════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Classification */}
          <div style={card}>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
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
                  {PROPERTY_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setField("type", t)}
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 12,
                        fontWeight: form.type === t ? 600 : 400,
                        padding: "8px 14px",
                        borderRadius: 99,
                        border:
                          form.type === t ? "none" : "1.5px solid #e8ddd2",
                        background:
                          form.type === t
                            ? "linear-gradient(135deg,#7B2D8B,#4A1060)"
                            : "#fdf8f3",
                        color: form.type === t ? "#fff" : "#7a6555",
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
                  {BADGES.map((b) => (
                    <button
                      key={b}
                      onClick={() =>
                        setField("badge", form.badge === b ? "" : b)
                      }
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 12,
                        fontWeight: form.badge === b ? 600 : 400,
                        padding: "8px 14px",
                        borderRadius: 99,
                        border:
                          form.badge === b ? "none" : "1.5px solid #e8ddd2",
                        background: form.badge === b ? "#b45309" : "#fdf8f3",
                        color: form.badge === b ? "#fff" : "#7a6555",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* Description & Features */}
          <div style={card}>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#1a0f00",
                marginBottom: 20,
              }}
            >
              Description & Features
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  rows={5}
                  placeholder="Describe the property, neighbourhood, key selling points…"
                  style={{
                    ...inputBase,
                    resize: "vertical",
                    lineHeight: 1.7,
                    padding: "12px 14px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
                  onBlur={(e) => (e.target.style.borderColor = "#f0e6d8")}
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
                    style={{ ...inputBase, fontSize: 12, padding: "10px 14px" }}
                    onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
                    onBlur={(e) => (e.target.style.borderColor = "#f0e6d8")}
                  />
                  <button
                    onClick={addFeature}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg,#7B2D8B,#4A1060)",
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
                        color: "#7B2D8B",
                        fontSize: 11,
                        fontWeight: 500,
                        padding: "4px 10px",
                        borderRadius: 99,
                        fontFamily: "'Jost', sans-serif",
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
                        <X size={10} color="#7B2D8B" />
                      </button>
                    </span>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              border: "none",
              background: loading
                ? "#9ca3af"
                : "linear-gradient(135deg,#7B2D8B,#4A1060)",
              color: "#fff",
              fontFamily: "'Jost', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "filter 0.2s, transform 0.2s",
              boxShadow: loading ? "none" : "0 8px 28px rgba(123,45,139,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
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
                />
                Uploading & Saving…
              </>
            ) : (
              "List Property"
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </button>
        </div>
      </div>
    </div>
  );
}
