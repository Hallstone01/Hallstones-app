import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Check, Users } from "lucide-react";
import { supabase } from "../supabaseClient";
import { Screen, LoadingRow, ErrorRow } from "./Screen";
import { GUNMETAL, GUNMETAL_2, BRASS, BRASS_BRIGHT, CHROME, INK } from "../theme";
import { useLanguage } from "../LanguageContext";

const TRANSLATIONS = {
  en: {
    title: "Natter Nights",
    subtitle: "SOCIAL CALENDAR",
    upcoming: "UPCOMING",
    nothingYet: "Nothing on the calendar yet.",
    namePlaceholder: "Your name",
    emailPlaceholder: "Email",
    sending: "Sending…",
    confirmRsvp: "Confirm RSVP",
    youreIn: "You're in",
    rsvp: "RSVP",
    going: "going",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    dayLetters: ["S", "M", "T", "W", "T", "F", "S"],
    locale: "en-GB",
  },
  pl: {
    title: "Wieczory Natter",
    subtitle: "KALENDARZ SPOTKAŃ",
    upcoming: "NADCHODZĄCE",
    nothingYet: "Brak wydarzeń w kalendarzu.",
    namePlaceholder: "Twoje imię",
    emailPlaceholder: "E-mail",
    sending: "Wysyłanie…",
    confirmRsvp: "Potwierdź zapis",
    youreIn: "Jesteś zapisany",
    rsvp: "Zapisz się",
    going: "idzie",
    months: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
    dayLetters: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"],
    locale: "pl-PL",
  },
};

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatLong(dateStr, locale) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function NatterScreen() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [rsvpForm, setRsvpForm] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [myRsvps, setMyRsvps] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: eventsData, error: eventsError } = await supabase
        .from("natter_nights")
        .select("*")
        .order("event_date", { ascending: true });
      if (cancelled) return;
      if (eventsError) {
        setError(eventsError.message);
        setLoading(false);
        return;
      }
      setEvents(eventsData || []);

      const { data: rsvpData, error: rsvpError } = await supabase.from("natter_rsvps").select("natter_id, name");
      if (!cancelled && !rsvpError) {
        const grouped = {};
        (rsvpData || []).forEach((r) => {
          grouped[r.natter_id] = grouped[r.natter_id] || [];
          grouped[r.natter_id].push(r.name);
        });
        setAttendees(grouped);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submitRsvp(natterId) {
    if (!name || !email) return;
    setSubmitting(true);
    const { error } = await supabase.from("natter_rsvps").insert({ natter_id: natterId, name, email });
    setSubmitting(false);
    if (!error) {
      setMyRsvps((m) => ({ ...m, [natterId]: true }));
      setAttendees((a) => ({ ...a, [natterId]: [...(a[natterId] || []), name] }));
      setRsvpForm(null);
      setName("");
      setEmail("");
    } else {
      setError(error.message);
    }
  }

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
    <Screen title={t.title} subtitle={t.subtitle}>
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
                {t.months[month]} {year}
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
              {t.dayLetters.map((l, i) => (
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
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: BRASS, marginTop: 2 }} />
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
            {t.upcoming}
          </div>

          {upcoming.length === 0 && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: CHROME }}>
              {t.nothingYet}
            </div>
          )}

          {upcoming.map((e) => {
            const isGoing = !!myRsvps[e.id];
            const names = attendees[e.id] || [];
            const count = names.length;
            return (
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
                  {formatLong(e.event_date, t.locale)}
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

                {names.length > 0 && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 10 }}>
                    <Users size={13} color={CHROME} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: CHROME, lineHeight: 1.5 }}>
                      {names.join(", ")}
                    </div>
                  </div>
                )}

                {rsvpForm === e.id && !isGoing && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      value={name}
                      onChange={(ev) => setName(ev.target.value)}
                      placeholder={t.namePlaceholder}
                      style={{ background: INK, border: `1px solid ${GUNMETAL_2}`, borderRadius: 3, padding: "8px 10px", color: "#f2f0ea", fontFamily: "'Inter', sans-serif", fontSize: 13 }}
                    />
                    <input
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      placeholder={t.emailPlaceholder}
                      style={{ background: INK, border: `1px solid ${GUNMETAL_2}`, borderRadius: 3, padding: "8px 10px", color: "#f2f0ea", fontFamily: "'Inter', sans-serif", fontSize: 13 }}
                    />
                    <button
                      disabled={submitting}
                      onClick={() => submitRsvp(e.id)}
                      style={{ background: BRASS, color: INK, border: "none", borderRadius: 3, padding: "8px 0", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      {submitting ? t.sending : t.confirmRsvp}
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button
                    onClick={() => (isGoing ? null : setRsvpForm(rsvpForm === e.id ? null : e.id))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: isGoing ? BRASS : "transparent",
                      color: isGoing ? INK : BRASS_BRIGHT,
                      border: `1px solid ${BRASS}`,
                      borderRadius: 3,
                      padding: "7px 12px",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: isGoing ? "default" : "pointer",
                    }}
                  >
                    {isGoing ? <Check size={14} /> : null}
                    {isGoing ? t.youreIn : t.rsvp}
                    <span style={{ opacity: 0.7, fontWeight: 500 }}>· {count} {t.going}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </Screen>
  );
}
