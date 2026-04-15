import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import {
  useFeaturedProperties,
  usePropertyActions,
} from "../Hooks/useFeaturedProperties";
import assets from "../assets/assets";

/* ── Font injection ── */
if (!document.querySelector("#slendor-fonts")) {
  const l = document.createElement("link");
  l.id = "slendor-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700&display=swap";
  document.head.appendChild(l);
}

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const B = {
  primary: "#0a1172", // Midnight Royal Blue
  secondary: "#1a3a5c", // Deep Navy
  accent: "#d4af37", // Royal Gold
  beige: "#ede8dc", // Warm Cream
  white: "#fafaf8", // Off-White
  black: "#0d0d0d", // Rich Black
  text: "#1a1a2e", // Dark Navy body
  muted: "#6b7280", // Gray muted
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Lato', 'Helvetica Neue', Arial, sans-serif",
  grad: "linear-gradient(135deg, #0a1172 0%, #1a3a5c 100%)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPrimaryImage(property) {
  if (!property.images?.length) return null;
  const primary = property.images.find((img) => img.isPrimary);
  return (primary ?? property.images[0])?.url ?? null;
}

function normalizeProperty(p) {
  return {
    id: p._id,
    name: p.name,
    location: p.location,
    price: p.pricing?.label ?? formatPrice(p.pricing?.original),
    beds: p.beds ?? 0,
    baths: p.baths ?? 0,
    area: p.area ?? 0,
    type: p.type ?? "",
    badge: p.badge ?? "For Sale",
    badgeColor: p.badgeColor ?? B.primary,
    rating: p.rating ?? null,
    img: getPrimaryImage(p),
    isSoldOut: p.isSoldOut ?? false,
    raw: p,
  };
}

function formatPrice(n) {
  if (!n) return "—";
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `KES ${(n / 1_000).toFixed(0)}K`;
  return `KES ${n}`;
}

// ─── Parallax hook ────────────────────────────────────────────────────────────
function useParallax(ref, speed = 0.08) {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      setY(center * speed);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return y;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        background: "rgba(250,250,248,0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid rgba(212,175,55,0.20)",
        boxShadow: "0 8px 32px rgba(10,17,114,0.10)",
      }}
    >
      <div
        style={{
          height: 220,
          backgroundImage:
            "linear-gradient(90deg,#ede8dc 25%,#e0d9cc 50%,#ede8dc 75%)",
          backgroundSize: "400% 100%",
          animation: "shimmer 1.4s ease-in-out infinite",
        }}
      />
      <div style={{ padding: "18px 20px 20px" }}>
        {[100, 60, 80].map((w, i) => (
          <div
            key={i}
            style={{
              height: i === 0 ? 22 : 14,
              width: `${w}%`,
              borderRadius: 6,
              marginBottom: 10,
              animation: "shimmer 1.4s ease-in-out infinite",
              backgroundSize: "400% 100%",
              backgroundImage:
                "linear-gradient(90deg,#ede8dc 25%,#e0d9cc 50%,#ede8dc 75%)",
            }}
          />
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>
    </div>
  );
}

// ─── Small reusable modal helpers ─────────────────────────────────────────────
function ErrorBox({ msg }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        background: "#fff0f0",
        border: "1px solid #fca5a5",
        borderRadius: 10,
        padding: "10px 12px",
        marginBottom: 14,
      }}
    >
      <AlertCircle
        size={15}
        color="#dc2626"
        style={{ flexShrink: 0, marginTop: 1 }}
      />
      <p
        style={{
          fontFamily: B.sans,
          fontSize: 13,
          color: "#dc2626",
          lineHeight: 1.5,
        }}
      >
        {msg}
      </p>
    </div>
  );
}

function BackBtn({ onClick, label = "← Back" }) {
  return (
    <button
      onClick={onClick}
      style={{
        marginTop: 10,
        width: "100%",
        background: "none",
        border: "none",
        fontFamily: B.sans,
        fontSize: 13,
        color: B.muted,
        cursor: "pointer",
        textDecoration: "underline",
      }}
    >
      {label}
    </button>
  );
}

