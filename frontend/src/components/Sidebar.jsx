import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Bell,
  PlusSquare,
  Settings,
  User,
  Layers,
  Cpu,
  ChevronRight,
  LogOut,
  Home,
} from "lucide-react";

if (!document.querySelector("#slendor-fonts")) {
  const l = document.createElement("link");
  l.id = "slendor-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "properties", label: "Properties", icon: Layers },
  { id: "add-property", label: "Add Property", icon: PlusSquare },
  { id: "orders", label: "Orders", icon: ShoppingBag, badge: 4 },
  { id: "inquiries", label: "Inquiries", icon: Bell, badge: 11 },
];

const bottomItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed,
}) {
  const [hovered, setHovered] = useState(null);

  const NavButton = ({ item, active }) => {
    const Icon = item.icon;
    const isHovered = hovered === item.id;

    return (
      <button
        onClick={() => setActivePage(item.id)}
        onMouseEnter={() => setHovered(item.id)}
        onMouseLeave={() => setHovered(null)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 13,
          justifyContent: collapsed ? "center" : "flex-start",
          width: "100%",
          padding: collapsed ? "13px" : "12px 16px",
          borderRadius: 14,
          border: "none",
          background: active
            ? "linear-gradient(135deg, #7B2D8B22, #4A106018)"
            : isHovered
              ? "rgba(123,45,139,0.07)"
              : "transparent",
          cursor: "pointer",
          transition: "all 0.2s ease",
          position: "relative",
          outline: active ? "1.5px solid rgba(123,45,139,0.2)" : "none",
        }}
        title={collapsed ? item.label : undefined}
      >
        {/* Active indicator bar */}
        {active && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: 24,
              borderRadius: 99,
              background: "linear-gradient(180deg, #7B2D8B, #4A1060)",
            }}
          />
        )}

        <div style={{ position: "relative", flexShrink: 0 }}>
          <Icon
            size={18}
            strokeWidth={active ? 2.2 : 1.7}
            color={active ? "#7B2D8B" : isHovered ? "#7B2D8B" : "#9a8070"}
            style={{ transition: "all 0.2s" }}
          />
          {item.badge && collapsed && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
                color: "#fff",
                fontSize: 8,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {item.badge > 9 ? "9+" : item.badge}
            </span>
          )}
        </div>

        {!collapsed && (
          <>
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                color: active ? "#1a0f00" : isHovered ? "#3d2010" : "#7a6555",
                flex: 1,
                textAlign: "left",
                transition: "color 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </span>
            {item.badge && (
              <span
                style={{
                  background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 99,
                  fontFamily: "'Jost', sans-serif",
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <aside
      style={{
        width: collapsed ? 72 : 248,
        minHeight: "100vh",
        background: "#fdf8f3",
        borderRight: "1.5px solid #f0e6d8",
        display: "flex",
        flexDirection: "column",
        padding: "24px 12px",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        position: "relative",
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: collapsed ? "0 4px 28px" : "0 6px 28px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid #f0e6d8",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Home size={17} color="#fff" strokeWidth={2} />
        </div>
        {!collapsed && (
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 19,
                fontWeight: 700,
                color: "#1a0f00",
                lineHeight: 1,
              }}
            >
              Slendor
            </div>
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 9,
                color: "#b45309",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Real Estate
            </div>
          </div>
        )}
      </div>

      {/* Main nav */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}
      >
        {!collapsed && (
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 10,
              fontWeight: 500,
              color: "#c8b09a",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "0 8px",
              marginBottom: 6,
            }}
          >
            Main
          </span>
        )}
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activePage === item.id}
          />
        ))}

        <div style={{ height: 1, background: "#f0e6d8", margin: "12px 0" }} />

        {!collapsed && (
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 10,
              fontWeight: 500,
              color: "#c8b09a",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "0 8px",
              marginBottom: 6,
            }}
          >
            Account
          </span>
        )}
        {bottomItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activePage === item.id}
          />
        ))}
      </div>

      {/* Collapse toggle + logout */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1.5px solid #f0e6d8",
            background: "transparent",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5ede4")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <ChevronRight
            size={15}
            color="#9a8070"
            style={{
              transition: "transform 0.3s",
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
            }}
          />
          {!collapsed && (
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                color: "#9a8070",
                fontWeight: 400,
              }}
            >
              Collapse
            </span>
          )}
        </button>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 12,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fff0ed")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <LogOut size={15} color="#e57373" />
          {!collapsed && (
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                color: "#e57373",
                fontWeight: 400,
              }}
            >
              Sign Out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
