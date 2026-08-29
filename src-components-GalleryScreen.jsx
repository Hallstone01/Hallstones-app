import React, { useEffect, useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { supabase } from "../supabaseClient";
import { Screen, LoadingRow, ErrorRow } from "./Screen";
import { GUNMETAL_2, CHROME } from "../theme";

export default function GalleryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) setError(error.message);
      else setItems(data || []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Screen title="Gallery" subtitle="RIDES & MEETS">
      {error && <ErrorRow message={error} />}
      {loading && <LoadingRow />}
      {!loading && items.length === 0 && !error && (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: CHROME }}>
          No photos yet — add some from the Supabase dashboard (gallery_items table + a "gallery" storage bucket).
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, position: "relative" }}>
        {items.map((g) => (
          <div
            key={g.id}
            onClick={() => setSelected(g)}
            style={{
              background: `${GUNMETAL_2} url(${g.image_url}) center/cover no-repeat`,
              aspectRatio: "1 / 1",
              borderRadius: 4,
              display: "flex",
              alignItems: "flex-end",
              padding: 8,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <ImageIcon size={16} color="rgba(255,255,255,0.35)" style={{ position: "absolute", top: 8, right: 8 }} />
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                color: "#fff",
                lineHeight: 1.3,
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              }}
            >
              {g.caption}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundImage: `url(${selected.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: "85%",
              maxWidth: 420,
              aspectRatio: "1/1",
              borderRadius: 6,
              position: "relative",
            }}
          >
            <button
              onClick={() => setSelected(null)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(0,0,0,0.5)",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <X size={14} />
            </button>
            <div
              style={{
                position: "absolute",
                bottom: 10,
                left: 10,
                right: 10,
                fontFamily: "'Inter', sans-serif",
                color: "#fff",
                fontSize: 13,
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              }}
            >
              {selected.caption}
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
