import React, { useEffect, useState } from "react";
import { Bike, ChevronRight } from "lucide-react";
import { supabase } from "../supabaseClient";
import { Screen, Eyebrow, RoadDivider, LoadingRow, ErrorRow } from "./Screen";
import { GUNMETAL, GUNMETAL_2, BRASS, CHROME } from "../theme";
import logo from "../assets/logo.jpg";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function HomeScreen({ go }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2);
      if (cancelled) return;
      if (error) setError(error.message);
      else setNews(data || []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Screen title="Hallstones" subtitle="WIDOWS SONS MASONIC BIKERS ASSOC.">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <img
          src={logo}
          alt="Hallstone Widows Sons MBA"
          style={{
            width: 128,
            height: 128,
            borderRadius: "50%",
            boxShadow: `0 0 0 1px ${GUNMETAL_2}, 0 8px 20px rgba(0,0,0,0.5)`,
          }}
        />
      </div>

      <div
        style={{
          background: `linear-gradient(135deg, ${GUNMETAL_2}, ${GUNMETAL})`,
          border: `1px solid ${GUNMETAL_2}`,
          borderRadius: 4,
          padding: "18px 16px",
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", right: -10, top: -10, opacity: 0.15 }}>
          <Bike size={90} color={BRASS} />
        </div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 19, color: "#fff", fontWeight: 600 }}>
          Brothers on the road, in the trade.
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: CHROME, marginTop: 6, lineHeight: 1.5 }}>
          Hallstones is the Buckinghamshire chapter of the Widows Sons — riding together, raising money for
          Masonic charities, and supporting each other on and off the bike.
        </div>
      </div>

      <Eyebrow>LATEST</Eyebrow>
      {error && <ErrorRow message={`Couldn't load notices: ${error}`} />}
      {loading && <LoadingRow />}
      {!loading && !error && news.length === 0 && (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: CHROME }}>
          No notices yet.
        </div>
      )}
      {!loading &&
        news.map((n, i) => (
          <div key={n.id}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", gap: 10 }}>
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: BRASS,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  {n.tag}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14.5, color: "#f2f0ea", marginTop: 3 }}>
                  {n.title}
                </div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: CHROME, whiteSpace: "nowrap" }}>
                {timeAgo(n.created_at)}
              </div>
            </div>
            {i === 0 && news.length > 1 && <RoadDivider />}
          </div>
        ))}

      <button
        onClick={() => go("news")}
        style={{
          background: "none",
          border: "none",
          color: BRASS,
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          padding: "10px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 4,
          cursor: "pointer",
        }}
      >
        All notices <ChevronRight size={14} />
      </button>
    </Screen>
  );
}
