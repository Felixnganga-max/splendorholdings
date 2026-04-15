import { useRef } from "react";
import {
  Upload,
  MapPin,
  Home,
  Building2,
  DollarSign,
  Bed,
  Bath,
  Maximize2,
  CheckCircle,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Tag,
  Percent,
  Calendar,
  Star,
  Layers,
  ShoppingCart,
  Key,
  LandPlot,
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
const LAND_UNITS = [
  { value: "acres", label: "Acres" },
  { value: "hectares", label: "Hectares" },
  { value: "sqm", label: "m²" },
  { value: "sqft", label: "sq ft" },
];

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

const SectionTitle = ({ children }) => (
  <h3
    style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 18,
      fontWeight: 700,
      color: "#1a0f00",
      marginBottom: 20,
    }}
  >
    {children}
  </h3>
);

const OrDivider = () => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}
  >
    <div style={{ flex: 1, height: 1, background: "#f0e6d8" }} />
    <span
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: 10,
        color: "#c8b09a",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      or
    </span>
    <div style={{ flex: 1, height: 1, background: "#f0e6d8" }} />
  </div>
);

const Toggle = ({ checked, onChange, label, hint }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    }}
  >
    <div>
      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: "#1a0f00",
          marginBottom: hint ? 3 : 0,
        }}
      >
        {label}
      </p>
      {hint && (
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 11,
            color: "#c8b09a",
          }}
        >
          {hint}
        </p>
      )}
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        flexShrink: 0,
        width: 44,
        height: 24,
        borderRadius: 99,
        border: "none",
        background: checked
          ? "linear-gradient(135deg,#7B2D8B,#4A1060)"
          : "#e8ddd2",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.25s",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.25s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
        }}
      />
    </button>
  </div>
);

