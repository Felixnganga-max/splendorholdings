import { useState, useRef } from "react";
import {
  Search,
  MessageSquare,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  ArchiveX,
  RefreshCw,
  Building2,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { useInquiries } from "../hooks/useInquiries";

if (!document.querySelector("#splendor-inq-fonts")) {
  const l = document.createElement("link");
  l.id = "splendor-inq-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

// ── Type badge colours ────────────────────────────────────────────────────────
const TYPE_META = {
  "Viewing Request": { color: "#7B2D8B", bg: "#f3e8ff" },
  "Price Inquiry": { color: "#b45309", bg: "#fef3c7" },
  "Offer Intent": { color: "#0d6e5e", bg: "#d1fae5" },
  Information: { color: "#1d4ed8", bg: "#eff6ff" },
  "Buying a Property": { color: "#0d6e5e", bg: "#d1fae5" },
  "Renting a Property": { color: "#1d4ed8", bg: "#eff6ff" },
  "Selling My Property": { color: "#b45309", bg: "#fef3c7" },
  "Off-Plan Investment": { color: "#7B2D8B", bg: "#f3e8ff" },
  "Property Valuation": { color: "#c2410c", bg: "#fff7ed" },
  "Property Management": { color: "#1d4ed8", bg: "#eff6ff" },
  "General Enquiry": { color: "#6b7280", bg: "#f3f4f6" },
};

const getTypeMeta = (type) =>
  TYPE_META[type] || { color: "#6b7280", bg: "#f3f4f6" };

const STATUS_FILTERS = ["All", "unread", "read", "replied", "archived"];

const TYPE_FILTER_SHORTCUTS = [
  "All",
  "Viewing Request",
  "Price Inquiry",
  "Offer Intent",
  "Information",
  "General Enquiry",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const displayName = (inq) => {
  if (inq.sender) {
    const s = inq.sender;
    return `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email;
  }
  return inq.guestName || inq.guestEmail || "Anonymous";
};

const displayEmail = (inq) => inq.sender?.email || inq.guestEmail || null;
const displayPhone = (inq) => inq.sender?.phone || inq.guestPhone || null;

// ── Status badge style ────────────────────────────────────────────────────────
const statusStyle = (status) => {
  const map = {
    archived: { bg: "#f3f4f6", color: "#6b7280" },
    replied: { bg: "#d1fae5", color: "#0d6e5e" },
    read: { bg: "#eff6ff", color: "#1d4ed8" },
    unread: { bg: "#f3e8ff", color: "#7B2D8B" },
  };
  return map[status] || map.unread;
};

// ── Main component ────────────────────────────────────────────────────────────
export default function InquiriesPage() {
  const {
    inquiries,
    selected,
    stats,
    unreadCount,
    page,
    totalPages,
    totalCount,
    loading,
    detailLoading,
    error,
    search,
    typeFilter,
    statusFilter,
    setSearch,
    setTypeFilter,
    setStatusFilter,
    openInquiry,
    replyToInquiry,
    archiveInquiry,
    nextPage,
    prevPage,
    refresh,
  } = useInquiries({ limit: 25, pollInterval: 0 });

  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyDone, setReplyDone] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [archiving, setArchiving] = useState(false);
  const replyRef = useRef(null);

  const handleReply = async () => {
    if (!replyBody.trim() || !selected) return;
    setReplying(true);
    setReplyError("");
    try {
      await replyToInquiry(selected._id, replyBody.trim());
      setReplyBody("");
      setReplyDone(true);
      setTimeout(() => setReplyDone(false), 2500);
    } catch (err) {
      setReplyError(err.response?.data?.message || "Failed to send reply.");
    } finally {
      setReplying(false);
    }
  };

  const handleArchive = async () => {
    if (!selected) return;
    setArchiving(true);
    try {
      await archiveInquiry(selected._id);
    } finally {
      setArchiving(false);
    }
  };

  const meta = selected ? getTypeMeta(selected.type) : null;
  const ss = selected ? statusStyle(selected.status) : null;

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1200, margin: "0 auto" }}>
      {/* ── Page heading ── */}
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
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
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Buyer Activity
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.8rem,3vw,2.4rem)",
              fontWeight: 700,
              color: "#1a0f00",
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: 0,
            }}
          >
            Inquiries
            {unreadCount > 0 && (
              <span
                style={{
                  background: "linear-gradient(135deg,#7B2D8B,#4A1060)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "2px 11px",
                  borderRadius: 99,
                  fontFamily: "'Jost', sans-serif",
                  verticalAlign: "middle",
                }}
              >
                {unreadCount} new
              </span>
            )}
          </h1>
          {stats && (
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                color: "#9a7c5a",
                marginTop: 4,
              }}
            >
              {totalCount} total &nbsp;·&nbsp; {stats.byStatus?.replied || 0}{" "}
              replied &nbsp;·&nbsp; {stats.byStatus?.archived || 0} archived
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "1.5px solid #f0e5d8",
            borderRadius: 10,
            padding: "8px 14px",
            cursor: "pointer",
            fontFamily: "'Jost', sans-serif",
            fontSize: 12,
            color: "#9a7c5a",
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#fff0f0",
            border: "1px solid #fca5a5",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 20,
            fontFamily: "'Jost', sans-serif",
            fontSize: 13,
            color: "#dc2626",
          }}
        >
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.35fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* ── LEFT: Inbox list ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1.5px solid #f0e6d8",
            overflow: "hidden",
          }}
        >
          {/* Search + filters */}
          <div
            style={{
              padding: "16px 16px 12px",
              borderBottom: "1px solid #f5ede6",
            }}
          >
            <div style={{ position: "relative", marginBottom: 10 }}>
              <Search
                size={13}
                color="#c2884a"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email…"
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 32px",
                  borderRadius: 10,
                  border: "1.5px solid #f0e6d8",
                  background: "#fdf8f3",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 12,
                  color: "#1a0f00",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Status filter */}
            <div
              style={{
                display: "flex",
                gap: 5,
                flexWrap: "wrap",
                marginBottom: 6,
              }}
            >
              {STATUS_FILTERS.map((s) => {
                const active = (statusFilter || "All") === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s === "All" ? "" : s)}
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 10,
                      fontWeight: active ? 600 : 400,
                      padding: "4px 9px",
                      borderRadius: 99,
                      border: active ? "none" : "1px solid #e8ddd2",
                      background: active ? "#f0e8ff" : "transparent",
                      color: active ? "#7B2D8B" : "#9a8070",
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {/* Type filter */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {TYPE_FILTER_SHORTCUTS.map((t) => {
                const active = typeFilter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 10,
                      fontWeight: active ? 600 : 400,
                      padding: "4px 9px",
                      borderRadius: 99,
                      border: active ? "none" : "1px solid #e8ddd2",
                      background: active
                        ? "linear-gradient(135deg,#7B2D8B,#4A1060)"
                        : "transparent",
                      color: active ? "#fff" : "#9a8070",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rows */}
          <div style={{ maxHeight: 560, overflowY: "auto" }}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 40,
                  gap: 8,
                  color: "#c2884a",
                }}
              >
                <Loader2
                  size={18}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                <span
                  style={{ fontFamily: "'Jost', sans-serif", fontSize: 13 }}
                >
                  Loading…
                </span>
              </div>
            ) : inquiries.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 13,
                  color: "#c8b09a",
                }}
              >
                No inquiries found
              </div>
            ) : (
              inquiries.map((inq) => {
                const isUnread = inq.status === "unread";
                const isActive = selected?._id === inq._id;
                const tm = getTypeMeta(inq.type);
                return (
                  <div
                    key={inq._id}
                    onClick={() => openInquiry(inq)}
                    style={{
                      padding: "14px 18px",
                      borderBottom: "1px solid #fdf4ec",
                      cursor: "pointer",
                      background: isActive ? "#fdf3e8" : "transparent",
                      borderLeft: isActive
                        ? "3px solid #7B2D8B"
                        : "3px solid transparent",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "#fdf8f3";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        {isUnread && (
                          <div
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: "#7B2D8B",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: 13,
                            fontWeight: isUnread ? 600 : 400,
                            color: "#1a0f00",
                          }}
                        >
                          {displayName(inq)}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: 10,
                          color: "#b8a090",
                          flexShrink: 0,
                        }}
                      >
                        {fmt(inq.createdAt)}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      {inq.property && (
                        <span
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: 11,
                            color: "#7B2D8B",
                            fontWeight: 500,
                          }}
                        >
                          {inq.property.name}
                        </span>
                      )}
                      <span
                        style={{
                          background: tm.bg,
                          color: tm.color,
                          fontSize: 9,
                          fontWeight: 600,
                          padding: "2px 7px",
                          borderRadius: 99,
                          fontFamily: "'Jost', sans-serif",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {inq.type}
                      </span>
                    </div>

                    <p
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 11,
                        color: "#9a8070",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        margin: 0,
                      }}
                    >
                      {inq.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderTop: "1px solid #f5ede6",
              }}
            >
              <button
                onClick={prevPage}
                disabled={page === 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "1px solid #e8ddd2",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  opacity: page === 1 ? 0.4 : 1,
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 11,
                  color: "#9a7c5a",
                }}
              >
                <ChevronLeft size={12} /> Prev
              </button>
              <span
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 11,
                  color: "#9a7c5a",
                }}
              >
                Page {page} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={page === totalPages}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "1px solid #e8ddd2",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  opacity: page === totalPages ? 0.4 : 1,
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 11,
                  color: "#9a7c5a",
                }}
              >
                Next <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Detail pane ── */}
        {detailLoading ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #f0e6d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
              gap: 8,
              color: "#c2884a",
            }}
          >
            <Loader2
              size={20}
              style={{ animation: "spin 1s linear infinite" }}
            />
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 13 }}>
              Loading…
            </span>
          </div>
        ) : selected ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #f0e6d8",
              overflow: "hidden",
              position: "sticky",
              top: 24,
            }}
          >
            {/* Detail header */}
            <div
              style={{
                padding: "24px 28px",
                borderBottom: "1px solid #f5ede6",
                background: "linear-gradient(135deg,#fdf8f3,#fff)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: "linear-gradient(135deg,#7B2D8B22,#4A106018)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontFamily: "'Cormorant Garamond', serif",
                    color: "#7B2D8B",
                    fontWeight: 700,
                  }}
                >
                  {displayName(selected)[0]?.toUpperCase()}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      background: meta.bg,
                      color: meta.color,
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 99,
                      fontFamily: "'Jost', sans-serif",
                    }}
                  >
                    {selected.type}
                  </span>
                  <span
                    style={{
                      background: ss.bg,
                      color: ss.color,
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 99,
                      fontFamily: "'Jost', sans-serif",
                    }}
                  >
                    {selected.status}
                  </span>
                </div>
              </div>

              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#1a0f00",
                  marginBottom: 4,
                }}
              >
                {displayName(selected)}
              </h3>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 11,
                  color: "#9a8070",
                }}
              >
                {selected.property
                  ? `Re: ${selected.property.name}`
                  : "General Inquiry"}{" "}
                &nbsp;·&nbsp; {fmt(selected.createdAt)}
              </p>
            </div>

            {/* Contact info */}
            <div
              style={{
                padding: "14px 28px",
                borderBottom: "1px solid #f5ede6",
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              {displayEmail(selected) && (
                <a
                  href={`mailto:${displayEmail(selected)}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                  }}
                >
                  <Mail size={12} color="#c2884a" />
                  <span
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 12,
                      color: "#3d2010",
                    }}
                  >
                    {displayEmail(selected)}
                  </span>
                </a>
              )}
              {displayPhone(selected) && (
                <a
                  href={`tel:${displayPhone(selected)}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                  }}
                >
                  <Phone size={12} color="#c2884a" />
                  <span
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 12,
                      color: "#3d2010",
                    }}
                  >
                    {displayPhone(selected)}
                  </span>
                </a>
              )}
              {selected.property?.location && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Building2 size={12} color="#c2884a" />
                  <span
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 12,
                      color: "#3d2010",
                    }}
                  >
                    {selected.property.location}
                  </span>
                </div>
              )}
            </div>

            {/* Message */}
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid #f5ede6",
              }}
            >
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 11,
                  color: "#c2884a",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Message
              </p>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 13,
                  color: "#3d2010",
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                {selected.message}
              </p>
            </div>

            {/* Previous replies */}
            {selected.replies?.length > 0 && (
              <div
                style={{
                  padding: "16px 28px",
                  borderBottom: "1px solid #f5ede6",
                  background: "#fdf8f3",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 11,
                    color: "#c2884a",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Replies ({selected.replies.length})
                </p>
                {selected.replies.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 12,
                      paddingLeft: 12,
                      borderLeft: "2px solid #c2884a",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 11,
                        color: "#9a7c5a",
                        marginBottom: 4,
                      }}
                    >
                      {r.repliedBy?.firstName} {r.repliedBy?.lastName}{" "}
                      &nbsp;·&nbsp; {fmt(r.repliedAt)} &nbsp;·&nbsp;
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          padding: "1px 6px",
                          borderRadius: 4,
                          fontSize: 10,
                        }}
                      >
                        {r.channel}
                      </span>
                    </p>
                    <p
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 13,
                        color: "#3d2010",
                        lineHeight: 1.7,
                        margin: 0,
                      }}
                    >
                      {r.body}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply area */}
            <div style={{ padding: "20px 28px" }}>
              <textarea
                ref={replyRef}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Type your reply… (will be emailed to the customer)"
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1.5px solid #f0e6d8",
                  background: "#fdf8f3",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 13,
                  color: "#1a0f00",
                  outline: "none",
                  resize: "none",
                  boxSizing: "border-box",
                  lineHeight: 1.6,
                  transition: "border 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
                onBlur={(e) => (e.target.style.borderColor = "#f0e6d8")}
              />

              {replyError && (
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 12,
                    color: "#dc2626",
                    marginTop: 6,
                  }}
                >
                  {replyError}
                </p>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  onClick={handleReply}
                  disabled={replying || !replyBody.trim()}
                  style={{
                    flex: 1,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "11px",
                    borderRadius: 12,
                    border: "none",
                    background: replyDone
                      ? "linear-gradient(135deg,#22c55e,#16a34a)"
                      : "linear-gradient(135deg,#7B2D8B,#4A1060)",
                    color: "#fff",
                    cursor:
                      replying || !replyBody.trim() ? "not-allowed" : "pointer",
                    opacity: !replyBody.trim() ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "background 0.3s",
                  }}
                >
                  {replying ? (
                    <>
                      <Loader2
                        size={13}
                        style={{ animation: "spin 1s linear infinite" }}
                      />{" "}
                      Sending…
                    </>
                  ) : replyDone ? (
                    <>
                      <Check size={13} /> Sent!
                    </>
                  ) : (
                    <>
                      <MessageSquare size={13} /> Send Reply
                    </>
                  )}
                </button>

                {displayPhone(selected) && (
                  <a
                    href={`tel:${displayPhone(selected)}`}
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 12,
                      fontWeight: 500,
                      padding: "11px 18px",
                      borderRadius: 12,
                      border: "1.5px solid #f0e6d8",
                      background: "transparent",
                      color: "#9a8070",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      textDecoration: "none",
                    }}
                  >
                    <Phone size={13} /> Call
                  </a>
                )}

                {selected.status !== "archived" && (
                  <button
                    onClick={handleArchive}
                    disabled={archiving}
                    title="Archive"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 12,
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: "1.5px solid #f0e6d8",
                      background: "transparent",
                      color: "#9a8070",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <ArchiveX size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #f0e6d8",
              padding: "80px 40px",
              textAlign: "center",
            }}
          >
            <MessageSquare
              size={32}
              color="#e8ddd2"
              strokeWidth={1}
              style={{ marginBottom: 16 }}
            />
            <p style={{ fontFamily: "'Jost', sans-serif", color: "#c8b09a" }}>
              Select an inquiry to view details
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
