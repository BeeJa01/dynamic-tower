import { styles } from "@/lib/pageStyles";

export default function ContactUs() {
  return (
    <div style={styles.page}>
      <div style={styles.badge}>Contact</div>
      <h1 style={styles.h1}>Contact Us</h1>
      <p style={styles.lead}>Whether it`s a complaint, compliment or catering enquiry — we want to hear from you.</p>
      <label style={styles.label}>Full Name</label>
      <input style={styles.input} placeholder="e.g. Amara Okonkwo" />
      <label style={styles.label}>Email Address</label>
      <input style={styles.input} placeholder="you@example.com" />
      <label style={styles.label}>Subject</label>
      <input style={styles.input} placeholder="What's this about?" />
      <label style={styles.label}>Message</label>
      <textarea style={styles.textarea} placeholder="Tell us everything…" />
      <button style={styles.btn}>Send Message →</button>
      <hr style={styles.divider} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {[{ title: "📧 Email", text: "adekunleoluwatimilehin05@gmail.com" }, { title: "📞 Phone", text: "+234 810 719 1319" }, { title: "📍 Address", text: "Oyo State, Nigeria" }].map((c) => (
          <div key={c.title} style={styles.card}><div style={styles.cardTitle}>{c.title}</div><div style={styles.cardText}>{c.text}</div></div>
        ))}
      </div>
    </div>
  );
}
