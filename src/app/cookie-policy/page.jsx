import Link from "next/link";
import { styles, ORANGE, MUTED } from "@/lib/pageStyles";

const COOKIES = [
  { name: "Essential Cookies", type: "Always Active", desc: "These cookies are necessary for the website to function and cannot be switched off." },
  { name: "Performance Cookies", type: "Optional", desc: "These help us understand how visitors interact with our platform by collecting anonymous information." },
  { name: "Functional Cookies", type: "Optional", desc: "These enable enhanced functionality — like remembering your delivery address and saved cart items." },
  { name: "Marketing Cookies", type: "Optional", desc: "Used to track visitors across websites and display relevant ads." },
];

export default function CookiePolicy() {
  return (
    <div style={styles.page}>
      <div style={styles.badge}>Legal</div>
      <h1 style={styles.h1}>Cookie Policy</h1>
      <p style={styles.lead}>We use cookies to keep our platform running smoothly and to give you a personalised experience.</p>
      {COOKIES.map((c) => (
        <div key={c.name} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={styles.cardTitle}>{c.name}</div>
            <span style={{ fontSize: 11, background: c.type === "Always Active" ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.06)", color: c.type === "Always Active" ? ORANGE : MUTED, borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>{c.type}</span>
          </div>
          <div style={styles.cardText}>{c.desc}</div>
        </div>
      ))}
      <hr style={styles.divider} />
      <p style={styles.p}>To manage your cookie preferences, visit the <Link href="/preferences"><strong style={{ color: ORANGE }}>Preferences</strong></Link> page.</p>
      <p style={{ ...styles.p, fontSize: 13 }}>Last updated: May 2026</p>
    </div>
  );
}
