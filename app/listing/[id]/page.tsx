"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@/lib/types";
import { useRouter } from "next/navigation";

type AnyListing = Listing & { image?: string; imageUrl?: string };

export default function ListingDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<AnyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [alias, setAlias] = useState("");

  // 1) /api/listings/:id を試し、2) ダメなら /api/listings から該当IDを拾う
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // 1) 直接取得（存在すれば最短）
        const r1 = await fetch(`/api/listings/${params.id}`, { cache: "no-store" });
        if (r1.ok) {
          const j1 = await r1.json().catch(() => ({} as any));
          const got = j1?.item ?? j1?.data?.item ?? j1?.data ?? j1;
          if (got && (got.id === params.id || got.id)) {
            setItem(got);
            setLoading(false);
            return;
          }
        }
        // 2) 一覧から拾う（確実に動くフォールバック）
        const r2 = await fetch(`/api/listings`, { cache: "no-store" });
        const j2 = await r2.json().catch(() => ({} as any));
        const arr: AnyListing[] =
          Array.isArray(j2?.data) ? j2.data :
          Array.isArray(j2?.items) ? j2.items :
          Array.isArray(j2) ? j2 : [];
        const found = arr.find((x) => x.id === params.id) ?? null;
        if (!found) throw new Error("該当IDが見つかりませんでした");
        setItem(found);
      } catch (e: any) {
        setErr(String(e?.message ?? e));
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  // まずは “必ずチャット画面に行ける” 導線にする（部屋生成APIは呼ばない）
  const startChat = () => {
    router.push(`/chat/${params.id}`);
  };

  if (loading) return <div style={{ padding: 16 }}>読み込み中…</div>;
  if (err) return <div style={{ padding: 16, color: "#b91c1c" }}>エラー: {err}</div>;
  if (!item) return <div style={{ padding: 16 }}>見つかりませんでした</div>;

  const img = (item as any).imageUrl ?? (item as any).image ?? "";

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <button onClick={() => router.back()} style={{ marginBottom: 12, fontSize: 14 }}>
        ← 戻る
      </button>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.1fr .9fr" }}>
        {/* 画像 */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
          {img ? (
            <img src={img} alt={item.title} style={{ width: "100%", borderRadius: 8, objectFit: "cover" }} />
          ) : (
            <div style={{ height: 320, borderRadius: 8, background: "#f3f4f6" }} />
          )}
        </div>

        {/* 情報 */}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{item.title}</h1>
          <div style={{ fontSize: 20, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
            ¥{Number(item.price || 0).toLocaleString()}
          </div>
          <div style={{ color: "#6b7280", marginTop: 4, fontSize: 13 }}>
            出品者: {item.sellerAlias ?? "匿名"}
          </div>

          {/* チャット開始（最小導線） */}
          <div style={{ marginTop: 16, border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>購入前に出品者と連絡する</div>
            <input
              placeholder="あなたの表示名（任意）"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", width: "100%", marginBottom: 8 }}
            />
            <button
              onClick={startChat}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #111827",
                background: "#111827",
                color: "#fff",
                fontWeight: 600,
                width: "100%",
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