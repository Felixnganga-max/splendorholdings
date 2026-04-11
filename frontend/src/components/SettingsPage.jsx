import { useState } from "react";
import {
  Bell,
  Shield,
  Palette,
  Globe,
  CheckCircle,
  Moon,
  Sun,
} from "lucide-react";

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: 44,
      height: 24,
      borderRadius: 99,
      border: "none",
      background: checked
        ? "linear-gradient(135deg, #7B2D8B, #4A1060)"
        : "#e8ddd2",
      cursor: "pointer",
      position: "relative",
      transition: "background 0.25s",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 3,
        left: checked ? 23 : 3,
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
      }}
    />
  </button>
);

const Section = ({ icon: Icon, title, children }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 20,
      border: "1.5px solid #f0e6d8",
      overflow: "hidden",
      marginBottom: 24,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "20px 28px",
        borderBottom: "1px solid #f5ede6",
        background: "#fdf8f3",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "linear-gradient(135deg, #7B2D8B18, #4A106008)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={16} color="#7B2D8B" strokeWidth={1.8} />
      </div>
      <h3
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 19,
          fontWeight: 700,
          color: "#1a0f00",
        }}
      >
        {title}
      </h3>
    </div>
    <div style={{ padding: "4px 0" }}>{children}</div>
  </div>
);

const SettingRow = ({ label, description, children }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "18px 28px",
      borderBottom: "1px solid #fdf4ec",
      gap: 20,
    }}
  >
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: "#1a0f00",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      {description && (
        <div
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 11,
            color: "#9a8070",
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      )}
    </div>
    {children}
  </div>
);

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailOrders: true,
    emailInquiries: true,
    emailMarketing: false,
    smsAlerts: true,
    twoFactor: false,
    publicProfile: true,
    darkMode: false,
    compactView: false,
    autoArchive: true,
    language: "English",
    currency: "KES",
    timezone: "Africa/Nairobi",
  });

  const [saved, setSaved] = useState(false);

  const toggle = (k) => setSettings((s) => ({ ...s, [k]: !s[k] }));
  const set = (k) => (e) => setSettings((s) => ({ ...s, [k]: e.target.value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const selectStyle = {
    padding: "9px 32px 9px 12px",
    borderRadius: 10,
    border: "1.5px solid #f0e6d8",
    background: "#fdf8f3",
    fontFamily: "'Jost', sans-serif",
    fontSize: 12,
    color: "#1a0f00",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c2884a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 820, margin: "0 auto" }}>
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
          Account
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            fontWeight: 700,
            color: "#1a0f00",
          }}
        >
          Settings
        </h1>
      </div>

      {saved && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#d1fae5",
            border: "1.5px solid #6ee7b7",
            borderRadius: 14,
            padding: "14px 20px",
            marginBottom: 24,
          }}
        >
          <CheckCircle size={16} color="#0d6e5e" />
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 13,
              color: "#0d6e5e",
              fontWeight: 500,
            }}
          >
            Settings saved.
          </span>
        </div>
      )}

      <Section icon={Bell} title="Notifications">
        <SettingRow
          label="Order Alerts"
          description="Get notified when a new purchase order is placed."
        >
          <Toggle
            checked={settings.emailOrders}
            onChange={() => toggle("emailOrders")}
          />
        </SettingRow>
        <SettingRow
          label="Inquiry Alerts"
          description="Receive email when a buyer sends an inquiry."
        >
          <Toggle
            checked={settings.emailInquiries}
            onChange={() => toggle("emailInquiries")}
          />
        </SettingRow>
        <SettingRow
          label="Marketing Emails"
          description="Promotions, tips, and product updates."
        >
          <Toggle
            checked={settings.emailMarketing}
            onChange={() => toggle("emailMarketing")}
          />
        </SettingRow>
        <SettingRow
          label="SMS Alerts"
          description="Receive critical alerts via SMS."
        >
          <Toggle
            checked={settings.smsAlerts}
            onChange={() => toggle("smsAlerts")}
          />
        </SettingRow>
      </Section>

      <Section icon={Shield} title="Security">
        <SettingRow
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account."
        >
          <Toggle
            checked={settings.twoFactor}
            onChange={() => toggle("twoFactor")}
          />
        </SettingRow>
        <SettingRow
          label="Public Profile"
          description="Allow your agent profile to be visible on the website."
        >
          <Toggle
            checked={settings.publicProfile}
            onChange={() => toggle("publicProfile")}
          />
        </SettingRow>
        <SettingRow label="Password" description="Last changed 3 months ago.">
          <button
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: 10,
              border: "1.5px solid #f0e6d8",
              background: "#fdf8f3",
              color: "#7B2D8B",
              cursor: "pointer",
            }}
          >
            Change
          </button>
        </SettingRow>
      </Section>

      <Section icon={Palette} title="Appearance">
        <SettingRow
          label="Dark Mode"
          description="Switch the dashboard to a dark theme."
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sun size={13} color={settings.darkMode ? "#b8a090" : "#F59E0B"} />
            <Toggle
              checked={settings.darkMode}
              onChange={() => toggle("darkMode")}
            />
            <Moon size={13} color={settings.darkMode ? "#7B2D8B" : "#b8a090"} />
          </div>
        </SettingRow>
        <SettingRow
          label="Compact View"
          description="Show more content with reduced spacing."
        >
          <Toggle
            checked={settings.compactView}
            onChange={() => toggle("compactView")}
          />
        </SettingRow>
        <SettingRow
          label="Auto-Archive Orders"
          description="Automatically archive completed orders after 30 days."
        >
          <Toggle
            checked={settings.autoArchive}
            onChange={() => toggle("autoArchive")}
          />
        </SettingRow>
      </Section>

      <Section icon={Globe} title="Localisation">
        <SettingRow label="Language">
          <select
            style={selectStyle}
            value={settings.language}
            onChange={set("language")}
          >
            <option>English</option>
            <option>Swahili</option>
            <option>French</option>
          </select>
        </SettingRow>
        <SettingRow label="Currency">
          <select
            style={selectStyle}
            value={settings.currency}
            onChange={set("currency")}
          >
            <option>KES</option>
            <option>USD</option>
            <option>GBP</option>
            <option>EUR</option>
          </select>
        </SettingRow>
        <SettingRow label="Timezone">
          <select
            style={selectStyle}
            value={settings.timezone}
            onChange={set("timezone")}
          >
            <option>Africa/Nairobi</option>
            <option>UTC</option>
            <option>Europe/London</option>
          </select>
        </SettingRow>
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 12,
            fontWeight: 500,
            padding: "12px 24px",
            borderRadius: 12,
            border: "1.5px solid #f0e6d8",
            background: "transparent",
            color: "#9a8070",
            cursor: "pointer",
          }}
        >
          Reset Defaults
        </button>
        <button
          onClick={handleSave}
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            padding: "12px 32px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
            color: "#fff",
            cursor: "pointer",
            letterSpacing: "0.06em",
            boxShadow: "0 4px 16px rgba(123,45,139,0.25)",
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
