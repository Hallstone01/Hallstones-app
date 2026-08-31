import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { supabase } from "../supabaseClient";
import { Screen, LoadingRow, ErrorRow } from "./Screen";
import { GUNMETAL, GUNMETAL_2, BRASS, BRASS_BRIGHT, CHROME, INK } from "../theme";

function formatPot(pence) {
  return `£${(pence / 100).toFixed(2)}`;
}

const PLACE_LABELS = ["1st", "2nd", "3rd"];

export default function CowboyDrawScreen() {
  const [draw, setDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("cowboy_draw_results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (error) setError(error.message);
      else setDraw(data);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const winners = draw
    ? [
        { place: PLACE_LABELS[0], number: draw.first_number, name: draw.first_name },
        { place: PLACE_LABELS[1], number: draw.second_number, name: draw.second_name },
        { place: PLACE_LABELS[2], number: draw.third_number, name: draw.third_name },
      ].filter((w) => w.name)
    : [];

  return (
    <Screen title="Cowboy Draw" subtitle="MONTHLY DRAW RESULTS">
      {error && <ErrorRow message={error} />}
      {loading && <LoadingRow />}

      {!loading && !draw && !error && (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: CHROME }}>
          No draw results posted yet.
        </div>
      )}

      {!loading && draw && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <Trophy size={20} color={BRASS} />
            <div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, color: "#f2f0ea" }}>
                {draw.draw_month} {draw.draw_year} Draw Results
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: CHROME, marginTop: 2 }}>
                Pot: {formatPot(draw.pot_amount_pence)}
              </div>
            </div>
          </div>

          {winners.map((w, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                marginBottom: 8,
                background: GUNMETAL,
                border: `1px solid ${GUNMETAL_2}`,
                borderRadius: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 4,
                    background: i === 0 ? BRASS : "transparent",
                    border: i === 0 ? "none" : `1px solid ${BRASS}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 800,
                      fontSize: 12,
                      color: i === 0 ? INK : BRASS_BRIGHT,
                    }}
                  >
                    {w.place}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: "#f2f0ea" }}>
                    {w.name}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: CHROME }}>
                    No. {w.number}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: CHROME, marginTop: 14, lineHeight: 1.5 }}>
            Congratulations to the winners. Good luck next month.
          </div>
        </div>
      )}
    </Screen>
  );
}
