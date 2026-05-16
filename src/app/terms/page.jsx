// app/terms/page.jsx  — no 'use client' needed (no interactivity)

import { styles } from "@/lib/pageStyles";

const SECTIONS = [
  { title: "1. Acceptance of Terms",     body: "By accessing or using our platform, you confirm that you are at least 18 years old, have read and understood these Terms, and agree to be bound by them. If you disagree, please do not use our services." },
  { title: "2. Ordering & Payment",      body: "All orders are subject to availability and confirmation. Prices are as displayed at the time of ordering and are inclusive of applicable taxes. We accept payment via our listed payment methods. Orders are confirmed only after successful payment authorisation." },
  { title: "3. Delivery",               body: "Estimated delivery times are provided as a guide only and are not guaranteed. Factors such as traffic, weather, or high demand may affect delivery. We are not liable for delays beyond our reasonable control." },
  { title: "4. Cancellations & Refunds", body: "Cancellations are only accepted before a restaurant begins preparing your order. Refunds for valid complaints (wrong order, spoiled food) are processed within 3–5 working days to your original payment method." },
  { title: "5. User Conduct",           body: "You agree not to misuse our platform — including submitting false orders, abusing our refund policy, or engaging in any fraudulent activity. We reserve the right to suspend or terminate accounts that violate these terms." },
  { title: "6. Intellectual Property",  body: "All content on this platform — including logos, text, images, and code — is the property of our company and protected by applicable copyright laws. You may not reproduce or distribute any content without written permission." },
  { title: "7. Limitation of Liability", body: "To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of our platform or services." },
  { title: "8. Changes to Terms",       body: "We reserve the right to update these Terms at any time. Continued use of the platform after changes constitutes your acceptance of the revised Terms." },
  { title: "9. Governing Law",          body: "These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State." },
];

export default function TermsAndConditions() {
  return (
    <div style={styles.page}>
      <div style={styles.badge}>Legal</div>
      <h1 style={styles.h1}>Terms & Conditions</h1>
      <p style={styles.lead}>
        By using our platform, you agree to these terms. Please read them carefully before placing an order.
      </p>
      {SECTIONS.map((s) => (
        <div key={s.title} style={styles.section}>
          <h2 style={styles.h2}>{s.title}</h2>
          <p style={styles.p}>{s.body}</p>
          <hr style={styles.divider} />
        </div>
      ))}
      <p style={{ ...styles.p, fontSize: 13 }}>Last updated: May 2026</p>
    </div>
  );
}
