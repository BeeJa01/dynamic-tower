'use client';
// app/preferences/page.jsx

import { useState } from "react";
import { styles, WHITE, MUTED } from "@/lib/pageStyles";

const GROUPS = [
  {
    title: "Notifications",
    items: [
      { key: "orderUpdates", label: "Order Updates",      desc: "SMS and email alerts for your order status" },
      { key: "promos",       label: "Promotions & Deals", desc: "Be the first to hear about discounts and offers" },
      { key: "newsletter",   label: "Weekly Newsletter",  desc: "New dishes, restaurant spotlights, and food tips" },
    ],
  },
  {
    title: "Cookie Preferences",
    items: [
      { key: "performance", label: "Performance Cookies", desc: "Help us understand how you use the platform" },
      { key: "marketing",   label: "Marketing Cookies",   desc: "Relevant ads on other websites" },
      { key: "functional",  label: "Functional Cookies",  desc: "Remember your preferences across visits" },
    ],
  },
  {
    title: "Display",
    items: [
      { key: "darkMode", label: "Dark Mode", desc: "Easier on the eyes at night" },
    ],
  },
];

export default function Preferences() {
  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    promos:       false,
    newsletter:   true,
    performance:  true,
    marketing:    false,
    functional:   true,
    darkMode:     true,
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div style={styles.page}>
      <div style={styles.badge}>Settings</div>
      <h1 style={styles.h1}>Preferences</h1>
      <p style={styles.lead}>
        Control your notifications, cookie settings, and display preferences all in one place.
      </p>

      {GROUPS.map((g) => (
        <div key={g.title} style={styles.section}>
          <h2 style={styles.h2}>{g.title}</h2>
          {g.items.map((item) => (
            <div key={item.key} style={styles.toggleRow} onClick={() => toggle(item.key)}>
              <div>
                <div style={{ color: WHITE, fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                  {item.label}
                </div>
                <div style={{ color: MUTED, fontSize: 13 }}>{item.desc}</div>
              </div>
              <div style={styles.toggleKnob(prefs[item.key])}>
                <div style={styles.knob(prefs[item.key])} />
              </div>
            </div>
          ))}
        </div>
      ))}

      <button style={styles.btn}>Save Preferences →</button>
    </div>
  );
}
