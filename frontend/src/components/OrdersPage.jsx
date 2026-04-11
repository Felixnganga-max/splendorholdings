import { useState } from "react";
import { Search, Filter, Home, Clock, ChevronDown, Eye } from "lucide-react";

const allOrders = [
  {
    id: "ORD-0041",
    property: "Amalia Springs",
    location: "Kiamiti Road, Nairobi",
    buyer: "James Mwangi",
    email: "james.mwangi@email.com",
    price: "KES 24.5M",
    type: "Villa",
    status: "Under Review",
    statusColor: "#b45309",
    statusBg: "#fef3c7",
    date: "Apr 12, 2026",
    time: "2h ago",
  },
  {
    id: "ORD-0040",
    property: "Shangrila Villa",
    location: "Ongata Rongai, Kajiado",
    buyer: "Aisha Kamau",
    email: "aisha.k@email.com",
    price: "KES 20M",
    type: "Villa",
    status: "Approved",
    statusColor: "#0d6e5e",
    statusBg: "#d1fae5",
    date: "Apr 12, 2026",
    time: "5h ago",
  },
  {
    id: "ORD-0039",
    property: "Grosvenor",
    location: "Westlands, Nairobi",
    buyer: "Peter Ochieng",
    email: "p.ochieng@email.com",
    price: "KES 8.8M",
    type: "Apartment",
    status: "Pending",
    statusColor: "#1d4ed8",
    statusBg: "#eff6ff",
    date: "Apr 11, 2026",
    time: "1d ago",
  },
  {
    id: "ORD-0038",
    property: "Forest Hill",
    location: "Ngong, Kajiado",
    buyer: "Grace Njeri",
    email: "grace.njeri@email.com",
    price: "KES 15M",
    type: "Townhouse",
    status: "Completed",
    statusColor: "#6b7280",
    statusBg: "#f3f4f6",
    date: "Apr 10, 2026",
    time: "2d ago",
  },
  {
    id: "ORD-0037",
    property: "Palm Court",
    location: "Ruguima, Kenya",
    buyer: "Samuel Kiptoo",
    email: "s.kiptoo@email.com",
    price: "KES 22M",
    type: "Townhouse",
    status: "Pending",
    statusColor: "#1d4ed8",
    statusBg: "#eff6ff",
    date: "Apr 9, 2026",
    time: "3d ago",
  },
  {
    id: "ORD-0036",
    property: "Diamond Ivy",
    location: "Kileleahwa, Nairobi",
    buyer: "Fatuma Ali",
    email: "fatuma.ali@email.com",
    price: "KES 6.8M",
    type: "Apartment",
    status: "Completed",
    statusColor: "#6b7280",
    statusBg: "#f3f4f6",
    date: "Apr 8, 2026",
    time: "4d ago",
  },
];

