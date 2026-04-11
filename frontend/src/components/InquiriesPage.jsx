import { useState } from "react";
import {
  Search,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  ChevronRight,
} from "lucide-react";

const inquiries = [
  {
    id: "INQ-0091",
    name: "Miriam Wanjiku",
    email: "miriam.w@gmail.com",
    phone: "+254 712 345 678",
    property: "Amalia Springs",
    message:
      "I am very interested in this property. Could we schedule a viewing this weekend? I am available Saturday afternoon or Sunday morning.",
    time: "10 min ago",
    date: "Apr 12, 2026",
    type: "Viewing Request",
    typeColor: "#7B2D8B",
    typeBg: "#f3e8ff",
    read: false,
  },
  {
    id: "INQ-0090",
    name: "David Kariuki",
    email: "dkariuki@outlook.com",
    phone: "+254 720 987 654",
    property: "143 Brookview",
    message:
      "What is the final price for this property? Is there any room for negotiation? Also, what are the payment terms?",
    time: "45 min ago",
    date: "Apr 12, 2026",
    type: "Price Inquiry",
    typeColor: "#b45309",
    typeBg: "#fef3c7",
    read: false,
  },
  {
    id: "INQ-0089",
    name: "Lucy Auma",
    email: "l.auma@company.co.ke",
    phone: "+254 733 456 789",
    property: "Laika Residences",
    message:
      "Is this property still available? I would like to place an offer. Please get back to me as soon as possible.",
    time: "2h ago",
    date: "Apr 12, 2026",
    type: "Offer Intent",
    typeColor: "#0d6e5e",
    typeBg: "#d1fae5",
    read: false,
  },
  {
    id: "INQ-0088",
    name: "Brian Mutua",
    email: "bmutua@mail.com",
    phone: "+254 700 111 222",
    property: "Shangrila Villa",
    message:
      "Can you send more photos and details about the compound size and parking?",
    time: "4h ago",
    date: "Apr 12, 2026",
    type: "Information",
    typeColor: "#1d4ed8",
    typeBg: "#eff6ff",
    read: true,
  },
  {
    id: "INQ-0087",
    name: "Naomi Chebet",
    email: "nchebet@email.co.ke",
    phone: "+254 711 999 000",
    property: "Grosvenor",
    message:
      "Is this apartment pet-friendly? What is the service charge per month?",
    time: "6h ago",
    date: "Apr 12, 2026",
    type: "Information",
    typeColor: "#1d4ed8",
    typeBg: "#eff6ff",
    read: true,
  },
  {
    id: "INQ-0086",
    name: "Hassan Omar",
    email: "hassan.omar@email.com",
    phone: "+254 722 333 555",
    property: "Forest Hill",
    message:
      "I saw your listing on the website. I would like to arrange a site visit. I am a cash buyer.",
    time: "1d ago",
    date: "Apr 11, 2026",
    type: "Viewing Request",
    typeColor: "#7B2D8B",
    typeBg: "#f3e8ff",
    read: true,
  },
];

const typeFilters = [
  "All",
  "Viewing Request",
  "Price Inquiry",
  "Offer Intent",
  "Information",
];

export default function InquiriesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState(inquiries[0]);
  const [readIds, setReadIds] = useState(
    new Set(inquiries.filter((i) => i.read).map((i) => i.id)),
  );

  const filtered = inquiries.filter((inq) => {
    const matchSearch =
      inq.name.toLowerCase().includes(search.toLowerCase()) ||
      inq.property.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || inq.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleSelect = (inq) => {
    setSelected(inq);
    setReadIds((prev) => new Set([...prev, inq.id]));
  };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
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
          Buyer Activity
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            fontWeight: 700,
            color: "#1a0f00",
          }}
        >
          Inquiries
          <span
            style={{
              marginLeft: 12,
              background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              padding: "2px 10px",
              borderRadius: 99,
              fontFamily: "'Jost', sans-serif",
              verticalAlign: "middle",
            }}
          >
            {inquiries.filter((i) => !readIds.has(i.id)).length} new
          </span>
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.3fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Inbox list */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1.5px solid #f0e6d8",
            overflow: "hidden",
          }}
        >
          {/* Search + filter */}
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
                placeholder="Search inquiries…"
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
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {typeFilters.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 10,
                    fontWeight: typeFilter === t ? 600 : 400,
                    padding: "5px 10px",
                    borderRadius: 99,
                    border: typeFilter === t ? "none" : "1px solid #e8ddd2",
                    background:
                      typeFilter === t
                        ? "linear-gradient(135deg, #7B2D8B, #4A1060)"
                        : "transparent",
                    color: typeFilter === t ? "#fff" : "#9a8070",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Inbox rows */}
          <div style={{ maxHeight: 520, overflowY: "auto" }}>
            {filtered.map((inq) => {
              const isRead = readIds.has(inq.id);
              const isActive = selected?.id === inq.id;
              return (
                <div
                  key={inq.id}
                  onClick={() => handleSelect(inq)}
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
                    if (!isActive) e.currentTarget.style.background = "#fdf8f3";
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
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      {!isRead && (
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
                          fontWeight: isRead ? 400 : 600,
                          color: "#1a0f00",
                        }}
                      >
                        {inq.name}
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
                      {inq.time}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 11,
                      color: "#7B2D8B",
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {inq.property}
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
            })}
          </div>
        </div>

        {/* Detail pane */}
        {selected ? (
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
            {/* Header */}
            <div
              style={{
                padding: "24px 28px",
                borderBottom: "1px solid #f5ede6",
                background: "linear-gradient(135deg, #fdf8f3, #fff)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #7B2D8B22, #4A106018)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontFamily: "'Cormorant Garamond', serif",
                    color: "#7B2D8B",
                    fontWeight: 700,
                  }}
                >
                  {selected.name[0]}
                </div>
                <span
                  style={{
                    background: selected.typeBg,
                    color: selected.typeColor,
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 99,
                    fontFamily: "'Jost', sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  {selected.type}
                </span>
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
                {selected.name}
              </h3>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 11,
                  color: "#9a8070",
                }}
              >
                Re: {selected.property} · {selected.date}
              </p>
            </div>

            {/* Contact info */}
            <div
              style={{
                padding: "16px 28px",
                borderBottom: "1px solid #f5ede6",
                display: "flex",
                gap: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Mail size={12} color="#c2884a" />
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 12,
                    color: "#3d2010",
                  }}
                >
                  {selected.email}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Phone size={12} color="#c2884a" />
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 12,
                    color: "#3d2010",
                  }}
                >
                  {selected.phone}
                </span>
              </div>
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
                  fontSize: 13,
                  color: "#3d2010",
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                {selected.message}
              </p>
            </div>

            {/* Reply area */}
            <div style={{ padding: "20px 28px" }}>
              <textarea
                placeholder="Type your reply…"
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
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  style={{
                    flex: 1,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "11px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
                    color: "#fff",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <MessageSquare size={13} />
                  Send Reply
                </button>
                <button
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
                  }}
                >
                  <Phone size={13} />
                  Call
                </button>
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
    </div>
  );
}
