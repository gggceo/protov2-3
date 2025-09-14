"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/ListingCard";
import Revealer from "@/components/Revealer";
import type { Listing } from "@/lib/types";

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [posting, setPosting] = useState(false);

  // 一覧を取得
  async function fetchListings() {
    setLoading(true);
    try {
      const res = await fetch("/api/listings");
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchListings();
  }, []);

  // 出品処理
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: Number(price),
          imageUrl,
        }),
      });
      if (res.ok) {
        setTitle("");
        setPrice("");
        setImageUrl("");
        fetchListings();

        // ✅ お祝いホロ演出（2秒だけ hologram に切り替え）
        document.body.dataset.bg = "holo";
        setTimeout(() => {
          document.body.dataset.bg =
            (localStorage.getItem("bg_theme") as any) || "lux";
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
    setPosting(false);
  }

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        出品フォーム
      </h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: 12,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fff",
          marginBottom: 28,
        }}
      >
        <input
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <input
          type="number"
          placeholder="価格 (円)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <input
          type="url"
          placeholder="画像URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <button
          type="submit"
          className="pressable ease-std motion-fast"
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "#111827",
            color: "#fff",
            fontWeight: 600,
            border: "none",
          }}
        >
          {posting ? "出品中..." : "出品する"}
        </button>
      </form>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
        出品一覧
      </h2>

      <div
        style={{
          display: "grid",
          gap: 18,
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          paddingBlock: 8,
        }}
      >
        {loading ? (
          <div>読み込み中...</div>
        ) : listings.length === 0 ? (
          <div>まだ商品がありません。上のフォームから出品してみましょう。</div>
        ) : (
          listings.map((it, idx) => (
            <Revealer key={it.id}>
              <div style={{ transitionDelay: `${idx * 30}ms` }}>
                <ListingCard item={it} />
              </div>
            </Revealer>
          ))
        )}
      </div>
    </main>
  );
}