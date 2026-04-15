

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