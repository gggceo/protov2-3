"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function ListingDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [alias, setAlias] = useState<string>(""); // 購入者の表示名（任意）

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/listings/${params.id}`, { cache: "no-store" });
        const json = await res.json();
        setItem(json?.item ?? null);
      } catch {
        setErr("読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const startChat = async () => {
    try {
      const res = await fetch(`/api/chat/start`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId: params.id, buyerAlias: alias || undefined }),
      });
      const json = await res.json();
      if (!json?.ok || !json?.roomId) throw new Error("開始に失敗");
      router.push(`/chat/${json.roomId}`);
    } catch (e:any) {
      setErr(e?.message ?? "開始に失敗しました");
    }
  };

  if (loading) return <div style={{ padding:16 }}>読み込み中…</div>;
  if (err) return <div style={{ padding:16, color:"#b91c1c" }}>エラー: {err}</div>;
  if (!item) return <div style={{ padding:16 }}>見つかりませんでした</div>;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <button onClick={() => router.back()} style={{ marginBottom:12, fontSize:14 }}>← 戻る</button>

      <div style={{ display:"grid", gap:16, gridTemplateColumns:"1.1fr .9fr" }}>
        {/* 画像 */}
        <div style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:12, background:"#fff" }}>
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.title} style={{ width:"100%", borderRadius:8, objectFit:"cover" }} />
          )}
        </div>

        {/* 情報 */}
        <div>
          <h1 style={{ fontSize:24, fontWeight:700 }}>{item.title}</h1>
          <div style={{ fontSize:20, marginTop:6, fontVariantNumeric:"tabular-nums" }}>
            ¥{Number(item.price || 0).toLocaleString()}
          </div>
          <div style={{ color:"#6b7280", marginTop:4, fontSize:13 }}>
            出品者: {item.sellerAlias ?? "匿名"}
          </div>

          {/* 購入→チャット開始（簡易導線） */}
          <div style={{ marginTop:16, border:"1px solid #e5e7eb", borderRadius:12, padding:12 }}>
            <div style={{ fontSize:14, marginBottom:8 }}>購入前に出品者と連絡する</div>
            <input
              placeholder="あなたの表示名（任意）"
              value={alias}
              onChange={(e)=>setAlias(e.target.value)}
              style={{ padding:10, borderRadius:8, border:"1px solid #e5e7eb", width:"100%", marginBottom:8 }}
            />
            <button
              onClick={startChat}
              style={{
                padding:"10px 14px", borderRadius:8, border:"1px solid #111827",
                background:"#111827", color:"#fff", fontWeight:600, width:"100%"
              }}
            >
              チャットを開始する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}