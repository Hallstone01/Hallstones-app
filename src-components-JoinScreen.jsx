import React, { useState } from "react";
import { Flame } from "lucide-react";
import { supabase } from "../supabaseClient";
import { Screen, ErrorRow } from "./Screen";
import { GUNMETAL, GUNMETAL_2, BRASS, CHROME, INK } from "../theme";

export default function JoinScreen() {
  const [form, setForm] = useState({ name: "", email: "", lodge: "", bike: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const field = (key, label, placeholder) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: BRASS, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <input
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: GUNMETAL,
          border: `1px solid ${GUNMETAL_2}`,
          borderRadius: 3,
          padding: "10px 10px",
          color: "#f2f0ea",
          fontFamily: "'Inter', sans-serif",
          fontSize: 13.5,
          boxSizing: "border-box",
        }}
      />
    </div>
  );

  async function submit() {
    if (!form.name || !form.email) return;
    setSubmitting(true);
    const { error } = await supabase.from("join_requests").insert({
      full_name: form.name,
      email: form.email,
      mother_lodge: form.lodge,
      bike: form.bike,
    });
    setSubmitting(false);
    if (error) setError(error.message);
    else setSubmitted(true);
  }

  if (submitted) {
    return (
      <Screen title="Request sent" subtitle="JOIN HALLSTONES">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "30px 10px" }}>
          <Flame size={34} color={BRASS} />
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, color: "#f2f0ea", marginTop: 14 }}>
            Thanks, {form.name.split(" ")[0] || "Brother"}.
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: CHROME, marginTop: 6, lineHeight: 1.5 }}>
            A chapter officer will be in touch about next steps and your first meet.
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Join us" subtitle="MEMBERSHIP REQUEST">
      {error && <ErrorRow message={error} />}
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: CHROME, marginBottom: 16, lineHeight: 1.5 }}>
        Open to Master Masons who ride. Tell us a little about yourself and we'll follow up.
      </div>
      {field("name", "FULL NAME", "John Smith")}
      {field("email", "EMAIL", "you@email.com")}
      {field("lodge", "MOTHER LODGE", "Lodge name & number")}
      {field("bike", "BIKE", "Make & model")}
      <button
        disabled={submitting}
        onClick={submit}
        style={{
          width: "100%",
          background: BRASS,
          color: INK,
          border: "none",
          borderRadius: 3,
          padding: "12px 0",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          marginTop: 6,
        }}
      >
        {submitting ? "Sending…" : "Send request"}
      </button>
    </Screen>
  );
}
