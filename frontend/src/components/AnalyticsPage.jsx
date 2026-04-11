import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  BarChart2,
  ArrowUpRight,
} from "lucide-react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const viewData = [
  420, 680, 510, 870, 920, 1040, 980, 1120, 1350, 1200, 1480, 1240,
];
const revenueData = [
  8.2, 12.4, 9.8, 18.5, 15.2, 22.4, 19.8, 24.1, 28.4, 22.8, 31.2, 26.5,
];

const maxViews = Math.max(...viewData);
const maxRevenue = Math.max(...revenueData);

const sources = [
  { label: "Direct Search", pct: 42, color: "#7B2D8B" },
  { label: "Social Media", pct: 28, color: "#b45309" },
  { label: "Referral", pct: 18, color: "#0d6e5e" },
  { label: "Paid Ads", pct: 12, color: "#1d4ed8" },
];

const topAreas = [
  { area: "Westlands", listings: 3, avg: "KES 18.4M", trend: true },
  { area: "Ongata Rongai", listings: 2, avg: "KES 17.5M", trend: true },
  { area: "Ngong", listings: 2, avg: "KES 14.2M", trend: false },
  { area: "Kiambu", listings: 1, avg: "KES 4.7M", trend: true },
];

export default function AnalyticsPage() {
  const [chartType, setChartType] = useState("views");
  const data = chartType === "views" ? viewData : revenueData;
  const maxVal = chartType === "views" ? maxViews : maxRevenue;

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1100, margin: "0 auto" }}>
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
          Analytics Pro
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem,3vw,2.6rem)",
            fontWeight: 700,
            color: "#1a0f00",
          }}
        >
          Performance Insights
        </h1>
      </div>

      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[
          {
            label: "Total Views",
            value: "12,310",
            icon: Eye,
            change: "+18.4%",
            up: true,
            color: "#7B2D8B",
          },
          {
            label: "Unique Visitors",
            value: "4,872",
            icon: Users,
            change: "+9.2%",
            up: true,
            color: "#b45309",
          },
          {
            label: "Avg. Listing Time",
            value: "24 days",
            icon: BarChart2,
            change: "-3 days",
            up: true,
            color: "#0d6e5e",
          },
          {
            label: "Conversion Rate",
            value: "3.8%",
            icon: TrendingUp,
            change: "-0.4%",
            up: false,
            color: "#1d4ed8",
          },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              style={{
                background: "#fff",
                borderRadius: 18,
                border: "1.5px solid #f0e6d8",
                padding: "20px 22px",
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
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `${k.color}14`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={16} color={k.color} strokeWidth={1.8} />
                </div>
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 11,
                    color: k.up ? "#0d6e5e" : "#dc2626",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {k.up ? (
                    <ArrowUpRight size={11} />
                  ) : (
                    <TrendingDown size={11} />
                  )}{" "}
                  {k.change}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#1a0f00",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {k.value}
              </div>
              <div
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 11,
                  color: "#9a8070",
                }}
              >
                {k.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.8fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Bar chart */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1.5px solid #f0e6d8",
            padding: "24px 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
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
              {chartType === "views"
                ? "Monthly Views"
                : "Monthly Revenue (M KES)"}
            </h3>
            <div style={{ display: "flex", gap: 6 }}>
              {["views", "revenue"].map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 11,
                    fontWeight: chartType === t ? 600 : 400,
                    padding: "6px 14px",
                    borderRadius: 99,
                    border: chartType === t ? "none" : "1.5px solid #e8ddd2",
                    background:
                      chartType === t
                        ? "linear-gradient(135deg,#7B2D8B,#4A1060)"
                        : "transparent",
                    color: chartType === t ? "#fff" : "#7a6555",
                    cursor: "pointer",
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 10,
              height: 160,
            }}
          >
            {data.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${(v / maxVal) * 140}px`,
                    borderRadius: "6px 6px 2px 2px",
                    background:
                      i === new Date().getMonth()
                        ? "linear-gradient(180deg,#7B2D8B,#4A1060)"
                        : "linear-gradient(180deg,#e8d5f0,#f3e8ff)",
                    transition: "height 0.4s",
                    cursor: "default",
                  }}
                  title={`${months[i]}: ${v}${chartType === "revenue" ? "M" : ""}`}
                />
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 9,
                    color: "#b8a090",
                  }}
                >
                  {months[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic sources */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1.5px solid #f0e6d8",
            padding: "24px 24px",
          }}
        >
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#1a0f00",
              marginBottom: 20,
            }}
          >
            Traffic Sources
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sources.map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 12,
                      color: "#3d2010",
                      fontWeight: 500,
                    }}
                  >
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 12,
                      color: s.color,
                      fontWeight: 600,
                    }}
                  >
                    {s.pct}%
                  </span>
                </div>
                <div
                  style={{ height: 6, borderRadius: 99, background: "#f5ede6" }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${s.pct}%`,
                      borderRadius: 99,
                      background: s.color,
                      transition: "width 0.6s",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top areas */}
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
            padding: "20px 28px",
            borderBottom: "1px solid #f5ede6",
            background: "#fdf8f3",
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
            Top Performing Areas
          </h3>
        </div>
        {topAreas.map((a, i) => (
          <div
            key={a.area}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "18px 28px",
              borderBottom:
                i < topAreas.length - 1 ? "1px solid #fdf4ec" : "none",
              gap: 20,
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontWeight: 700,
                color: i === 0 ? "#F59E0B" : "#d9c8b8",
                width: 28,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1a0f00",
                  marginBottom: 3,
                }}
              >
                {a.area}
              </div>
              <div
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 11,
                  color: "#9a8070",
                }}
              >
                {a.listings} listings
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1a0f00",
                }}
              >
                {a.avg}
              </div>
              <div
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 11,
                  color: a.trend ? "#0d6e5e" : "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  justifyContent: "flex-end",
                }}
              >
                {a.trend ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                {a.trend ? "Rising" : "Cooling"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
