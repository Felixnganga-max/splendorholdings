import { useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Bell,
  Home,
  Eye,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Star,
  Clock,
} from "lucide-react";

const stats = [
  {
    label: "Total Revenue",
    value: "KES 284.5M",
    change: "+12.4%",
    up: true,
    icon: TrendingUp,
    color: "#7B2D8B",
    bg: "linear-gradient(135deg, #7B2D8B18, #4A106008)",
  },
  {
    label: "Active Orders",
    value: "4",
    change: "+2 this week",
    up: true,
    icon: ShoppingBag,
    color: "#b45309",
    bg: "linear-gradient(135deg, #b4530918, #92400e08)",
  },
  {
    label: "New Inquiries",
    value: "11",
    change: "+5 today",
    up: true,
    icon: Bell,
    color: "#0d6e5e",
    bg: "linear-gradient(135deg, #0d6e5e18, #06453a08)",
  },
  {
    label: "Listed Properties",
    value: "9",
    change: "3 featured",
    up: null,
    icon: Home,
    color: "#1d4ed8",
    bg: "linear-gradient(135deg, #1d4ed818, #1e3a8a08)",
  },
];

const recentOrders = [
  {
    id: "ORD-0041",
    property: "Amalia Springs",
    location: "Kiamiti Road, Nairobi",
    buyer: "James Mwangi",
    price: "KES 24.5M",
    status: "Under Review",
    statusColor: "#b45309",
    statusBg: "#fef3c7",
    time: "2h ago",
  },
  {
    id: "ORD-0040",
    property: "Shangrila Villa",
    location: "Ongata Rongai",
    buyer: "Aisha Kamau",
    price: "KES 20M",
    status: "Approved",
    statusColor: "#0d6e5e",
    statusBg: "#d1fae5",
    time: "5h ago",
  },
  {
    id: "ORD-0039",
    property: "Grosvenor",
    location: "Westlands, Nairobi",
    buyer: "Peter Ochieng",
    price: "KES 8.8M",
    status: "Pending",
    statusColor: "#1d4ed8",
    statusBg: "#eff6ff",
    time: "1d ago",
  },
  {
    id: "ORD-0038",
    property: "Forest Hill",
    location: "Ngong, Kajiado",
    buyer: "Grace Njeri",
    price: "KES 15M",
    status: "Completed",
    statusColor: "#6b7280",
    statusBg: "#f3f4f6",
    time: "2d ago",
  },
];

const topProperties = [
  { name: "Shangrila Villa", views: 1240, rating: 4.96, price: "KES 20M" },
  { name: "Amalia Springs", views: 980, rating: 4.95, price: "KES 24.5M" },
  { name: "143 Brookview", views: 871, rating: 4.92, price: "KES 33M" },
];

export default function DashboardPage({ setActivePage }) {
  return (
    <div style={{ padding: "36px 40px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
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
          Good Morning, Admin
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            fontWeight: 700,
            color: "#1a0f00",
            lineHeight: 1.1,
          }}
        >
          Dashboard Overview
        </h1>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 20,
          marginBottom: 36,
        }}
      >
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              style={{
                background: s.bg,
                border: "1.5px solid rgba(0,0,0,0.05)",
                borderRadius: 18,
                padding: "22px 24px",
                transition: "transform 0.25s, box-shadow 0.25s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(0,0,0,0.09)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `${s.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} color={s.color} strokeWidth={1.8} />
                </div>
                {s.up !== null && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: 11,
                      color: s.up ? "#0d6e5e" : "#dc2626",
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    <ArrowUpRight size={12} />
                    {s.change}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#1a0f00",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 12,
                  color: "#9a8070",
                  fontWeight: 400,
                }}
              >
                {s.label}
              </div>
              {s.up === null && (
                <div
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 11,
                    color: "#b45309",
                    marginTop: 4,
                  }}
                >
                  {s.change}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}
      >
        {/* Recent Orders */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1.5px solid #f0e6d8",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "22px 28px 18px",
              borderBottom: "1px solid #f5ede6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontWeight: 700,
                color: "#1a0f00",
              }}
            >
              Recent Orders
            </h3>
            <button
              onClick={() => setActivePage("orders")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                color: "#7B2D8B",
                fontWeight: 500,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div>
            {recentOrders.map((order, i) => (
              <div
                key={order.id}
                style={{
                  padding: "16px 28px",
                  borderBottom:
                    i < recentOrders.length - 1 ? "1px solid #fdf4ec" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fdf8f3")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #f5ede6, #ede0d4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Home size={15} color="#c2884a" strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1a0f00",
                      marginBottom: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
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
                    {order.buyer} · {order.id}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1a0f00",
                      marginBottom: 4,
                    }}
                  >
                    {order.price}
                  </div>
                  <span
                    style={{
                      background: order.statusBg,
                      color: order.statusColor,
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 99,
                      fontFamily: "'Jost', sans-serif",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Properties */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1.5px solid #f0e6d8",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "22px 24px 18px",
              borderBottom: "1px solid #f5ede6",
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontWeight: 700,
                color: "#1a0f00",
                marginBottom: 2,
              }}
            >
              Top Properties
            </h3>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 11,
                color: "#b8a090",
              }}
            >
              By views this month
            </p>
          </div>
          <div style={{ padding: "8px 0" }}>
            {topProperties.map((p, i) => (
              <div
                key={p.name}
                style={{
                  padding: "14px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fdf8f3")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: i === 0 ? "#F59E0B" : "#d9c8b8",
                    width: 28,
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1a0f00",
                      marginBottom: 4,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 11,
                        color: "#9a8070",
                      }}
                    >
                      <Eye size={10} color="#c2884a" />
                      {p.views.toLocaleString()}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 11,
                        color: "#9a8070",
                      }}
                    >
                      <Star size={10} fill="#F59E0B" color="#F59E0B" />
                      {p.rating}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#7B2D8B",
                  }}
                >
                  {p.price}
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div
            style={{
              margin: "12px 24px 20px",
              padding: 18,
              borderRadius: 14,
              background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 17,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 4,
              }}
            >
              Ready to list a new property?
            </p>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 11,
                color: "rgba(255,255,255,0.65)",
                marginBottom: 14,
              }}
            >
              Add it to your portfolio in minutes.
            </p>
            <button
              onClick={() => setActivePage("add-property")}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: "#7B2D8B",
                background: "#fff",
                border: "none",
                borderRadius: 99,
                padding: "8px 18px",
                cursor: "pointer",
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Add Property <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
