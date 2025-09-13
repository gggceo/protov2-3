"use client";

import { useState } from "react";
import Link from "next/link";
import type { Listing } from "@/lib/types";

export default function ListingCard({ item }: { item: Listing }) {
  const [loaded, setLoaded] = useState(false);

  // backendが imageUrl ではなく image を返す場合にも対応
  const img = (item as any)?.imageUrl ?? (item as any)?.image ?? "";

  return (
    <Link
      href={`/listing/${item.id}`}
      className="card"
      style={{
        display: "block",
        padding: 14,
        border: "1px solid #eee",
        borderRadius: 14,
        background: "#fff",
        transition: "transform 180ms ease, box-shadow 200ms ease, border-color 200ms ease",
      }}
    >
      {/* 画像 */}
      <div style={{ aspectRatio: "4/3", overflow: "hidden", borderRadius: 10, background: "#fafafa" }}>
        {img ? (
          <img
            src={img}
            alt={item.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: loaded ? 1 : 0,
              transition: "opacity 200ms ease",
              display: "block",
            }}
            onLoad={() => setLoaded(true)}
            loading="lazy"
          />
        ) : null}
      </div>

      {/* タイトル */}
      <h3 style={{ marginTop: 10, fontWeight: 600, letterSpacing: 0.2, lineHeight: 1.3 }}>
        {item.title}
      </h3>

      {/* 価格 */}
      <div style={{ color: "#111827", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
        ¥{Number(item.price || 0).toLocaleString()}
      </div>

      {/* 出品者 */}
      <div style={{ color: "#6b7280", marginTop: 2, fontSize: 12 }}>
        {item.sellerAlias ?? "匿名"}
      </div>
    </Link>
  );
}