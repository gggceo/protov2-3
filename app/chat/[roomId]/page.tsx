"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "me" | "sys"; text: string; id: string };

export default function ChatPage({ params }: { params: { roomId: string } }) {
  // ← 初期メッセージを空にする
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const tailRef = useRef<HTMLDivElement>(null);

  // 末尾へスクロール
  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send() {
    const m = text.trim();
    if (!m || busy) return;
    setBusy(true);

    const tempId = String(Date.now());

    // 先に自分の発言を描画し、入力欄を空にする
    setMsgs((s) => [...s, { role: "me", text: m, id: tempId }]);
    setText("");

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roomId: params.roomId, message: m }),
      });

      const raw = await res.text();
      let json: any;
      try {
        json = raw ? JSON.parse(raw) : {};
      } catch {
        json = { ok: false, error: "invalid JSON", raw };
      }

      if (!res.ok || json?.ok === false) {
        const reason = json?.error || json?.message || `HTTP ${res.status}`;
        setMsgs((s) => [
          ...s,
          { role: "sys", text: `送信に失敗しました。- ${reason}`, id: `e-${tempId}` },
        ]);
        return;
      }

      const reply: string =
        json.reply ?? json.echo?.message ?? "受け取りました。";

      setMsgs((s) => [...s, { role: "sys", text: reply, id: `r-${tempId}` }]);
    } catch (e: any) {
      setMsgs((s) => [
        ...s,
        { role: "sys", text: `ネットワークエラーです。${String(e?.message || e)}`, id: `n-${tempId}` },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ margin: "8px 0 16px", fontWeight: 700 }}>
        チャット：{params.roomId}
      </h2>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 12,
          minHeight: 240,
          background: "rgba(255,255,255,.9)",
          position: "relative",
        }}
      >
        {/* 履歴が無いときのプレースホルダー（バブルでは出さない） */}
        {msgs.length === 0 && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: "#9aa2b1",
              fontSize: 14,
              pointerEvents: "none",
            }}
          >
            まだメッセージはありません。下の入力欄から送信してください。
          </div>
        )}

        {msgs.map((m) => (
          <div key={m.id} style={{ textAlign: m.role === "me" ? "right" : "left" }}>
            <span
              style={{
                display: "inline-block",
                margin: "6px 0",
                padding: "8px 10px",
                borderRadius: 10,
                background: m.role === "me" ? "#eef2ff" : "#fff",
                border: "1px solid #e5e7eb",
                maxWidth: "85%",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
        <div ref={tailRef} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
          placeholder="ここにメッセージ入力"
          disabled={busy}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #cfd6e4",
            background: "#fff",
          }}
        />
        <button
          onClick={send}
          disabled={busy}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #111827",
            background: busy ? "#e5e7eb" : "#111827",
            color: busy ? "#111827" : "#fff",
            fontWeight: 700,
          }}
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