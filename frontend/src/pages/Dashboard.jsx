import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardPage from "../components/DashboardPage";
import OrdersPage from "../components/OrdersPage";
import InquiriesPage from "../components/InquiriesPage";
import AddPropertyPage from "../components/AddPropertyPage";
import AnalyticsPage from "../components/AnalyticsPage";
import Properties from "../components/Properties";

import ProfilePage from "../components/ProfilePage";
import SettingsPage from "../components/SettingsPage";

if (!document.querySelector("#slendor-fonts")) {
  const l = document.createElement("link");
  l.id = "slendor-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

const pageMap = {
  dashboard: DashboardPage,
  orders: OrdersPage,
  inquiries: InquiriesPage,
  "add-property": AddPropertyPage,
  properties: Properties,

  profile: ProfilePage,
  settings: SettingsPage,
};

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const PageComponent = pageMap[activePage] || DashboardPage;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#fdf8f3",
        fontFamily: "'Jost', sans-serif",
      }}
    >
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #fdf8f3; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e8ddd2; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #c2884a; }

        @media (max-width: 768px) {
          .slendor-main { padding: 20px 16px !important; }
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main content */}
      <main
        className="slendor-main"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          minWidth: 0,
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <PageComponent setActivePage={setActivePage} />
      </main>
    </div>
  );
}
