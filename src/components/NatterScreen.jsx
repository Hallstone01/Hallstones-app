import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";
import { Screen, LoadingRow, ErrorRow } from "./Screen";
import { GUNMETAL, GUNMETAL_2, BRASS, CHROME, INK } from "../theme";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatLong(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function NatterScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("natter_nights")
        .select("*")
        .order("event_date", { ascending: true });
      if (cancelled) return;
      if (error) setError(error.message);
      else setEvents(data || []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const eventsByDate = {};
  events.forEach((e) => {
    eventsByDate[e.event_date] = eventsByDate[e.event_date] || [];
    eventsByDate[e.event_date].push(e);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayKey = toKey(new Date());
  const upcoming = events.filter((e) => e.event_date >= todayKey);

  return (
    <Screen title="Natter Nights" subtitle="SOCIAL CALENDAR">
      {error && <ErrorRow message={error} />}
      {loading && <LoadingRow />}

      {!loading && (
        <>
          <div
            style={{
              background: GUNMETAL,
              border: `1px solid ${GUNMETAL_2}`,
              borderRadius: 4,
              padding: 14,
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <button
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer" }}
                aria-label="Previous month"
              >
                <ChevronLeft size={18} color={BRASS} />
              </button>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 16, color: "#f2f0ea" }}>
                {MONTH_NAMES[month]} {year}
              </div>
              <button
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer" }}
                aria-label="Next month"
              >
                <ChevronRight size={18} color={BRASS} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
              {DAY_LETTERS.map((l, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: CHROME,
                    padding: "2px 0",
                  }}
                >
                  {l}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {cells.map((d, i) => {
                if (d === null) return <div key={i} />;
                const cellDate = new Date(year, month, d);
                const key = toKey(cellDate);
                const hasEvent = !!eventsByDate[key];
                const isToday = key === todayKey;
                return (
                  <div
                    key={i}
                    style={{
                      aspectRatio: "1 / 1",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 4,
                      background: hasEvent ? "rgba(217,142,46,0.15)" : "transparent",
                      border: isToday ? `1px solid ${BRASS}` : "1px solid transparent",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12.5,
                        color: hasEvent ? "#f2f0ea" : CHROME,
                        fontWeight: hasEvent ? 700 : 400,
                      }}
                    >
                      {d}
                    </span>
                    {hasEvent && (
                      <span
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: BRASS,
                          marginTop: 2,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: BRASS,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            UPCOMING
          </div>

          {upcoming.length === 0 && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: CHROME }}>
              Nothing on the calendar yet.
            </div>
          )}

          {upcoming.map((e) => (
            <div
              key={e.id}
              style={{
                background: GUNMETAL,
                border: `1px solid ${GUNMETAL_2}`,
                borderRadius: 4,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 16, color: "#f2f0ea" }}>
                {e.title}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: BRASS, marginTop: 2 }}>
                {formatLong(e.event_date)}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
                {e.event_time && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: CHROME }}>
                    <Clock size={13} color={BRASS} /> {e.event_time}
                  </span>
                )}
                {e.location && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: CHROME }}>
                    <MapPin size={13} color={BRASS} /> {e.location}
                  </span>
                )}
              </div>
              {e.description && (
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: CHROME, marginTop: 8, lineHeight: 1.5 }}>
                  {e.description}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </Screen>
  );
}
