// app/privacy/page.jsx  — no 'use client' needed (no interactivity)

import { styles } from "@/lib/pageStyles";

const SECTIONS = [
  { title: "1. Information We Collect",      body: "We collect information you provide directly — such as your name, email address, phone number, delivery address, and payment details when you place an order. We also collect usage data such as pages visited, items viewed, and order history to improve your experience." },
  { title: "2. How We Use Your Information", body: "Your data is used to process and deliver your orders, send you order updates and promotions (with your consent), improve our platform and services, and comply with legal obligations. We never sell your personal data to third parties." },
  { title: "3. Data Sharing",               body: "We share your data only with trusted partners necessary to operate our service — including delivery riders, payment processors, and cloud infrastructure providers. All partners are bound by strict data protection agreements." },
  { title: "4. Data Retention",             body: "We retain your personal data for as long as your account is active or as required by law. You can request deletion of your account and data at any time by contacting our support team." },
  { title: "5. Your Rights",                body: "You have the right to access, correct, or delete your personal data. You may also object to processing or request data portability. To exercise any of these rights, email adekunleoluwatimilehin05@gmail.com." },
  { title: "6. Security",                   body: "We use industry-standard encryption (SSL/TLS) to protect data in transit and AES-256 encryption for data at rest. Our systems are regularly audited for vulnerabilities." },
  { title: "7. Contact",                    body: "For privacy-related enquiries, contact our Data Protection Officer at adekunleoluwatimilehin05@gmail.com or call +234 810 719 1319." },
];

export default function PrivacyNotice() {
  return (
    <div style={styles.page}>
      <div style={styles.badge}>Legal</div>
      <h1 style={styles.h1}>Privacy Notice</h1>
      <p style={styles.lead}>
        We take your privacy seriously. Here`s exactly what data we collect, why we collect it, and how we protect it.
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
