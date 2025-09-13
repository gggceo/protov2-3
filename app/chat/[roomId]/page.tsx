"use client";

import { useEffect, useRef, useState } from "react";

function getSavedRef() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("referrer_code");
}

type Msg = { id?: string; text: string; from?: string; createdAt?: string };

export default function ChatPage({ params }: { params: { roomId: string } }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const refEl = useRef<HTMLDivElement>(null);

  const scrollBottom = () =>
    requestAnimationFrame(() => refEl.current?.scrollIntoView({ behavior: "smooth" }));

  // 履歴読み込み（なければ空）
  const load = async () => {
    const r = await fetch(`/api/chat/${params.roomId}`, { cache: "no-store" });
    const j = await r.json().catch(() => ({ messages: [] }));
    const arr: Msg[] = Array.isArray(j?.messages) ? j.messages : [];
    setMsgs(arr);
    scrollBottom();
  };

  useEffect(() => { load(); }, [params.roomId]);

  const send = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);

    // 楽観的反映
    const temp: Msg = { id: `tmp-${Date.now()}`, text, from: "me", createdAt: new Date().toISOString() };
    setMsgs((m) => [...m, temp]);
    scrollBottom();

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          roomId: params.roomId,
          message: text,
          ref: getSavedRef() || undefined,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "send failed");
      }
      // 成功後に最新を取り直し（ズレ解消）
      await load();
      setText("");
    } catch (e: any) {
      setMsgs((m) => [...m, { text: `sys: 送信に失敗しました - ${String(e?.message ?? e)}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>チャット: {params.roomId}</h2>

      <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, minHeight: 280 }}>
        {msgs.map((m, i) => (
          <div key={m.id ?? i} style={{ textAlign: m.from === "me" ? "right" : "left", margin: "8px 0" }}>
            <span
              style={{
                display: "inline-block",
                background: m.from === "me" ? "#f0f0f0" : "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: "8px 10px",
                maxWidth: "85%",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
        <div ref={refEl} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
          placeholder="ここにメッセージ入力"
          style={{ flex: 1, padding: "10px 12px", borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button
          onClick={send}
          disabled={busy}
          style={{ padding: "10px 16px", borderRadius: 6, border: "1px solid #333" }}
        >
          送信
        </button>
      </div>

      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
        ※ メール・電話番号・URL・SNS などの個人情報は送信できません。
      </p>
    </main>
  );
}