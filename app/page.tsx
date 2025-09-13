"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/ListingCard";
import type { Listing } from "@/lib/types";

type PostPayload = {
  title: string;
  price: number;
  image?: string;       // ← backend想定に合わせて image を送る
  sellerAlias?: string;
};

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [form, setForm] = useState({
    title: "",
    price: 0 as number | string,
    imageUrl: "",
    sellerAlias: "",
  });
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 一覧取得（返却形の揺れを吸収）
  const reload = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/listings", { cache: "no-store" });
      const json = await res.json();

      const arr: unknown =
        Array.isArray(json?.data) ? json.data :
        Array.isArray(json?.items) ? json.items :
        Array.isArray(json) ? json : [];

      setListings((arr as Listing[]) ?? []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  // 出品
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const title = form.title.trim();
    const price = Number(form.price);
    if (!title || !price) {
      setErr("タイトルと価格は必須です");
      return;
    }

    try {
      setPosting(true);

      const payload: PostPayload = {
        title,
        price,
        image: form.imageUrl?.trim() || undefined,         // ← image で送信
        sellerAlias: form.sellerAlias?.trim() || undefined,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json: any; try { json = JSON.parse(text); } catch { json = { raw: text }; }

      if (!res.ok) {
        const reason =
          json?.detail ?? json?.error ?? json?.message ?? json?.raw ?? "出品に失敗しました";
        throw new Error(typeof reason === "string" ? reason : JSON.stringify(reason));
      }

      const created = json?.item ?? json?.data?.item ?? json?.data ?? json;
      if (!created || !created.id) throw new Error("作成レスポンスの形式が想定外です");

      // 成功：フォーム初期化→再取得
      setForm({ title: "", price: 0, imageUrl: "", sellerAlias: "" });
      await reload();
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Marketplace (Proto)</h1>

      {/* 出品フォーム */}
      <form
        onSubmit={submit}
        style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 12, marginBottom: 16 }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <input
            placeholder="タイトル"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <input
            type="number"
            placeholder="価格（円）"
            value={form.price}
            onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <input
            placeholder="画像URL（任意・フルURL推奨）"
            value={form.imageUrl}
            onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <input
            placeholder="表示名（任意：空なら匿名）"
            value={form.sellerAlias}
            onChange={(e) => setForm((s) => ({ ...s, sellerAlias: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <button
            type="submit"
            disabled={posting}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #111827",
              background: posting ? "#e5e7eb" : "#111827",
              color: posting ? "#111827" : "#fff",
              fontWeight: 600,
            }}
          >
            {posting ? "出品中..." : "出品する"}
          </button>
          {err ? <div style={{ color: "#b91c1c" }}>エラー: {err}</div> : null}
        </div>
      </form>

      {/* 一覧 */}
      <div
        style={{
          display: "grid",
          gap: 18,
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          paddingBlock: 8,
        }}
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
              <div style={{ height: 180, borderRadius: 10, background: "#f4f4f5" }} />
              <div style={{ height: 12, marginTop: 10, background: "#f4f4f5", borderRadius: 6 }} />
              <div style={{ height: 12, marginTop: 6, width: "60%", background: "#f4f4f5", borderRadius: 6 }} />
            </div>
          ))
        ) : listings.length === 0 ? (
          <div>まだ商品がありません。上のフォームから出品してみましょう。</div>
        ) : (
          listings.map((it) => <ListingCard key={it.id} item={it} />)
        )}
      </div>
    </div>
  );
}