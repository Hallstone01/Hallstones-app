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
              background: GUNMETAL_2,
              aspectRatio: "1 / 1",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              src={g.image_url}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
            <ImageIcon size={16} color="rgba(255,255,255,0.35)" style={{ position: "absolute", top: 8, right: 8 }} />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "16px 8px 8px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                color: "#fff",
                lineHeight: 1.3,
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
              width: "85%",
              maxWidth: 420,
              maxHeight: "80vh",
              background: GUNMETAL_2,
              borderRadius: 6,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <img
              src={selected.image_url}
              alt=""
              style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", display: "block" }}
            />
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
                padding: "10px 12px",
                fontFamily: "'Inter', sans-serif",
                color: "#fff",
                fontSize: 13,
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
