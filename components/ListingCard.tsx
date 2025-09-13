"use client";
import { Listing } from "@/lib/types";
import { useState } from "react";

export default function ListingCard({ item }: { item: Listing }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <article
      style={{
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 14,
        background: "#fff",
        transition: "transform 180ms ease, box-shadow 200ms ease, border-color 200ms",
        boxShadow: "0 0 0 rgba(0,0,0,0)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget.style.transform = "translateY(-2px) scale(1.01)");
        (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)");
        (e.currentTarget.style.borderColor = "#e5e7eb");
      }}
      onMouseLeave={(e) => {
        (e.currentTarget.style.transform = "none");
        (e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)");
        (e.currentTarget.style.borderColor = "#eee");
      }}
    >
      {/* 画像部分 */}
      <div style={{ aspectRatio: "4/3", overflow: "hidden", borderRadius: 10, background: "#fafafa" }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: loaded ? 1 : 0,
              transition: "opacity 200ms ease",
            }}
            onLoad={() => setLoaded(true)}
          />
        ) : null}
      </div>

      {/* タイトル */}
      <h3 style={{ marginTop: 10, fontWeight: 600, letterSpacing: 0.2 }}>
        {item.title}
      </h3>

      {/* 価格 */}
      <div
        style={{
          color: "#111827",
          marginTop: 4,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        ¥{Number(item.price || 0).toLocaleString()}
      </div>

      {/* 出品者エイリアス */}
      <div style={{ color: "#6b7280", marginTop: 2, fontSize: 12 }}>
        {item.sellerAlias ?? "匿名"}
      </div>
    </article>
  );
}