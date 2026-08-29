import React from "react";
import { BRASS, GUNMETAL_2, FONT_DISPLAY, FONT_MONO } from "../theme";

export function Eyebrow({ children }) {
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 11,
        letterSpacing: "0.14em",
        color: BRASS,
        fontWeight: 700,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

export function RoadDivider() {
  return (
    <svg width="100%" height="14" viewBox="0 0 300 14" preserveAspectRatio="none" style={{ display: "block" }}>
      <line x1="0" y1="7" x2="300" y2="7" stroke={GUNMETAL_2} strokeWidth="2" />
      <line x1="0" y1="7" x2="300" y2="7" stroke={BRASS} strokeWidth="2" strokeDasharray="10 8" />
    </svg>
  );
}

export function Screen({ title, subtitle, children }) {
  return (
    <div style={{ padding: "20px 18px 90px" }}>
      <Eyebrow>{subtitle}</Eyebrow>
      <h1
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 26,
          color: "#f2f0ea",
          margin: "0 0 16px",
          textTransform: "uppercase",
          letterSpacing: "0.01em",
        }}
      >
        {title}
      </h1>
      {children}
    </div>
  );
}

export function LoadingRow({ label = "Loading…" }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#5a5d63", padding: "20px 0" }}>
      {label}
    </div>
  );
}

export function ErrorRow({ message }) {
  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        color: "#e0a0a0",
        background: "rgba(164,36,43,0.12)",
        border: "1px solid rgba(164,36,43,0.4)",
        borderRadius: 4,
        padding: "10px 12px",
        marginBottom: 12,
      }}
    >
      {message}
    </div>
  );
}
