import React, { useEffect, useState } from "react";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { supabase } from "../supabaseClient";
import { Screen, LoadingRow, ErrorRow } from "./Screen";
import { GUNMETAL, GUNMETAL_2, BRASS, BRASS_BRIGHT, CHROME, INK } from "../theme";

function formatPrice(pence) {
  return `£${(pence / 100).toFixed(2)}`;
}

export default function ShopScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from("shop_items").select("*").eq("active", true).order("name");
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

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPence = items.reduce((sum, it) => sum + (cart[it.id] || 0) * it.price_pence, 0);

  async function placeOrder() {
    if (!buyerName || !buyerEmail || totalItems === 0) return;
    setPlacing(true);
    const orderItems = items
      .filter((it) => cart[it.id])
      .map((it) => ({ item_id: it.id, name: it.name, qty: cart[it.id], price_pence: it.price_pence }));
    const { error } = await supabase.from("orders").insert({
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      items: orderItems,
      total_pence: totalPence,
      status: "pending",
    });
    setPlacing(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPlaced(true);
    setCart({});
  }

  if (placed) {
    return (
      <Screen title="Order placed" subtitle="CHAPTER MERCH">
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: CHROME, lineHeight: 1.6 }}>
          Thanks — your order's logged. An officer will be in touch to arrange payment and collection or postage.
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Shop" subtitle="CHAPTER MERCH">
      {error && <ErrorRow message={error} />}
      {loading && <LoadingRow />}
      {!loading && items.length === 0 && !error && (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: CHROME }}>No items listed yet.</div>
      )}

      {items.map((s) => (
        <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${GUNMETAL_2}`, gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div style={{ width: 44, height: 44, background: GUNMETAL, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {s.image_url ? (
                <img src={s.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <ShoppingBag size={18} color={BRASS} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: "#f2f0ea" }}>{s.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: CHROME }}>{formatPrice(s.price_pence)}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {s.payment_url ? (
              <a
                href={s.payment_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: BRASS,
                  color: INK,
                  border: "none",
                  borderRadius: 3,
                  padding: "7px 12px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 12.5,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Buy now <ExternalLink size={12} />
              </a>
            ) : (
              <button
                onClick={() => add(s.id)}
                style={{
                  background: cart[s.id] ? BRASS : "transparent",
                  color: cart[s.id] ? INK : BRASS_BRIGHT,
                  border: `1px solid ${BRASS}`,
                  borderRadius: 3,
                  padding: "7px 12px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {cart[s.id] ? `Added (${cart[s.id]})` : "Add"}
              </button>
            )}
          </div>
        </div>
      ))}

      {totalItems > 0 && (
        <div style={{ marginTop: 18, padding: "12px 14px", background: GUNMETAL, borderRadius: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: CHROME }}>
              {totalItems} item{totalItems > 1 ? "s" : ""} · {formatPrice(totalPence)}
            </span>
            <button
              onClick={() => setCheckoutOpen(true)}
              style={{
                background: BRASS,
                color: INK,
                border: "none",
                borderRadius: 3,
                padding: "8px 14px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              Checkout
            </button>
          </div>

          {checkoutOpen && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Your name"
                style={{ background: INK, border: `1px solid ${GUNMETAL_2}`, borderRadius: 3, padding: "8px 10px", color: "#f2f0ea", fontFamily: "'Inter', sans-serif", fontSize: 13 }}
              />
              <input
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="Email"
                style={{ background: INK, border: `1px solid ${GUNMETAL_2}`, borderRadius: 3, padding: "8px 10px", color: "#f2f0ea", fontFamily: "'Inter', sans-serif", fontSize: 13 }}
              />
              <button
                disabled={placing}
                onClick={placeOrder}
                style={{ background: BRASS, color: INK, border: "none", borderRadius: 3, padding: "9px 0", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                {placing ? "Placing order…" : "Place order"}
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: CHROME, marginTop: 10, lineHeight: 1.5 }}>
        Items with "Buy now" pay securely via Square. Other items are logged as an order for an officer to follow up.
      </div>
    </Screen>
  );
}
