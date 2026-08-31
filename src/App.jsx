import React, { useState } from "react";
import { Home, CalendarDays, Image as ImageIcon, ShoppingBag, UserPlus } from "lucide-react";
import HomeScreen from "./components/HomeScreen";
import NewsScreen from "./components/NewsScreen";
import CalendarScreen from "./components/CalendarScreen";
import GalleryScreen from "./components/GalleryScreen";
import ShopScreen from "./components/ShopScreen";
import JoinScreen from "./components/JoinScreen";
import { LanguageProvider } from "./LanguageContext";
import { INK, GUNMETAL_2, BRASS } from "./theme";

const TABS = [
  { key: "home", label: "Home", icon: Home },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
  { key: "shop", label: "Shop", icon: ShoppingBag },
  { key: "join", label: "Join", icon: UserPlus },
];

export default function App() {
  const [tab, setTab] = useState("home");

  const screens = {
    home: <HomeScreen go={setTab} />,
    news: <NewsScreen />,
    calendar: <CalendarScreen />,
    gallery: <GalleryScreen />,
    shop: <ShopScreen />,
    join: <JoinScreen />,
  };

  return (
    <LanguageProvider>
      <div style={{ minHeight: "100vh", background: "#050607", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div
          style={{
            width: 375,
            maxWidth: "100%",
            height: 720,
            maxHeight: "92vh",
            background: INK,
            borderRadius: 28,
            border: "8px solid #1c1c1c",
            boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>{screens[tab]}</div>

          <div style={{ display: "flex", alignItems: "center", borderTop: `1px solid ${GUNMETAL_2}`, background: "#0a0b0d", paddingBottom: 6 }}>
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key || (tab === "news" && t.key === "home");
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    background: "none",
                    border: "none",
                    padding: "10px 0 6px",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={19} color={active ? BRASS : "#5a5d63"} />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 9.5,
                      fontWeight: 600,
                      color: active ? BRASS : "#5a5d63",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}
