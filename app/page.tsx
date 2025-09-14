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
  const [err, setErr] = useState<string | null>(null);

  // 一覧を取得
  async function fetchListings() {
    setLoading(true);
    try {
      const res = await fetch("/api/listings");
      if (res.ok) {
        const data = await res.json();
        const arr: Listing[] =
          Array.isArray(data) ? data :
          Array.isArray(data.items) ? data.items :
          [];
        setListings(arr);
      }
    } catch (e) {
      console.error("fetchListings error", e);
      setListings([]);
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
    setErr(null);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: Number(price),
          image: imageUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      setTitle("");
      setPrice("");
      setImageUrl("");
      await fetchListings();

      // ✅ お祝いホロ
      document.body.dataset.bg = "holo";
      setTimeout(() => {
        document.body.dataset.bg =
          (localStorage.getItem("bg_theme") as any) || "lux";
      }, 2000);
    } catch (e: any) {
      setErr(String(e.message || e));
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
        />
        <input
          type="number"
          placeholder="価格 (円)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="url"
          placeholder="画像URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button type="submit" disabled={posting}>
          {posting ? "出品中..." : "出品する"}
        </button>
        {err && <p style={{ color: "red" }}>エラー: {err}</p>}
      </form>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
        出品一覧
      </h2>

      <div
        style={{
          display: "grid",
          gap: 18,
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        }}
      >
        {loading ? (
          <div>読み込み中...</div>
        ) : listings.length === 0 ? (
          <div>まだ商品がありません。</div>
        ) : (
          listings.map((it, idx) =>
            it?.id ? (
              <Revealer key={it.id}>
                <div style={{ transitionDelay: `${idx * 30}ms` }}>
                  <ListingCard item={it} />
                </div>
              </Revealer>
            ) : null
          )
        )}
      </div>
    </main>
  );
}