// ── Segmented pill selector ───────────────────────────────────────────────────
const SegmentedSelector = ({
  options,
  value,
  onChange,
  accent = "#7B2D8B",
}) => (
  <div
    style={{
      display: "flex",
      background: "#fdf8f3",
      borderRadius: 12,
      border: "1.5px solid #f0e6d8",
      padding: 4,
      gap: 4,
    }}
  >
    {options.map((opt) => {
      const active = value === opt.value;
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            padding: "9px 10px",
            borderRadius: 9,
            border: "none",
            background: active ? accent : "transparent",
            color: active ? "#fff" : "#7a6555",
            fontFamily: "'Jost', sans-serif",
            fontSize: 12,
            fontWeight: active ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.18s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            whiteSpace: "nowrap",
          }}
        >
          {opt.icon && <opt.icon size={13} strokeWidth={active ? 2.2 : 1.8} />}
          {opt.label}
        </button>
      );
    })}
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
export default function AddPropertyPage() {
  const fileInputRef = useRef(null);

  const {
    form,
    set,
    setField,
    setOfferField,
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
    e.target.value = "";
  };

  const isLand = form.type === "Land/Plot";
  const showSale =
    form.listingIntent === "sale" || form.listingIntent === "both";
  const showRent =
    form.listingIntent === "rent" || form.listingIntent === "both";
  const isUnit = form.listingMode === "unit";

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
          <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
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

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 1 — Listing mode & intent  (full width, above the two columns)
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ ...card, marginBottom: 28 }}>
        <SectionTitle>Listing Setup</SectionTitle>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          {/* Listing Mode */}
          <Field
            label="What are you listing?"
            hint={
              isUnit
                ? "You'll also specify the parent building name below."
                : "The entire property is on offer as one."
            }
          >
            <SegmentedSelector
              value={form.listingMode}
              onChange={(v) => setField("listingMode", v)}
              accent="#1a0f00"
              options={[
                { value: "whole", label: "Entire Property", icon: Home },
                { value: "unit", label: "Unit / Section", icon: Layers },
              ]}
            />
          </Field>

          {/* Listing Intent */}
          <Field
            label="Available for *"
            hint={
              form.listingIntent === "both"
                ? "Both sale and rental pricing will be shown."
                : form.listingIntent === "rent"
                  ? "Only rental pricing applies."
                  : "Only sale pricing applies."
            }
          >
            <SegmentedSelector
              value={form.listingIntent}
              onChange={(v) => setField("listingIntent", v)}
              accent="#7B2D8B"
              options={[
                { value: "sale", label: "Sale", icon: ShoppingCart },
                { value: "rent", label: "Rent", icon: Key },
                { value: "both", label: "Sale & Rent", icon: Star },
              ]}
            />
          </Field>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TWO COLUMNS
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {/* ════════════════ LEFT COLUMN ════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* ── Image upload ── */}
          <div style={card}>
            <Field
              label="Property Images"
              hint="First image will be the primary/cover image. Max 10 files, 5 MB each."
            >
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

          {/* ── Property details ── */}
          <div style={card}>
            <SectionTitle>Property Details</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Building name — only shown in unit mode */}
              {isUnit && (
                <Field
                  label="Building / Complex Name *"
                  hint="The parent building this unit belongs to"
                >
                  <Input
                    icon={Building2}
                    value={form.buildingName}
                    onChange={set("buildingName")}
                    placeholder="e.g. Sunshine Apartments"
                  />
                </Field>
              )}

              <Field label={isUnit ? "Unit Name *" : "Property Name *"}>
                <Input
                  icon={Home}
                  value={form.name}
                  onChange={set("name")}
                  placeholder={
                    isUnit ? "e.g. 2 Bedroom Unit" : "e.g. Amalia Springs"
                  }
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

              {/* ── Sale pricing — only when intent includes sale ── */}
              {showSale && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <ShoppingCart size={13} color="#b45309" />
                    <span
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#b45309",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      Sale Pricing
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <Field label="Sale Price (KES) *">
                      <Input
                        icon={DollarSign}
                        value={form.price}
                        onChange={set("price")}
                        placeholder="24500000"
                        type="number"
                        min="0"
                      />
                    </Field>
                    <Field label="Price Label" hint="e.g. Per sqft">
                      <Input
                        icon={Tag}
                        value={form.priceLabel}
                        onChange={set("priceLabel")}
                        placeholder="e.g. Negotiable"
                      />
                    </Field>
                  </div>

                  {/* Offer / Discount */}
                  <div
                    style={{
                      background: "#fdf6ee",
                      border: "1.5px solid #f0e6d8",
                      borderRadius: 14,
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#b8a090",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        marginBottom: 2,
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
                        — optional, pick one
                      </span>
                    </p>
                    <Field
                      label="Fixed Offer Price (KES)"
                      hint="Overrides the base price display"
                    >
                      <Input
                        icon={DollarSign}
                        value={form.offerPrice}
                        onChange={(e) =>
                          setOfferField("offerPrice", e.target.value)
                        }
                        placeholder="e.g. 22000000"
                        type="number"
                        min="0"
                        disabled={!!form.discountPercent}
                        style={
                          form.discountPercent
                            ? { opacity: 0.4, cursor: "not-allowed" }
                            : {}
                        }
                      />
                    </Field>
                    <OrDivider />
                    <Field
                      label="Discount (%)"
                      hint="Auto-calculates the offer price"
                    >
                      <Input
                        icon={Percent}
                        value={form.discountPercent}
                        onChange={(e) =>
                          setOfferField("discountPercent", e.target.value)
                        }
                        placeholder="e.g. 10"
                        type="number"
                        min="0"
                        max="99"
                        disabled={!!form.offerPrice}
                        style={
                          form.offerPrice
                            ? { opacity: 0.4, cursor: "not-allowed" }
                            : {}
                        }
                      />
                    </Field>
                    <Field label="Offer Expires">
                      <Input
                        icon={Calendar}
                        value={form.offerExpiresAt}
                        onChange={set("offerExpiresAt")}
                        type="datetime-local"
                        style={
                          !form.offerPrice && !form.discountPercent
                            ? { opacity: 0.5 }
                            : {}
                        }
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Rental pricing — only when intent includes rent ── */}
              {showRent && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Key size={13} color="#7B2D8B" />
                    <span
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#7B2D8B",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      Rental Pricing
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#fdf6ff",
                      border: "1.5px solid #e8d5f5",
                      borderRadius: 14,
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <Field label="Rent / Month (KES)">
                        <Input
                          icon={Key}
                          value={form.rentPerMonth}
                          onChange={set("rentPerMonth")}
                          placeholder="e.g. 45000"
                          type="number"
                          min="0"
                        />
                      </Field>
                      <Field label="Rent / Day (KES)">
                        <Input
                          icon={Key}
                          value={form.rentPerDay}
                          onChange={set("rentPerDay")}
                          placeholder="e.g. 5000"
                          type="number"
                          min="0"
                        />
                      </Field>
                    </div>
                    <Field
                      label="Rental Label"
                      hint="e.g. Per month, short-stay rate"
                    >
                      <Input
                        icon={Tag}
                        value={form.rentalLabel}
                        onChange={set("rentalLabel")}
                        placeholder="e.g. Per month"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Beds / Baths / Area ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isLand ? "1fr 1fr" : "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                {!isLand && (
                  <>
                    <Field label="Beds">
                      <Input
                        icon={Bed}
                        value={form.beds}
                        onChange={set("beds")}
                        placeholder="4"
                        type="number"
                        min="0"
                      />
                    </Field>
                    <Field label="Baths">
                      <Input
                        icon={Bath}
                        value={form.baths}
                        onChange={set("baths")}
                        placeholder="3"
                        type="number"
                        min="0"
                      />
                    </Field>
                  </>
                )}
                <Field label="Built-up Area (m²)">
                  <Input
                    icon={Maximize2}
                    value={form.area}
                    onChange={set("area")}
                    placeholder="250"
                    type="number"
                    min="0"
                  />
                </Field>
                {/* Land area — always shown for Land/Plot, optional slot otherwise */}
                {isLand && (
                  <Field label="Land Area">
                    {/* intentionally empty here — rendered below in full */}
                  </Field>
                )}
              </div>

              {/* ── Land area full row — shown for Land/Plot ── */}
              {isLand && (
                <div
                  style={{
                    background: "#f0faf5",
                    border: "1.5px solid #a7f3d0",
                    borderRadius: 14,
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <LandPlot size={13} color="#047857" />
                    <span
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#047857",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      Land Size
                    </span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 12,
                      alignItems: "end",
                    }}
                  >
                    <Field label="Land Area Value *">
                      <Input
                        icon={LandPlot}
                        value={form.landAreaValue}
                        onChange={set("landAreaValue")}
                        placeholder="e.g. 2.5"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </Field>
                    <Field label="Unit">
                      <div style={{ display: "flex", gap: 6 }}>
                        {LAND_UNITS.map((u) => (
                          <button
                            key={u.value}
                            onClick={() => setField("landAreaUnit", u.value)}
                            style={{
                              padding: "10px 11px",
                              borderRadius: 10,
                              border:
                                form.landAreaUnit === u.value
                                  ? "none"
                                  : "1.5px solid #a7f3d0",
                              background:
                                form.landAreaUnit === u.value
                                  ? "#047857"
                                  : "#f0faf5",
                              color:
                                form.landAreaUnit === u.value
                                  ? "#fff"
                                  : "#047857",
                              fontFamily: "'Jost', sans-serif",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.18s",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {u.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════ RIGHT COLUMN ════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* ── Classification ── */}
          <div style={card}>
            <SectionTitle>Classification</SectionTitle>
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

          {/* ── Description & Features ── */}
          <div style={card}>
            <SectionTitle>Description & Features</SectionTitle>
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

          {/* ── Listing Options ── */}
          <div style={card}>
            <SectionTitle>Listing Options</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Toggle
                checked={form.isFeatured}
                onChange={(val) => setField("isFeatured", val)}
                label="Featured Listing"
                hint="Pinned to the top of search results"
              />
              {form.isFeatured && (
                <Field
                  label="Featured Until"
                  hint="Leave blank to feature indefinitely"
                >
                  <Input
                    icon={Calendar}
                    value={form.featuredUntil}
                    onChange={set("featuredUntil")}
                    type="datetime-local"
                  />
                </Field>
              )}
            </div>
          </div>

          {/* ── Submit ── */}
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
                />{" "}
                Uploading & Saving…
              </>
            ) : (
              <>
                <Star size={15} strokeWidth={2} /> List Property
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
