"use client";

import { useState } from "react";

export default function NewListing() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [seller, setSeller] = useState("@demo");
  const [image, setImage] = useState("/og.png");
  const [adminKey, setAdminKey] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!adminKey) { setMsg("ADMIN_KEY を入力してください。"); return; }
    if (!title || !price || !seller) { setMsg("必須項目が未入力です。"); return; }

    setBusy(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ title, price: Number(price), sellerAlias: seller, image })
      });
      const json = await res.json();
      if (!res.ok) setMsg(json?.error || "追加に失敗しました");
      else setMsg("追加しました！ /anime/figures を見てください。");
    } catch { setMsg("ネットワークエラー"); }
    finally { setBusy(false); }
  }

  return (
    <main style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h2>1分出品（管理者用）</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <label>ADMIN_KEY
          <input value={adminKey} onChange={e=>setAdminKey(e.target.value)}
            type="password" placeholder="Vercelに設定したADMIN_KEY"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}/>
        </label>
        <label>タイトル
          <input value={title} onChange={e=>setTitle(e.target.value)}
            placeholder="例: Megumin 1/7 Scale Figure"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}/>
        </label>
        <label>価格（JPY）
          <input value={price} onChange={e=>setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            type="number" min={0}
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}/>
        </label>
        <label>出品者@エイリアス
          <input value={seller} onChange={e=>setSeller(e.target.value)}
            placeholder="@akiba_store"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}/>
        </label>
        <label>画像URL（任意）
          <input value={image} onChange={e=>setImage(e.target.value)}
            placeholder="/og.png または https://…"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}/>
        </label>

        <button disabled={busy} type="submit"
          style={{ padding: "10px 16px", borderRadius: 6, border: "1px solid #333" }}>
          {busy ? "送信中…" : "追加する"}
        </button>
        {msg && <div style={{ padding: 8, background:"#f7f7f7", border:"1px solid #eee", borderRadius:6 }}>{msg}</div>}
      </form>

      <p style={{ marginTop: 12, fontSize: 12, opacity: .7 }}>
        ※ このページは簡易の管理ツールです。公開リンクを広く共有しないでください。ADMIN_KEY はVercelのEnvに設定した値です。
      </p>
    </main>
  );
}