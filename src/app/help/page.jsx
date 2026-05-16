'use client';
// app/help/page.jsx

import { useState } from "react";
import { styles, ORANGE } from "@/lib/pageStyles";

const FAQS = [
  { q: "How do I track my order?",            a: "Once your order is confirmed, you'll receive a tracking link via SMS and email. You can also check your order status under 'My Orders' in the app." },
  { q: "Can I change my order after placing it?", a: "Orders can be modified within 5 minutes of placement. After that, please contact our support team immediately via live chat." },
  { q: "What if my food arrives cold or incorrect?", a: "We're sorry! Please take a photo and contact us within 30 minutes of delivery. We'll arrange a replacement or full refund." },
  { q: "How do I cancel an order?",           a: "Go to My Orders → Select your order → Tap Cancel. Cancellations are free if the restaurant hasn't started preparing your food." },
  { q: "What payment methods do you accept?", a: "We accept bank transfers, debit/credit cards, and Pay on Delivery (selected areas only)." },
  { q: "How do I become a vendor on the platform?", a: "Visit our Vendor sign-up page or email vendors@yourbrand.com with your restaurant details and we'll be in touch within 24 hours." },
];

export default function HelpCenter() {
  const [open, setOpen] = useState(null);

  return (
    <div style={styles.page}>
      <div style={styles.badge}>Help</div>
      <h1 style={styles.h1}>Help Center</h1>
      <p style={styles.lead}>
        Find quick answers to the most common questions. Can't find what you need? Our team is one chat away.
      </p>

      {FAQS.map((f, i) => (
        <div key={i} style={{ ...styles.card, cursor: "pointer" }}
          onClick={() => setOpen(open === i ? null : i)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ ...styles.cardTitle, marginBottom: 0 }}>{f.q}</div>
            <span style={{ color: ORANGE, fontSize: 20, marginLeft: 12 }}>
              {open === i ? "−" : "+"}
            </span>
          </div>
          {open === i && (
            <div style={{ ...styles.cardText, marginTop: 12,
              borderTop: `1px solid rgba(245,166,35,0.1)`, paddingTop: 12 }}>
              {f.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
