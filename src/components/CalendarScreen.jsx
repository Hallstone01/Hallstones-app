import React, { useState } from "react";
import { Calendar, Coffee, Flag } from "lucide-react";
import RidesScreen from "./RidesScreen";
import NatterScreen from "./NatterScreen";
import EventsScreen from "./EventsScreen";
import { GUNMETAL, GUNMETAL_2, BRASS, INK } from "../theme";

const SUB_TABS = [
  { key: "rides", label: "Rides", icon: Calendar },
  { key: "natter", label: "Natter", icon: Coffee },
  { key: "events", label: "Events", icon: Flag },
];

export default function CalendarScreen() {
  const [sub, setSub] = useState("rides");

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "16px 18px 0",
          position: "sticky",
          top: 0,
          zIndex: 5,
          background: "#0c0d0f",
        }}
      >
        {SUB_TABS.map((t) => {
          const Icon = t.icon;
          const active = sub === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setSub(t.key)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: active ? GUNMETAL : "transparent",
                border: `1px solid ${active ? BRASS : GUNMETAL_2}`,
                borderRadius: 4,
                padding: "8px 0",
                cursor: "pointer",
              }}
            >
              <Icon size={14} color={active ? BRASS : "#5a5d63"} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: active ? BRASS : "#5a5d63",
                }}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {sub === "rides" && <RidesScreen />}
      {sub === "natter" && <NatterScreen />}
      {sub === "events" && <EventsScreen />}
    </div>
  );
}