function ModalField({ label, labelStyle, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ─── Action Modal ─────────────────────────────────────────────────────────────
function ActionModal({ property, onClose }) {
  const isLoggedIn = !!localStorage.getItem("token");
  const [mode, setMode] = useState("choose");
  const [successMsg, setSuccessMsg] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [inquiryType, setInquiryType] = useState("Information");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const {
    placeOrder,
    submitInquiry,
    actionLoading,
    actionError,
    clearActionError,
  } = usePropertyActions(property.id);

  const handleOrder = async () => {
    try {
      const order = await placeOrder({
        offeredPrice: offeredPrice ? Number(offeredPrice) : undefined,
        notes: orderNotes,
      });
      setSuccessMsg(
        `Order ${order.orderNumber ?? "#"} placed! Our team will reach out shortly.`,
      );
      setMode("success");
    } catch (err) {
      if (err.loginRequired) setMode("login");
    }
  };

  const handleInquiry = async () => {
    await submitInquiry({
      message: inquiryMsg,
      type: inquiryType,
      guestName: isLoggedIn ? undefined : guestName,
      guestEmail: isLoggedIn ? undefined : guestEmail,
      guestPhone: isLoggedIn ? undefined : guestPhone,
    });
    if (!actionError) {
      setSuccessMsg("Your inquiry has been sent! We'll be in touch soon.");
      setMode("success");
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: `1.5px solid ${B.beige}`,
    fontFamily: B.sans,
    fontSize: 14,
    color: B.text,
    background: B.white,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontFamily: B.sans,
    fontSize: 11,
    fontWeight: 700,
    color: B.accent,
    marginBottom: 5,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  };

  const btnPrimary = {
    width: "100%",
    padding: "13px",
    borderRadius: 99,
    border: "none",
    background: B.grad,
    color: B.white,
    fontFamily: B.sans,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    cursor: actionLoading ? "not-allowed" : "pointer",
    opacity: actionLoading ? 0.7 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "filter 0.2s",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,17,114,0.50)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: B.white,
          borderRadius: 24,
          width: "100%",
          maxWidth: 460,
          padding: "30px 28px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid rgba(212,175,55,0.28)",
          boxShadow: "0 24px 80px rgba(10,17,114,0.25)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `1.5px solid ${B.beige}`,
            background: B.white,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={15} color={B.muted} />
        </button>

        {/* Property mini-header */}
        <div style={{ marginBottom: 22 }}>
          <p
            style={{
              fontFamily: B.sans,
              fontSize: 11,
              color: B.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 3,
            }}
          >
            {property.type} · {property.location}
          </p>
          <h3
            style={{
              fontFamily: B.serif,
              fontSize: 22,
              fontWeight: 700,
              color: B.text,
            }}
          >
            {property.name}
          </h3>
          <p
            style={{
              fontFamily: B.serif,
              fontSize: 20,
              fontWeight: 700,
              color: B.primary,
              marginTop: 2,
            }}
          >
            {property.price}
          </p>
        </div>

        <div style={{ height: 1, background: B.beige, marginBottom: 22 }} />

        {/* ── choose ── */}
        {mode === "choose" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p
              style={{
                fontFamily: B.sans,
                fontSize: 14,
                color: B.muted,
                marginBottom: 8,
                lineHeight: 1.6,
              }}
            >
              How would you like to proceed with this property?
            </p>
            <button
              onClick={() => {
                clearActionError();
                setMode("order");
              }}
              style={btnPrimary}
            >
              <ArrowRight size={14} /> Express Purchase Interest
            </button>
            <button
              onClick={() => {
                clearActionError();
                setMode("inquiry");
              }}
              style={{
                ...btnPrimary,
                background: "transparent",
                color: B.text,
                border: `2px solid ${B.text}`,
              }}
            >
              Send an Inquiry
            </button>
          </div>
        )}

        {/* ── order ── */}
        {mode === "order" && (
          <div>
            <h4
              style={{
                fontFamily: B.serif,
                fontSize: 20,
                fontWeight: 700,
                color: B.text,
                marginBottom: 18,
              }}
            >
              Express Purchase Interest
            </h4>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Your Offer Price (optional)</label>
              <input
                style={inputStyle}
                type="number"
                placeholder={`Listed at ${property.price}`}
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Notes to Agent (optional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                placeholder="Share anything relevant — viewing availability, financing status…"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>
            {actionError && <ErrorBox msg={actionError} />}
            <button
              style={btnPrimary}
              onClick={handleOrder}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 size={14} className="spin" /> Placing order…
                </>
              ) : (
                <>
                  <ArrowRight size={14} /> Submit Interest
                </>
              )}
            </button>
            <BackBtn
              onClick={() => {
                clearActionError();
                setMode("choose");
              }}
            />
          </div>
        )}

        {/* ── inquiry ── */}
        {mode === "inquiry" && (
          <div>
            <h4
              style={{
                fontFamily: B.serif,
                fontSize: 20,
                fontWeight: 700,
                color: B.text,
                marginBottom: 18,
              }}
            >
              Send an Inquiry
            </h4>
            {!isLoggedIn && (
              <>
                <ModalField label="Your Name" labelStyle={labelStyle}>
                  <input
                    style={inputStyle}
                    placeholder="Jane Doe"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </ModalField>
                <ModalField label="Email *" labelStyle={labelStyle}>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="you@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </ModalField>
                <ModalField label="Phone (optional)" labelStyle={labelStyle}>
                  <input
                    style={inputStyle}
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                  />
                </ModalField>
              </>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Inquiry Type</label>
              <select
                style={{ ...inputStyle, appearance: "none" }}
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
              >
                {["Information", "Viewing", "Offer", "Other"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Message *</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                placeholder="What would you like to know about this property?"
                value={inquiryMsg}
                onChange={(e) => setInquiryMsg(e.target.value)}
              />
            </div>
            {actionError && <ErrorBox msg={actionError} />}
            <button
              style={btnPrimary}
              onClick={handleInquiry}
              disabled={
                actionLoading ||
                !inquiryMsg.trim() ||
                (!isLoggedIn && !guestEmail.trim())
              }
            >
              {actionLoading ? (
                <>
                  <Loader2 size={14} /> Sending…
                </>
              ) : (
                "Send Inquiry"
              )}
            </button>
            <BackBtn
              onClick={() => {
                clearActionError();
                setMode("choose");
              }}
            />
          </div>
        )}

        {/* ── login required ── */}
        {mode === "login" && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <LogIn size={36} color={B.primary} style={{ marginBottom: 14 }} />
            <h4
              style={{
                fontFamily: B.serif,
                fontSize: 20,
                fontWeight: 700,
                color: B.text,
                marginBottom: 8,
              }}
            >
              Sign in to Place an Order
            </h4>
            <p
              style={{
                fontFamily: B.sans,
                fontSize: 14,
                color: B.muted,
                lineHeight: 1.6,
                marginBottom: 22,
              }}
            >
              You need an account to express purchase interest. You can still
              send an inquiry as a guest.
            </p>
            <button
              style={btnPrimary}
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              <LogIn size={14} /> Sign In
            </button>
            <BackBtn
              label="Continue as guest with an inquiry"
              onClick={() => {
                clearActionError();
                setMode("inquiry");
              }}
            />
          </div>
        )}

        {/* ── success ── */}
        {mode === "success" && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <CheckCircle2
              size={40}
              color={B.accent}
              style={{ marginBottom: 14 }}
            />
            <h4
              style={{
                fontFamily: B.serif,
                fontSize: 22,
                fontWeight: 700,
                color: B.text,
                marginBottom: 8,
              }}
            >
              Done!
            </h4>
            <p
              style={{
                fontFamily: B.sans,
                fontSize: 14,
                color: B.muted,
                lineHeight: 1.6,
                marginBottom: 22,
              }}
            >
              {successMsg}
            </p>
            <button style={btnPrimary} onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>
    </div>
  );
}

// ─── Property Card ─────────────────────────────────────────────────────────────
function PropertyCard({ property, onAction }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);
  const parallaxY = useParallax(imgRef, 0.06);

  const p = normalizeProperty(property);

  // Fix: Ensure we have a valid ID before navigating
  const handleCardClick = () => {
    if (p.id) {
      navigate(`/property/${p.id}`);
    } else {
      console.error("Cannot navigate: No property ID found", p);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        background: "rgba(250,250,248,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid rgba(212,175,55,0.22)",
        boxShadow: "0 8px 32px rgba(10,17,114,0.10)",
        transition:
          "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease",
        cursor: "pointer",
        opacity: p.isSoldOut ? 0.72 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px) scale(1.01)";
        e.currentTarget.style.boxShadow = "0 28px 64px rgba(10,17,114,0.22)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(10,17,114,0.10)";
      }}
    >
      {/* ── Image ── */}
      <div
        ref={imgRef}
        style={{
          position: "relative",
          height: 220,
          overflow: "hidden",
          background: B.beige,
        }}
      >
        {p.img ? (
          <img
            src={p.img}
            alt={p.name}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: "100%",
              height: "130%",
              objectFit: "cover",
              objectPosition: "center",
              transform: `translateY(${parallaxY}px)`,
              willChange: "transform",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.5s ease, transform 0.05s linear",
            }}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: B.accent,
              fontSize: 13,
              fontFamily: B.sans,
            }}
          >
            No image
          </div>
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(10,17,114,0.05) 0%, rgba(10,17,114,0.48) 100%)",
          }}
        />

        {/* Sold Out */}
        {p.isSoldOut && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10,17,114,0.48)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: B.sans,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#fff",
                padding: "6px 16px",
                border: "2px solid #fff",
                borderRadius: 4,
              }}
            >
              Sold Out
            </span>
          </div>
        )}

        {/* Badges */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            display: "flex",
            gap: 6,
          }}
        >
          <span
            style={{
              background: p.badgeColor,
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 99,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: B.sans,
            }}
          >
            {p.badge}
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 400,
              padding: "4px 10px",
              borderRadius: 99,
              letterSpacing: "0.06em",
              fontFamily: B.sans,
              border: "1px solid rgba(255,255,255,0.30)",
            }}
          >
            {p.type}
          </span>
        </div>

        {/* Like — stopPropagation so it doesn't trigger card navigation */}
        <div style={{ position: "absolute", top: 14, right: 14 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked((l) => !l);
            }}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.20)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Heart
              size={15}
              fill={liked ? "#ef4444" : "none"}
              color={liked ? "#ef4444" : "white"}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Rating */}
        {p.rating != null && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 14,
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.30)",
              borderRadius: 99,
              padding: "3px 10px",
            }}
          >
            <Star size={11} fill={B.accent} color={B.accent} />
            <span
              style={{
                color: "#fff",
                fontSize: 11,
                fontFamily: B.sans,
                fontWeight: 500,
              }}
            >
              {p.rating}
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ marginBottom: 10 }}>
          <h3
            style={{
              fontFamily: B.serif,
              fontSize: 19,
              fontWeight: 700,
              color: B.text,
              marginBottom: 4,
              lineHeight: 1.2,
            }}
          >
            {p.name}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={11} color={B.accent} strokeWidth={2} />
            <span
              style={{
                fontSize: 12,
                color: B.muted,
                fontFamily: B.sans,
                fontWeight: 400,
              }}
            >
              {p.location}
            </span>
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, ${B.beige}, transparent)`,
            marginBottom: 12,
          }}
        />

        {/* Specs */}
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          {p.beds > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Bed size={13} color={B.accent} strokeWidth={1.8} />
              <span
                style={{ fontSize: 12, color: B.muted, fontFamily: B.sans }}
              >
                {p.beds} Beds
              </span>
            </div>
          )}
          {p.baths > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Bath size={13} color={B.accent} strokeWidth={1.8} />
              <span
                style={{ fontSize: 12, color: B.muted, fontFamily: B.sans }}
              >
                {p.baths} Baths
              </span>
            </div>
          )}
          {p.area > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Maximize2 size={12} color={B.accent} strokeWidth={1.8} />
              <span
                style={{ fontSize: 12, color: B.muted, fontFamily: B.sans }}
              >
                {p.area} m²
              </span>
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: B.muted,
                fontFamily: B.sans,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Listed Price
            </div>
            <div
              style={{
                fontFamily: B.serif,
                fontSize: 22,
                fontWeight: 700,
                color: B.primary,
                lineHeight: 1,
              }}
            >
              {p.price}
            </div>
          </div>

          {/*
            "Inquire" button — stopPropagation prevents the card's onClick
            (navigate to detail) from firing when the user clicks this button.
            Instead it opens the ActionModal for inquiry / order.
          */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!p.isSoldOut) onAction(p);
            }}
            disabled={p.isSoldOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: p.isSoldOut ? "#d1d5db" : B.grad,
              color: "#fff",
              border: "none",
              borderRadius: 99,
              padding: "9px 18px",
              fontSize: 11,
              fontFamily: B.sans,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: p.isSoldOut ? "not-allowed" : "pointer",
              transition: "transform 0.2s, filter 0.2s",
              boxShadow: p.isSoldOut
                ? "none"
                : "0 4px 14px rgba(10,17,114,0.28)",
            }}
            onMouseEnter={(e) => {
              if (!p.isSoldOut) {
                e.currentTarget.style.filter = "brightness(1.12)";
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {p.isSoldOut ? "Sold" : "Inquire"} <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FeaturedProperties() {
  const navigate = useNavigate();
  const { properties, tabs, activeTab, setActiveTab, loading, error, refetch } =
    useFeaturedProperties({ limit: 9 });

  const [activeProperty, setActiveProperty] = useState(null);
  const sectionRef = useRef(null);
  const bgParallax = useParallax(sectionRef, 0.06);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        padding: "100px 0 120px",
        overflow: "hidden",
      }}
    >
      {/*
        ── Parallax background ──
        The div is oversized (inset: -15%) so the translateY shift never
        reveals an edge. The image stays fixed-ish while the page scrolls.
      */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${assets.bg || assets.background || "/path/to/default-bg.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          zIndex: 0,
        }}
      />

      {/* ── Deep navy glass overlay — gives the frosted-over-image effect ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,17,114,0.20)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 1,
        }}
      />

      {/* ── Gold radial glow at top ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.20) 0%, transparent 60%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* ── All visible content sits above the parallax layers ── */}
      <div style={{ position: "relative", zIndex: 3 }}>
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "0 clamp(1rem, 3vw, 2.5rem)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 1.5,
                  background: B.accent,
                  borderRadius: 2,
                }}
              />
              <span
                style={{
                  fontFamily: B.sans,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: B.accent,
                }}
              >
                Featured Properties
              </span>
              <div
                style={{
                  width: 32,
                  height: 1.5,
                  background: B.accent,
                  borderRadius: 2,
                }}
              />
            </div>
          </div>

          <style>{`
            .slendor-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 28px;
            }
            @media (max-width: 1024px) {
              .slendor-grid { grid-template-columns: repeat(2, 1fr); gap: 22px; }
            }
            @media (max-width: 600px) {
              .slendor-grid { grid-template-columns: 1fr; gap: 18px; }
            }
          `}</style>

          {/* Error */}
          {error && !loading && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                fontFamily: B.sans,
              }}
            >
              <AlertCircle
                size={32}
                color="#ef4444"
                style={{ marginBottom: 12 }}
              />
              <p style={{ color: "#ef4444", fontSize: 15, marginBottom: 16 }}>
                {error}
              </p>
              <button
                onClick={refetch}
                style={{
                  padding: "10px 28px",
                  borderRadius: 99,
                  border: `2px solid ${B.white}`,
                  background: "transparent",
                  fontFamily: B.sans,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  color: B.white,
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Grid */}
          {!error && (
            <div className="slendor-grid">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : properties.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1/-1",
                    textAlign: "center",
                    padding: "60px 20px",
                    fontFamily: B.sans,
                    color: "rgba(250,250,248,0.65)",
                    fontSize: 15,
                  }}
                >
                  No properties found in this category.
                </div>
              ) : (
                properties.map((p, i) => (
                  <PropertyCard
                    key={p._id}
                    property={p}
                    index={i}
                    onAction={setActiveProperty}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action modal */}
      {activeProperty && (
        <ActionModal
          property={activeProperty}
          onClose={() => setActiveProperty(null)}
        />
      )}
    </section>
  );
}
