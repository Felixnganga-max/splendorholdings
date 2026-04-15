import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
  Maximize2,
  Camera,
  ArrowLeft,
  Images,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Inject fonts (idempotent)
───────────────────────────────────────────── */
if (!document.querySelector("#gallery-fonts")) {
  const l = document.createElement("link");
  l.id = "gallery-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700;900&display=swap";
  document.head.appendChild(l);
}

/* ─────────────────────────────────────────────
   Design tokens (matching your CSS vars)
───────────────────────────────────────────── */
const T = {
  primary: "#0a1172",
  secondary: "#1a3a5c",
  accent: "#d4af37",
  beige: "#ede8dc",
  white: "#fafaf8",
  black: "#0d0d0d",
  text: "#1a1a2e",
  muted: "#6b7280",
  heading: "'Playfair Display', Georgia, serif",
  body: "'Lato', 'Helvetica Neue', Arial, sans-serif",
};

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function imgSrc(src) {
  return src || "https://via.placeholder.com/800x600?text=No+Image";
}

/* ─────────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────────── */
function Lightbox({ imgs, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);

  const prev = useCallback(
    () => setIdx((i) => (i - 1 + imgs.length) % imgs.length),
    [imgs.length],
  );
  const next = useCallback(
    () => setIdx((i) => (i + 1) % imgs.length),
    [imgs.length],
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(10,17,114,0.97)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid rgba(212,175,55,0.18)`,
        }}
      >
        <span
          style={{
            fontFamily: T.heading,
            fontSize: 13,
            color: T.accent,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {idx + 1} &nbsp;/&nbsp; {imgs.length}
        </span>
        <button
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.beige,
            fontFamily: T.body,
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <X size={16} /> Close
        </button>
      </div>

      {/* Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxHeight: "75vh",
          maxWidth: "78vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={imgSrc(imgs[idx])}
          alt={`Photo ${idx + 1}`}
          style={{
            maxHeight: "75vh",
            maxWidth: "78vw",
            objectFit: "contain",
            borderRadius: 4,
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          }}
        />
      </div>

      {/* Nav arrows */}
      {[
        {
          side: "left",
          fn: (e) => {
            e.stopPropagation();
            prev();
          },
          icon: <ChevronLeft size={22} />,
        },
        {
          side: "right",
          fn: (e) => {
            e.stopPropagation();
            next();
          },
          icon: <ChevronRight size={22} />,
        },
      ].map(({ side, fn, icon }) => (
        <button
          key={side}
          onClick={fn}
          style={{
            position: "absolute",
            [side]: 20,
            top: "50%",
            transform: "translateY(-50%)",
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: `1.5px solid rgba(212,175,55,0.35)`,
            background: "rgba(10,17,114,0.7)",
            color: T.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.accent)}
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)")
          }
        >
          {icon}
        </button>
      ))}

      {/* Dot strip */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          bottom: 28,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        {imgs.slice(0, Math.min(imgs.length, 12)).map((_, i) => (
          <div
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 24 : 8,
              height: 8,
              borderRadius: 99,
              background: i === idx ? T.accent : "rgba(237,232,220,0.3)",
              cursor: "pointer",
              transition: "all 0.25s",
            }}
          />
        ))}
        {imgs.length > 12 && (
          <span
            style={{
              color: "rgba(237,232,220,0.5)",
              fontSize: 12,
              fontFamily: T.body,
            }}
          >
            …
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PHOTO TOUR PAGE
   Full-page overlay listing all photos (no groups)
───────────────────────────────────────────── */
function PhotoTourPage({ imgs, propertyName, onClose, onSelectPhoto }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: T.white,
        overflowY: "auto",
        fontFamily: T.body,
      }}
    >
      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: T.white,
          borderBottom: `1px solid ${T.beige}`,
          padding: "18px 40px",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.primary,
            fontFamily: T.body,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div
          style={{
            height: 20,
            width: 1,
            background: T.beige,
          }}
        />
        <span
          style={{
            fontFamily: T.heading,
            fontSize: 15,
            color: T.primary,
            fontWeight: 600,
          }}
        >
          Photo Tour
        </span>
        <span
          style={{
            fontSize: 12,
            color: T.muted,
            marginLeft: "auto",
          }}
        >
          {imgs.length} photos
        </span>
      </div>

      {/* Property name */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "40px 40px 0",
        }}
      >
        <h2
          style={{
            fontFamily: T.heading,
            fontSize: 28,
            fontWeight: 700,
            color: T.primary,
            marginBottom: 4,
          }}
        >
          {propertyName}
        </h2>
        <div
          style={{
            width: 48,
            height: 2,
            background: T.accent,
            marginBottom: 40,
          }}
        />

        {/* All photos in a single grid - no groups */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          {imgs.map((src, idx) => (
            <div
              key={idx}
              onClick={() => onSelectPhoto(idx)}
              style={{
                aspectRatio: "4/3",
                overflow: "hidden",
                borderRadius: 8,
                cursor: "pointer",
                position: "relative",
                border: `1px solid ${T.beige}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.querySelector("img").style.transform =
                  "scale(1.04)";
                e.currentTarget.querySelector(".overlay").style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelector("img").style.transform =
                  "scale(1)";
                e.currentTarget.querySelector(".overlay").style.opacity = "0";
              }}
            >
              <img
                src={imgSrc(src)}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.4s ease",
                }}
              />
              <div
                className="overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(10,17,114,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.25s",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: `2px solid ${T.accent}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Maximize2 size={18} color={T.accent} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ paddingBottom: 60 }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN GALLERY  ← drop-in replacement
───────────────────────────────────────────── */
export default function Gallery({
  imgs = [],
  badge,
  badgeColor,
  propertyName = "Property",
}) {
  const [view, setView] = useState("grid"); // "grid" | "tour" | "lightbox"
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setView("lightbox");
  };

  const closeLightbox = () => setView("grid");
  const closeTour = () => setView("grid");

  /* ── 4-BOX grid layout ── */
  // Box 1: main (large, left)
  // Box 2: top-right
  // Box 3: bottom-right-top
  // Box 4: bottom-right-bottom (with "+N more" overlay)
  const remaining = Math.max(0, imgs.length - 4);

  return (
    <>
      {/* ── GRID ── */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.35fr 1fr",
            gridTemplateRows: "240px 240px",
            gap: 5,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Box 1 – large hero */}
          <Cell
            src={imgs[0]}
            rowSpan={2}
            badge={badge}
            badgeColor={badgeColor}
            onClick={() => openLightbox(0)}
          />

          {/* Box 2 */}
          <Cell src={imgs[1]} onClick={() => openLightbox(1)} />

          {/* Box 3 + 4 (bottom-right split) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 5,
            }}
          >
            <Cell src={imgs[2]} onClick={() => openLightbox(2)} small />
            <Cell
              src={imgs[3]}
              onClick={() => openLightbox(3)}
              small
              moreCount={remaining}
            />
          </div>
        </div>

        {/* ── "See All Photos" button ── */}
        <button
          onClick={() => setView("tour")}
          style={{
            position: "absolute",
            bottom: 18,
            right: 18,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 8,
            background: T.white,
            border: `1.5px solid ${T.primary}`,
            color: T.primary,
            fontFamily: T.body,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(10,17,114,0.12)",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.primary;
            e.currentTarget.style.color = T.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = T.white;
            e.currentTarget.style.color = T.primary;
          }}
        >
          <Grid size={14} />
          Show all {imgs.length} photos
        </button>
      </div>

      {/* ── PHOTO TOUR PAGE ── */}
      {view === "tour" && (
        <PhotoTourPage
          imgs={imgs}
          propertyName={propertyName}
          onClose={closeTour}
          onSelectPhoto={(idx) => openLightbox(idx)}
        />
      )}

      {/* ── LIGHTBOX ── */}
      {view === "lightbox" && (
        <Lightbox
          imgs={imgs}
          startIndex={lightboxIdx}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   Cell sub-component
───────────────────────────────────────────── */
function Cell({ src, rowSpan, badge, badgeColor, onClick, small, moreCount }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridRow: rowSpan ? "1 / 3" : undefined,
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        background: T.beige,
      }}
    >
      {src ? (
        <img
          src={imgSrc(src)}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.45s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
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
            background: T.beige,
          }}
        >
          <Camera size={28} color={T.muted} />
        </div>
      )}

      {/* Subtle dark vignette on hover */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,17,114,0.28)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
          pointerEvents: "none",
        }}
      />

      {/* Badge */}
      {badge && (
        <span
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            background: badgeColor || T.primary,
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: 2,
            fontFamily: T.body,
          }}
        >
          {badge}
        </span>
      )}

      {/* More photos overlay */}
      {moreCount > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10,17,114,0.72)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            pointerEvents: "none",
          }}
        >
          <Images size={small ? 20 : 24} color={T.accent} strokeWidth={1.5} />
          <span
            style={{
              color: T.white,
              fontFamily: T.heading,
              fontSize: small ? 14 : 18,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            +{moreCount} more
          </span>
        </div>
      )}
    </div>
  );
}
