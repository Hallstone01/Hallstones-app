import React, { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Check, Users } from "lucide-react";
import { supabase } from "../supabaseClient";
import { Screen, LoadingRow, ErrorRow } from "./Screen";
import { GUNMETAL, GUNMETAL_2, BRASS, BRASS_BRIGHT, CHROME, INK } from "../theme";
import { useLanguage } from "../LanguageContext";

const TRANSLATIONS = {
  en: {
    title: "Rides",
    subtitle: "CALENDAR & RSVP",
    noRides: "No rides scheduled yet.",
    less: "Less",
    details: "Details",
    youreIn: "You're in",
    rsvp: "RSVP",
    riding: "riding",
    namePlaceholder: "Your name",
    emailPlaceholder: "Email",
    sending: "Sending…",
    confirmRsvp: "Confirm RSVP",
    miles: "mi",
  },
  pl: {
    title: "Przejażdżki",
    subtitle: "KALENDARZ I ZAPISY",
    noRides: "Brak zaplanowanych przejażdżek.",
    less: "Mniej",
    details: "Szczegóły",
    youreIn: "Jesteś zapisany",
    rsvp: "Zapisz się",
    riding: "jedzie",
    namePlaceholder: "Twoje imię",
    emailPlaceholder: "E-mail",
    sending: "Wysyłanie…",
    confirmRsvp: "Potwierdź zapis",
    miles: "mil",
  },
};

function formatDate(d, locale) {
  return new Date(d).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
}

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function RidesScreen() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];
  const locale = lang === "pl" ? "pl-PL" : "en-GB";

  const [rides, setRides] = useState([]);
  const [attendees, setAttendees] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);
  const [rsvpForm, setRsvpForm] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [myRsvps, setMyRsvps] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: ridesData, error: ridesError } = await supabase
        .from("rides")
        .select("*")
        .order("ride_date", { ascending: true });
      if (cancelled) return;
      if (ridesError) {
        setError(ridesError.message);
        setLoading(false);
        return;
      }
      setRides(ridesData || []);

      const { data: rsvpData, error: rsvpError } = await supabase.from("rsvps").select("ride_id, name");
      if (!cancelled && !rsvpError) {
        const grouped = {};
        (rsvpData || []).forEach((r) => {
          grouped[r.ride_id] = grouped[r.ride_id] || [];
          grouped[r.ride_id].push(r.name);
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

  async function submitRsvp(rideId) {
    if (!name || !email) return;
    setSubmitting(true);
    const { error } = await supabase.from("rsvps").insert({ ride_id: rideId, name, email });
    setSubmitting(false);
    if (!error) {
      setMyRsvps((m) => ({ ...m, [rideId]: true }));
      setAttendees((a) => ({ ...a, [rideId]: [...(a[rideId] || []), name] }));
      setRsvpForm(null);
      setName("");
      setEmail("");
    } else {
      setError(error.message);
    }
  }

  const todayKey = toKey(new Date());
  const upcoming = rides.filter((r) => r.ride_date >= todayKey);

  return (
    <Screen title={t.title} subtitle={t.subtitle}>
      {error && <ErrorRow message={error} />}
      {loading && <LoadingRow />}
      {!loading && upcoming.length === 0 && !error && (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: CHROME }}>{t.noRides}</div>
      )}

      {upcoming.map((r) => {
        const isGoing = !!myRsvps[r.id];
        const names = attendees[r.id] || [];
        const count = names.length;
        return (
          <div key={r.id} style={{ background: GUNMETAL, border: `1px solid ${GUNMETAL_2}`, borderRadius: 4, padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 16.5, color: "#f2f0ea" }}>
                {r.title}
              </div>
              {r.miles ? (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: BRASS, fontWeight: 700, whiteSpace: "nowrap" }}>
                  {r.miles} {t.miles}
                </div>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: CHROME }}>
                <Calendar size={13} color={BRASS} /> {formatDate(r.ride_date, locale)}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: CHROME }}>
                <Clock size={13} color={BRASS} /> {r.ride_time}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: CHROME }}>
                <MapPin size={13} color={BRASS} /> {r.meet_point}
              </span>
            </div>

            {open === r.id && r.description && (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: CHROME, marginTop: 10, lineHeight: 1.5 }}>
                {r.description}
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

            {rsvpForm === r.id && !isGoing && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  style={{ background: INK, border: `1px solid ${GUNMETAL_2}`, borderRadius: 3, padding: "8px 10px", color: "#f2f0ea", fontFamily: "'Inter', sans-serif", fontSize: 13 }}
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  style={{ background: INK, border: `1px solid ${GUNMETAL_2}`, borderRadius: 3, padding: "8px 10px", color: "#f2f0ea", fontFamily: "'Inter', sans-serif", fontSize: 13 }}
                />
                <button
                  disabled={submitting}
                  onClick={() => submitRsvp(r.id)}
                  style={{ background: BRASS, color: INK, border: "none", borderRadius: 3, padding: "8px 0", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                >
                  {submitting ? t.sending : t.confirmRsvp}
                </button>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <button
                onClick={() => setOpen(open === r.id ? null : r.id)}
                style={{ background: "none", border: "none", color: BRASS, fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 }}
              >
                {open === r.id ? t.less : t.details}
              </button>
              <button
                onClick={() => (isGoing ? null : setRsvpForm(rsvpForm === r.id ? null : r.id))}
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
                <span style={{ opacity: 0.7, fontWeight: 500 }}>· {count} {t.riding}</span>
              </button>
            </div>
          </div>
        );
      })}
    </Screen>
  );
}
