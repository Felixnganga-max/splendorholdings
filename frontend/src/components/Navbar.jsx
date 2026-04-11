import { MapPin, Mail, Phone, Building2 } from "lucide-react";
import React from "react";

export default function Navbar() {
  return (
    <div className="w-full font-sans">
      {/* ── TOP BAR ── */}
      <div className="bg-black text-white text-sm py-2 px-6 flex items-center gap-8">
        <span className="flex items-center gap-2">
          <MapPin size={14} strokeWidth={1.8} />
          14 Riverside Drive, Westlands, Nairobi
        </span>
        <span className="flex items-center gap-2">
          <Mail size={14} strokeWidth={1.8} />
          info@slendorholdings.com
        </span>
        <span className="flex items-center gap-2">
          <Phone size={14} strokeWidth={1.8} />
          +254 700 123 456
        </span>
      </div>

      {/* ── MAIN NAV ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-8 py-4 max-w-screen-2xl mx-auto">
          {/* LEFT LINKS */}
          <nav className="flex items-center gap-8 text-[13.5px] tracking-wide text-gray-700 font-medium uppercase">
            <a
              href="#"
              className="hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Our Properties
            </a>
            <a
              href="#"
              className="hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Buy &amp; Sell
            </a>
            <a
              href="#"
              className="hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Rentals
            </a>
            <a
              href="#"
              className="hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Off-Plan Projects
            </a>
          </nav>

          {/* CENTER LOGO */}
          <div className="flex flex-col items-center flex-shrink-0 mx-10 select-none">
            {/* Stylised building mark — mirrors Mira Heights tower motif */}
            <svg
              width="48"
              height="52"
              viewBox="0 0 48 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-1"
            >
              {/* Main tower */}
              <rect x="20" y="6" width="8" height="44" fill="#1a1a1a" />
              {/* Left wing */}
              <rect
                x="10"
                y="16"
                width="10"
                height="34"
                fill="#1a1a1a"
                opacity="0.75"
              />
              {/* Right wing */}
              <rect
                x="28"
                y="16"
                width="10"
                height="34"
                fill="#1a1a1a"
                opacity="0.75"
              />
              {/* Far left accent */}
              <rect
                x="3"
                y="26"
                width="7"
                height="24"
                fill="#1a1a1a"
                opacity="0.45"
              />
              {/* Far right accent */}
              <rect
                x="38"
                y="26"
                width="7"
                height="24"
                fill="#1a1a1a"
                opacity="0.45"
              />
              {/* Spire */}
              <rect x="23" y="0" width="2" height="8" fill="#1a1a1a" />
            </svg>

            <span
              className="text-[15px] font-bold tracking-[0.25em] uppercase text-gray-900 leading-none"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                letterSpacing: "0.22em",
              }}
            >
              Slendor Holdings
            </span>
            <span className="text-[8.5px] tracking-[0.35em] uppercase text-gray-500 mt-[3px]">
              — Real Estate &amp; Investments —
            </span>
          </div>

          {/* RIGHT LINKS */}
          <nav className="flex items-center gap-8 text-[13.5px] tracking-wide text-gray-700 font-medium uppercase">
            <a
              href="#"
              className="hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Property Management
            </a>
            <a
              href="#"
              className="hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Investment Advisory
            </a>
            <a
              href="#"
              className="hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Valuations
            </a>
            <a
              href="#"
              className="hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Contact Us
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}
