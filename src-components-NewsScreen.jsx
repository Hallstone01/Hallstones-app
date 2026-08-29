import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Screen, RoadDivider, LoadingRow, ErrorRow } from "./Screen";
import { BRASS, CHROME } from "../theme";

export default function NewsScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from("news").select("*").order("created_at", { ascending: false });
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
    <Screen title="Notices" subtitle="CHAPTER & PROVINCE">
      {error && <ErrorRow message={`Couldn't load notices: ${error}`} />}
      {loading && <LoadingRow />}
      {!loading && !error && news.length === 0 && (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: CHROME }}>No notices yet.</div>
      )}
      {news.map((n, i) => (
        <div key={n.id} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: BRASS, fontWeight: 700, letterSpacing: "0.08em" }}>
              {n.tag}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: CHROME }}>
              {new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </div>
          </div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 17, color: "#f2f0ea", marginTop: 4 }}>
            {n.title}
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: CHROME, marginTop: 4, lineHeight: 1.5 }}>
            {n.body}
          </div>
          {i < news.length - 1 && (
            <div style={{ marginTop: 16 }}>
              <RoadDivider />
            </div>
          )}
        </div>
      ))}
    </Screen>
  );
}
