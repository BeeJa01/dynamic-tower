'use client';

import { useState } from "react";
import { styles, ORANGE } from "@/lib/pageStyles";

export default function ChatWithUs() {
  const [msgs, setMsgs] = useState([{ self: false, text: "👋 Hey there! Welcome to our live chat. How can we help you today?" }]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMsgs((m) => [...m, { self: true, text: input }]);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, { self: false, text: "Thanks for reaching out! Our team will get back to you shortly. Average response time is under 2 minutes. 🍊" }]), 900);
  };

  return (
    <div style={styles.page}>
      <div style={styles.badge}>Support</div>
      <h1 style={styles.h1}>Chat with Us</h1>
      <p style={styles.lead}>Get instant help from our friendly support team. We`re online daily from 8am – 10pm.</p>
      <div style={styles.chatWrap}>
        {msgs.map((m, i) => (<div key={i} style={styles.chatBubble(m.self)}><div style={styles.bubble(m.self)}>{m.text}</div></div>))}
      </div>
      <div style={styles.chatInputRow}>
        <input style={{ ...styles.input, marginTop: 0 }} placeholder="Type your message…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <button style={{ ...styles.btn, marginTop: 0, padding: "13px 24px" }} onClick={send}>Send</button>
      </div>
    </div>
  );
}
