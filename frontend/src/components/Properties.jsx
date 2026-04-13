import { useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Upload,
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Maximize2,
  Tag,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageOff,
} from "lucide-react";
import { useManageProperties } from "../Hooks/useManageProperties";
import { useNavigate } from "react-router-dom";

const PROPERTY_TYPES = [
  "Villa",
  "Apartment",
  "Townhouse",
  "Maisonette",
  "Land/Plot",
  "Commercial",
];
const BADGES = ["Featured", "New Listing", "For Sale", "For Rent", "Off-Plan"];
const STATUSES = ["active", "draft", "archived", "sold"];
const SORTS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Oldest", value: "createdAt" },
  { label: "Price ↑", value: "price" },
  { label: "Price ↓", value: "-price" },
  { label: "Most viewed", value: "-viewCount" },
];

// ── Design tokens ────────────────────────────────────────────────────────────
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

const Field = ({ label, children, hint }) => (
  <div>
    <label
      style={{
        fontFamily: "'Jost', sans-serif",
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

const StatusPill = ({ status }) => {
  const map = {
    active: { bg: "#d1fae5", color: "#065f46" },
    draft: { bg: "#fef3c7", color: "#92400e" },
    archived: { bg: "#f3f4f6", color: "#4b5563" },
    sold: { bg: "#ede9fe", color: "#5b21b6" },
  };
  const s = map[status] || map.draft;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 10,
        fontWeight: 600,
        fontFamily: "'Jost', sans-serif",
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

// ── Overlay backdrop ─────────────────────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function Properties() {
  const navigate = useNavigate();
  const fileEditRef = useRef(null);

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
    editing,
    editForm,
    editImages,
    editLoading,
    editError,
    editSuccess,
    featureInput,
    setFeatureInput,
    openEdit,
    closeEdit,
    setEditField,
    setEditDirect,
    addEditImages,
    removeNewImage,
    removeExistingImage,
    addFeature,
    removeFeature,
    submitEdit,
    deleting,
    deleteLoading,
    deleteError,
    openDelete,
    closeDelete,
    confirmDelete,
  } = useManageProperties();

  const fmt = (n) =>
    new Intl.NumberFormat("en-KE", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1100, margin: "0 auto" }}>
      {/* ── Header ── */}
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
            fontFamily: "'Jost', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 18px rgba(123,45,139,0.25)",
          }}
        >
          <Plus size={15} /> Add Property
        </button>
      </div>

      {/* ── Filters bar ── */}
      <div style={{ ...card, marginBottom: 24, padding: "18px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto auto",
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
            {PROPERTY_TYPES.map((t) => (
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
              fontFamily: "'Jost', sans-serif",
              fontSize: 12,
              color: MUTED,
            }}
          >
            <SlidersHorizontal size={13} /> Refresh
          </button>
        </div>
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 11,
            color: LABEL,
            marginTop: 12,
          }}
        >
          {total} propert{total === 1 ? "y" : "ies"} found
        </p>
      </div>

      {/* ── List error ── */}
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
              fontFamily: "'Jost', sans-serif",
              fontSize: 13,
              color: "#dc2626",
            }}
          >
            {listError}
          </span>
        </div>
      )}

      {/* ── Loading ── */}
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
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* ── Empty state ── */}
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
              fontFamily: "'Cormorant Garamond', serif",
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
              fontFamily: "'Jost', sans-serif",
              fontSize: 13,
              color: MUTED,
            }}
          >
            Try adjusting your filters or add a new listing.
          </p>
        </div>
      )}

      {/* ── Property grid ── */}
      {!listLoading && properties.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
            marginBottom: 28,
          }}
        >
          {properties.map((p) => {
            const img = p.primaryImage || p.images?.[0]?.url;
            return (
              <div
                key={p._id}
                style={{
                  ...card,
                  padding: 0,
                  overflow: "hidden",
                  transition: "box-shadow 0.2s",
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
                  {/* Badge */}
                  {p.badge && (
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background: "#b45309",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 700,
                        fontFamily: "'Jost', sans-serif",
                        padding: "3px 9px",
                        borderRadius: 99,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                  {/* Status */}
                  <div style={{ position: "absolute", top: 10, right: 10 }}>
                    <StatusPill status={p.status} />
                  </div>
                  {/* Image count */}
                  {p.images?.length > 1 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 10,
                        background: "rgba(0,0,0,0.55)",
                        color: "#fff",
                        fontSize: 10,
                        fontFamily: "'Jost', sans-serif",
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
                      fontFamily: "'Cormorant Garamond', serif",
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
                      fontFamily: "'Jost', sans-serif",
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

                  {/* Stats row */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    {p.beds > 0 && (
                      <span
                        style={{
                          fontFamily: "'Jost', sans-serif",
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
                          fontFamily: "'Jost', sans-serif",
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
                          fontFamily: "'Jost', sans-serif",
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
                        fontFamily: "'Jost', sans-serif",
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
                  <p
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: PURPLE,
                      marginBottom: 14,
                    }}
                  >
                    KES {fmt(p.price)}
                    {p.priceLabel ? (
                      <span
                        style={{ fontSize: 11, fontWeight: 400, color: MUTED }}
                      >
                        {" "}
                        / {p.priceLabel}
                      </span>
                    ) : null}
                  </p>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => openEdit(p)}
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
                        fontFamily: "'Jost', sans-serif",
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
                    <button
                      onClick={() => openDelete(p)}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "9px 0",
                        borderRadius: 10,
                        border: "1.5px solid #fca5a5",
                        background: "#fff5f5",
                        cursor: "pointer",
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#dc2626",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fef2f2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff5f5";
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
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
                border: "none",
                background:
                  n === page
                    ? `linear-gradient(135deg,${PURPLE},${DPURPLE})`
                    : CREAM,
                color: n === page ? "#fff" : MUTED,
                fontFamily: "'Jost', sans-serif",
                fontSize: 13,
                fontWeight: n === page ? 600 : 400,
                cursor: "pointer",
                border: n === page ? "none" : `1.5px solid ${BORDER}`,
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

      {/* ════════════════ EDIT MODAL ════════════════ */}
      {editing && (
        <Backdrop onClose={closeEdit}>
          <div style={{ ...card, maxHeight: "90vh", overflowY: "auto" }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 11,
                    color: "#b45309",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Editing
                </p>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#1a0f00",
                  }}
                >
                  {editing.name}
                </h2>
              </div>
              <button
                onClick={closeEdit}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: `1.5px solid ${BORDER}`,
                  background: CREAM,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={15} color={MUTED} />
              </button>
            </div>

            {/* Feedback banners */}
            {editSuccess && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#d1fae5",
                  border: "1.5px solid #6ee7b7",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 20,
                }}
              >
                <CheckCircle size={15} color="#065f46" />
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 13,
                    color: "#065f46",
                    fontWeight: 500,
                  }}
                >
                  Saved successfully!
                </span>
              </div>
            )}
            {editError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#fef2f2",
                  border: "1.5px solid #fca5a5",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 20,
                }}
              >
                <AlertCircle size={15} color="#dc2626" />
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 13,
                    color: "#dc2626",
                  }}
                >
                  {editError}
                </span>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              {/* LEFT */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <Field label="Property Name *">
                  <IconInput
                    icon={Home}
                    value={editForm.name}
                    onChange={setEditField("name")}
                    placeholder="Property name"
                  />
                </Field>
                <Field label="Location *">
                  <IconInput
                    icon={MapPin}
                    value={editForm.location}
                    onChange={setEditField("location")}
                    placeholder="Location"
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
                    <IconInput
                      icon={DollarSign}
                      value={editForm.price}
                      onChange={setEditField("price")}
                      type="number"
                    />
                  </Field>
                  <Field label="Price label">
                    <IconInput
                      icon={Tag}
                      value={editForm.priceLabel}
                      onChange={setEditField("priceLabel")}
                      placeholder="Per month"
                    />
                  </Field>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 10,
                  }}
                >
                  <Field label="Beds">
                    <IconInput
                      icon={Bed}
                      value={editForm.beds}
                      onChange={setEditField("beds")}
                      type="number"
                    />
                  </Field>
                  <Field label="Baths">
                    <IconInput
                      icon={Bath}
                      value={editForm.baths}
                      onChange={setEditField("baths")}
                      type="number"
                    />
                  </Field>
                  <Field label="Area m²">
                    <IconInput
                      icon={Maximize2}
                      value={editForm.area}
                      onChange={setEditField("area")}
                      type="number"
                    />
                  </Field>
                </div>

                {/* Status */}
                <Field label="Status">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setEditDirect("status", s)}
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: 12,
                          padding: "7px 14px",
                          borderRadius: 99,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          border:
                            editForm.status === s
                              ? "none"
                              : `1.5px solid ${BORDER}`,
                          background:
                            editForm.status === s
                              ? `linear-gradient(135deg,${PURPLE},${DPURPLE})`
                              : CREAM,
                          color: editForm.status === s ? "#fff" : MUTED,
                          fontWeight: editForm.status === s ? 600 : 400,
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Description */}
                <Field label="Description">
                  <textarea
                    value={editForm.description}
                    onChange={setEditField("description")}
                    rows={4}
                    style={{
                      ...inputBase,
                      resize: "vertical",
                      lineHeight: 1.7,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  />
                </Field>
              </div>

              {/* RIGHT */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                {/* Type */}
                <Field label="Property Type *">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {PROPERTY_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setEditDirect("type", t)}
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: 12,
                          padding: "7px 13px",
                          borderRadius: 99,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          border:
                            editForm.type === t
                              ? "none"
                              : `1.5px solid ${BORDER}`,
                          background:
                            editForm.type === t
                              ? `linear-gradient(135deg,${PURPLE},${DPURPLE})`
                              : CREAM,
                          color: editForm.type === t ? "#fff" : MUTED,
                          fontWeight: editForm.type === t ? 600 : 400,
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Badge */}
                <Field label="Badge">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {BADGES.map((b) => (
                      <button
                        key={b}
                        onClick={() =>
                          setEditDirect("badge", editForm.badge === b ? "" : b)
                        }
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: 12,
                          padding: "7px 13px",
                          borderRadius: 99,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          border:
                            editForm.badge === b
                              ? "none"
                              : `1.5px solid ${BORDER}`,
                          background: editForm.badge === b ? "#b45309" : CREAM,
                          color: editForm.badge === b ? "#fff" : MUTED,
                          fontWeight: editForm.badge === b ? 600 : 400,
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Key features */}
                <Field
                  label="Key Features"
                  hint="Press Enter or click + to add"
                >
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addFeature())
                      }
                      placeholder="e.g. Swimming pool…"
                      style={{
                        ...inputBase,
                        fontSize: 12,
                        padding: "9px 13px",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
                      onBlur={(e) => (e.target.style.borderColor = BORDER)}
                    />
                    <button
                      onClick={addFeature}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        border: "none",
                        flexShrink: 0,
                        background: `linear-gradient(135deg,${PURPLE},${DPURPLE})`,
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {editForm.features.map((f, i) => (
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
                          <X size={10} color={PURPLE} />
                        </button>
                      </span>
                    ))}
                  </div>
                </Field>

                {/* Existing images */}
                <Field
                  label="Current Images"
                  hint="Click × to remove an image from Cloudinary"
                >
                  {editing.images?.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(72px, 1fr))",
                        gap: 7,
                      }}
                    >
                      {editing.images.map((img, idx) => (
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
                                : `2px solid transparent`,
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
                                fontFamily: "'Jost', sans-serif",
                                padding: "2px 5px",
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
                  ) : (
                    <p
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 12,
                        color: LABEL,
                      }}
                    >
                      No images yet.
                    </p>
                  )}
                </Field>

                {/* Upload new images */}
                <Field label="Add New Images">
                  <div
                    onClick={() => fileEditRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      addEditImages(e.dataTransfer.files);
                    }}
                    style={{
                      border: "2px dashed #e8ddd2",
                      borderRadius: 12,
                      padding: "20px",
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
                      size={16}
                      color={PURPLE}
                      strokeWidth={1.8}
                      style={{ margin: "0 auto 6px" }}
                    />
                    <p
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 12,
                        color: MUTED,
                      }}
                    >
                      Drop or{" "}
                      <span style={{ color: PURPLE, fontWeight: 600 }}>
                        browse
                      </span>
                    </p>
                    <input
                      ref={fileEditRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        addEditImages(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </div>
                  {editImages.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(64px, 1fr))",
                        gap: 7,
                      }}
                    >
                      {editImages.map(({ preview }, idx) => (
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
                            onClick={() => removeNewImage(idx)}
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
                </Field>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={submitEdit}
              disabled={editLoading}
              style={{
                width: "100%",
                marginTop: 28,
                padding: "15px",
                borderRadius: 14,
                border: "none",
                background: editLoading
                  ? "#9ca3af"
                  : `linear-gradient(135deg,${PURPLE},${DPURPLE})`,
                color: "#fff",
                fontFamily: "'Jost', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: editLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: editLoading
                  ? "none"
                  : "0 8px 24px rgba(123,45,139,0.28)",
              }}
            >
              {editLoading ? (
                <>
                  <Loader2
                    size={15}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />{" "}
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </Backdrop>
      )}

      {/* ════════════════ DELETE CONFIRM MODAL ════════════════ */}
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
                  fontFamily: "'Cormorant Garamond', serif",
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
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 13,
                  color: MUTED,
                  lineHeight: 1.6,
                }}
              >
                <strong>{deleting.name}</strong> will be permanently removed
                along with all its images from Cloudinary. This cannot be
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
                    fontFamily: "'Jost', sans-serif",
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
                  fontFamily: "'Jost', sans-serif",
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
                  fontFamily: "'Jost', sans-serif",
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
    </div>
  );
}
