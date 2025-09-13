"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { id?: string; text: string; from?: string; createdAt?: string };

export default function ChatPage({ params }: { params: { roomId: string } }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [alias, setAlias] = useState("");
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 999999, behavior: "smooth" }));
  };

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/chat/${params.roomId}`, { cache: "no-store" });
    const json = await res.json();
    const arr: Msg[] = Array.isArray(json?.messages) ? json.messages : [];
    setMessages(arr);
    setLoading(false);
    scrollToBottom();
  };

  useEffect(() => { load(); }, [params.roomId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // 楽観的反映
    const temp: Msg = { id: `tmp-${Date.now()}`, text, from: alias || "me", createdAt: new Date().toISOString() };
    setMessages((m) => [...m, temp]);
    setText("");
    scrollToBottom();

    await fetch(`/api/chat/${params.roomId}`, {
      method: "POST",
      headers: { "content-type":"application/json" },
      body: JSON.stringify({ text, alias: alias || undefined }),
    });
    // 最新を再取得（簡易）
    load();
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>チャット</h1>
      <div style={{ display:"grid", gap:12, gridTemplateRows:"auto 1fr auto", height:"75vh" }}>
        {/* 設定（自分の表示名） */}
        <div>
          <input
            placeholder="あなたの表示名（任意）"
            value={alias}
            onChange={(e)=>setAlias(e.target.value)}
            style={{ padding:10, borderRadius:8, border:"1px solid #e5e7eb", width:"100%" }}
          />
        </div>

        {/* メッセージ一覧 */}
        <div
          ref={listRef}
          style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:12, background:"#fff", overflowY:"auto" }}
        >
          {loading ? (
            <div>読み込み中…</div>
          ) : messages.length === 0 ? (
            <div style={{ color:"#6b7280" }}>まだメッセージはありません。</div>
          ) : (
            messages.map((m, i) => (
              <div key={m.id ?? i} style={{ marginBottom:8 }}>
                <div style={{ fontSize:12, color:"#6b7280" }}>{m.from ?? "匿名"} ・ {m.createdAt?.slice(0,16).replace("T"," ")}</div>
                <div style={{ padding:10, borderRadius:10, background:"#f3f4f6" }}>{m.text}</div>
              </div>
            ))
          )}
        </div>

        {/* 入力フォーム */}
        <form onSubmit={send} style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:8 }}>
          <input
            placeholder="メッセージを入力"
            value={text}
            onChange={(e)=>setText(e.target.value)}
            style={{ padding:10, borderRadius:8, border:"1px solid #e5e7eb" }}
          />
          <button
            type="submit"
            style={{ padding:"10px 14px", borderRadius:8, border:"1px solid #111827", background:"#111827", color:"#fff", fontWeight:600 }}
          >
            送信
          </button>
        </form>
      </div>
    </div>
  );
}