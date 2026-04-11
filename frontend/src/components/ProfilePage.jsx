import { useState } from "react";
import { Camera, Mail, Phone, MapPin, Globe, CheckCircle } from "lucide-react";

const Field = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
}) => (
  <div>
    <label
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: 11,
        fontWeight: 500,
        color: "#b8a090",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        display: "block",
        marginBottom: 8,
      }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      {Icon && (
        <Icon
          size={14}
          color="#c2884a"
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: Icon ? "12px 14px 12px 38px" : "12px 14px",
          borderRadius: 12,
          border: "1.5px solid #f0e6d8",
          background: "#fdf8f3",
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
  </div>
);

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: "Admin",
    lastName: "Slendor",
    email: "admin@slendor.co.ke",
    phone: "+254 700 000 001",
    location: "Nairobi, Kenya",
    website: "www.slendor.co.ke",
    bio: "Real estate professional specialising in premium residential and commercial properties across Nairobi and greater Kenya.",
    role: "Super Admin",
  });
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => setProfile((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 860, margin: "0 auto" }}>
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
          Your Profile
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
            Profile updated successfully.
          </span>
        </div>
      )}

      <div
        style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}
      >
        {/* Avatar card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #f0e6d8",
              padding: "32px 24px",
              textAlign: "center",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                position: "relative",
                display: "inline-block",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 auto",
                }}
              >
                {profile.firstName[0]}
                {profile.lastName[0]}
              </div>
              <button
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "2px solid #f0e6d8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Camera size={12} color="#7B2D8B" />
              </button>
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
              {profile.firstName} {profile.lastName}
            </h3>
            <span
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #7B2D8B22, #4A106018)",
                color: "#7B2D8B",
                fontSize: 10,
                fontWeight: 600,
                padding: "3px 12px",
                borderRadius: 99,
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              {profile.role}
            </span>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                textAlign: "left",
              }}
            >
              {[
                { icon: Mail, val: profile.email },
                { icon: Phone, val: profile.phone },
                { icon: MapPin, val: profile.location },
              ].map(({ icon: Icon, val }) => (
                <div
                  key={val}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <Icon size={12} color="#c2884a" strokeWidth={1.8} />
                  <span
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 12,
                      color: "#7a6555",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #f0e6d8",
              padding: "20px 24px",
            }}
          >
            <h4
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#1a0f00",
                marginBottom: 16,
              }}
            >
              Activity
            </h4>
            {[
              { label: "Properties Listed", val: "9" },
              { label: "Orders Processed", val: "41" },
              { label: "Inquiries Handled", val: "91" },
              { label: "Member Since", val: "Jan 2025" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #fdf4ec",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 12,
                    color: "#9a8070",
                  }}
                >
                  {s.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1a0f00",
                  }}
                >
                  {s.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit form */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1.5px solid #f0e6d8",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: 22,
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
            Edit Information
          </h3>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <Field
              label="First Name"
              value={profile.firstName}
              onChange={set("firstName")}
            />
            <Field
              label="Last Name"
              value={profile.lastName}
              onChange={set("lastName")}
            />
          </div>

          <Field
            label="Email"
            icon={Mail}
            value={profile.email}
            onChange={set("email")}
            type="email"
          />
          <Field
            label="Phone"
            icon={Phone}
            value={profile.phone}
            onChange={set("phone")}
          />
          <Field
            label="Location"
            icon={MapPin}
            value={profile.location}
            onChange={set("location")}
          />
          <Field
            label="Website"
            icon={Globe}
            value={profile.website}
            onChange={set("website")}
          />

          <div>
            <label
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                color: "#b8a090",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 8,
              }}
            >
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={set("bio")}
              rows={4}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid #f0e6d8",
                background: "#fdf8f3",
                fontFamily: "'Jost', sans-serif",
                fontSize: 13,
                color: "#1a0f00",
                outline: "none",
                boxSizing: "border-box",
                resize: "vertical",
                lineHeight: 1.7,
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#c2884a")}
              onBlur={(e) => (e.target.style.borderColor = "#f0e6d8")}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                padding: "11px 22px",
                borderRadius: 12,
                border: "1.5px solid #f0e6d8",
                background: "transparent",
                color: "#9a8070",
                cursor: "pointer",
              }}
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                padding: "11px 28px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #7B2D8B, #4A1060)",
                color: "#fff",
                cursor: "pointer",
                letterSpacing: "0.06em",
                boxShadow: "0 4px 16px rgba(123,45,139,0.25)",
                transition: "filter 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = "brightness(1.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.filter = "brightness(1)")
              }
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
