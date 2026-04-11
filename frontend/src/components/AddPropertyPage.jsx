import { useState } from "react";
import {
  Upload,
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Maximize2,
  Tag,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";

const propertyTypes = [
  "Villa",
  "Apartment",
  "Townhouse",
  "Maisonette",
  "Land/Plot",
  "Commercial",
];
const badges = ["Featured", "New Listing", "For Sale", "For Rent", "Off-Plan"];

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
        }}
      />
    )}
    <input
      {...props}
      style={{
        width: "100%",
        padding: Icon ? "12px 14px 12px 38px" : "12px 14px",
        borderRadius: 12,
        border: "1.5px solid #f0e6d8",
        background: "#fdf8f3",
        fontFamily: "'Jost', sans-serif",
        fontSize: 13,
        color: "#1a0f00",
        outline: "none",
        boxSizing: "border-box",
        transition: "border 0.2s",
        ...props.style,
      }}
      onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
      onBlur={(e) => (e.target.style.borderColor = "#f0e6d8")}
    />
  </div>
);

export default function AddPropertyPage() {
  const [form, setForm] = useState({
    name: "",
    location: "",
    price: "",
    beds: "",
    baths: "",
    area: "",
    type: "",
    badge: "",
    rating: "",
    description: "",
    features: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [featureInput, setFeatureInput] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm((f) => ({
        ...f,
        features: [...f.features, featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (i) => {
    setForm((f) => ({
      ...f,
      features: f.features.filter((_, idx) => idx !== i),
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.location || !form.price) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 900, margin: "0 auto" }}>
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

      {submitted && (
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
          <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Image upload */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #f0e6d8",
              padding: "24px",
            }}
          >
            <Field label="Property Images">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                }}
                style={{
                  border: `2px dashed ${dragOver ? "#7B2D8B" : "#e8ddd2"}`,
                  borderRadius: 14,
                  padding: "36px 20px",
                  textAlign: "center",
                  background: dragOver ? "#f3e8ff20" : "#fdf8f3",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #7B2D8B18, #4A106008)",
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
                  <span
                    style={{
                      color: "#7B2D8B",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
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
                  PNG, JPG up to 10MB each
                </p>
              </div>
            </Field>
          </div>

          {/* Details */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #f0e6d8",
              padding: "24px",
            }}
          >
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
              <Field label="Property Name">
                <Input
                  icon={Home}
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g. Amalia Springs"
                />
              </Field>
              <Field label="Location">
                <Input
                  icon={MapPin}
                  value={form.location}
                  onChange={set("location")}
                  placeholder="e.g. Kiamiti Road, Nairobi"
                />
              </Field>
              <Field label="Listed Price">
                <Input
                  icon={DollarSign}
                  value={form.price}
                  onChange={set("price")}
                  placeholder="e.g. KES 24.5M"
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

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Classification */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #f0e6d8",
              padding: "24px",
            }}
          >
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
              <Field label="Property Type">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {propertyTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
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
                            ? "linear-gradient(135deg, #7B2D8B, #4A1060)"
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
                  {badges.map((b) => (
                    <button
                      key={b}
                      onClick={() => setForm((f) => ({ ...f, badge: b }))}
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

          {/* Description */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #f0e6d8",
              padding: "24px",
            }}
          >
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
                  rows={4}
                  placeholder="Describe the property, neighbourhood, key selling points…"
                  style={{
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
                    resize: "vertical",
                    lineHeight: 1.7,
                    transition: "border 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
                  onBlur={(e) => (e.target.style.borderColor = "#f0e6d8")}
                />
              </Field>

              <Field label="Key Features">
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addFeature()}
                    placeholder="e.g. Swimming pool, BQ, Solar…"
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #f0e6d8",
                      background: "#fdf8f3",
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 12,
                      color: "#1a0f00",
                      outline: "none",
                      transition: "border 0.2s",
                    }}
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
                      background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
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
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
              color: "#fff",
              fontFamily: "'Jost', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "filter 0.2s, transform 0.2s",
              boxShadow: "0 8px 28px rgba(123,45,139,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.1)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            List Property
          </button>
        </div>
      </div>
    </div>
  );
}