const statusFilters = [
  "All",
  "Pending",
  "Under Review",
  "Approved",
  "Completed",
];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = allOrders.filter((o) => {
    const matchSearch =
      o.property.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
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
          Management
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            fontWeight: 700,
            color: "#1a0f00",
          }}
        >
          Purchase Orders
        </h1>
      </div>

      {/* Filters bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 28,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div
          style={{
            flex: 1,
            minWidth: 220,
            position: "relative",
          }}
        >
          <Search
            size={14}
            color="#c2884a"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, buyers, properties…"
            style={{
              width: "100%",
              padding: "11px 14px 11px 38px",
              borderRadius: 12,
              border: "1.5px solid #f0e6d8",
              background: "#fff",
              fontFamily: "'Jost', sans-serif",
              fontSize: 13,
              color: "#1a0f00",
              outline: "none",
              boxSizing: "border-box",
              transition: "border 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
            onBlur={(e) => (e.target.style.borderColor = "#f0e6d8")}
          />
        </div>

        {/* Status filter pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                fontWeight: statusFilter === s ? 600 : 400,
                padding: "9px 16px",
                borderRadius: 99,
                border: statusFilter === s ? "none" : "1.5px solid #e8ddd2",
                background:
                  statusFilter === s
                    ? "linear-gradient(135deg, #7B2D8B, #4A1060)"
                    : "#fff",
                color: statusFilter === s ? "#fff" : "#7a6555",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          border: "1.5px solid #f0e6d8",
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px",
            padding: "14px 24px",
            background: "#fdf8f3",
            borderBottom: "1px solid #f0e6d8",
          }}
        >
          {["Property", "Buyer", "Price", "Status", ""].map((h) => (
            <span
              key={h}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 10,
                fontWeight: 500,
                color: "#b8a090",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              fontFamily: "'Jost', sans-serif",
              color: "#c8b09a",
            }}
          >
            No orders match your search.
          </div>
        ) : (
          filtered.map((order, i) => (
            <div
              key={order.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px",
                padding: "18px 24px",
                borderBottom:
                  i < filtered.length - 1 ? "1px solid #fdf4ec" : "none",
                alignItems: "center",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#fdf8f3")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
              onClick={() =>
                setSelected(selected?.id === order.id ? null : order)
              }
            >
              {/* Property */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #f5ede6, #ede0d4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Home size={14} color="#c2884a" strokeWidth={1.8} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1a0f00",
                      marginBottom: 2,
                    }}
                  >
                    {order.property}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 11,
                      color: "#9a8070",
                    }}
                  >
                    {order.id} · {order.type}
                  </div>
                </div>
              </div>

              {/* Buyer */}
              <div>
                <div
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 13,
                    color: "#1a0f00",
                    fontWeight: 500,
                    marginBottom: 2,
                  }}
                >
                  {order.buyer}
                </div>
                <div
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 11,
                    color: "#9a8070",
                  }}
                >
                  {order.email}
                </div>
              </div>

              {/* Price */}
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1a0f00",
                }}
              >
                {order.price}
              </div>

              {/* Status */}
              <div>
                <span
                  style={{
                    background: order.statusBg,
                    color: order.statusColor,
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 99,
                    fontFamily: "'Jost', sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  {order.status}
                </span>
                <div
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 10,
                    color: "#b8a090",
                    marginTop: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Clock size={9} />
                  {order.time}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1.5px solid #f0e6d8",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    e.currentTarget.style.borderColor = "#7B2D8B";
                    e.currentTarget.style.background = "#7B2D8B10";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#f0e6d8";
                    e.currentTarget.style.background = "#fff";
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(selected?.id === order.id ? null : order);
                  }}
                >
                  <Eye size={13} color="#7B2D8B" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div
          style={{
            marginTop: 24,
            background: "#fff",
            borderRadius: 20,
            border: "1.5px solid #f0e6d8",
            padding: "28px 32px",
            animation: "slideUp 0.2s ease",
          }}
        >
          <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 24,
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#1a0f00",
                  marginBottom: 4,
                }}
              >
                {selected.property}
              </h3>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 12,
                  color: "#9a8070",
                }}
              >
                {selected.id} · {selected.location}
              </p>
            </div>
            <span
              style={{
                background: selected.statusBg,
                color: selected.statusColor,
                fontSize: 11,
                fontWeight: 600,
                padding: "5px 14px",
                borderRadius: 99,
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {selected.status}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
            }}
          >
            {[
              { label: "Buyer", value: selected.buyer },
              { label: "Email", value: selected.email },
              { label: "Listed Price", value: selected.price },
              { label: "Property Type", value: selected.type },
              { label: "Order Date", value: selected.date },
            ].map((d) => (
              <div
                key={d.label}
                style={{
                  padding: "14px 18px",
                  background: "#fdf8f3",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 10,
                    color: "#b8a090",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {d.label}
                </div>
                <div
                  style={{
                    fontFamily:
                      d.label === "Listed Price"
                        ? "'Cormorant Garamond', serif"
                        : "'Jost', sans-serif",
                    fontSize: d.label === "Listed Price" ? 18 : 13,
                    fontWeight: 600,
                    color: "#1a0f00",
                  }}
                >
                  {d.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {["Approve", "Request Info", "Decline"].map((action, i) => (
              <button
                key={action}
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "10px 20px",
                  borderRadius: 99,
                  border: i === 2 ? "1.5px solid #fca5a5" : "none",
                  background:
                    i === 0
                      ? "linear-gradient(135deg, #7B2D8B, #4A1060)"
                      : i === 1
                        ? "#fdf8f3"
                        : "transparent",
                  color: i === 0 ? "#fff" : i === 1 ? "#7a6555" : "#dc2626",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "all 0.2s",
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
