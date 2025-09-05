"use client";

import { useEffect, useRef, useState } from "react";

function getSavedRef() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("referrer_code");
}

export default function ChatPage({ params }: { params: { roomId: string } }) {
  const [msgs, setMsgs] = useState<{ role: "me"|"sys"; text: string }[]>([
    { role: "sys", text: "出品者にメッセージを送れます。個人情報は送信できません。" }
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    setMsgs(m => [...m, { role: "me", text }]);
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roomId: params.roomId, message: text, ref: getSavedRef() })
      });
      const json = await res.json();
      if (!res.ok) {
        setMsgs(m => [...m, { role: "sys", text: json.error || "送信に失敗しました。" }]);
      } else {
        setMsgs(m => [...m, { role: "sys", text: json.reply }]);
      }
    } catch {
      setMsgs(m => [...m, { role: "sys", text: "ネットワークエラーです。" }]);
    } finally {
      setText("");
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>チャット: {params.roomId}</h2>

      <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, minHeight: 280 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            textAlign: m.role === "me" ? "right" : "left",
            margin: "8px 0"
          }}>
            <span style={{
              display: "inline-block",
              background: m.role === "me" ? "#f0f0f0" : "#fff",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "8px 10px",
              maxWidth: "85%"
            }}>{m.text}</span>
          </div>
        ))}
        <div ref={ref} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" ? send() : null}
          placeholder="ここにメッセージを入力"
          style={{ flex: 1, padding: "10px 12px", borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button onClick={send} disabled={busy} style={{ padding: "10px 16px", borderRadius: 6, border: "1px solid #333" }}>
          送信
        </button>
      </div>

      <p style={{ fontSize: 12, opacity: .7, marginTop: 8 }}>
        メール・電話番号・URL・SNS名/IDなどの個人情報は送信できません。
      </p>
    </main>
  );
}