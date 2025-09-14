"use client";

import { useEffect, useState } from "react";

/**
 * 上品に動く背景。
 * - data-theme で配色を切替（"lux", "paper", "holo"）
 * - iOS/低速端末では負荷を抑制
 * - prefers-reduced-motion で自動停止
 */
export default function DynamicBg() {
  const [theme, setTheme] = useState<"lux" | "paper" | "holo">(
    (typeof window !== "undefined" && (localStorage.getItem("bg_theme") as any)) || "lux"
  );

  // テーマ切替を body 属性に反映
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.dataset.bg = theme;
      localStorage.setItem("bg_theme", theme);
    }
  }, [theme]);

  // 低性能端末では paper にフォールバック（省エネ）
  useEffect(() => {
    const isLowEnd =
      typeof navigator !== "undefined" &&
      // 手がかり：古いiOS/Android、メモリ少ない端末など
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    if (isLowEnd && theme === "holo") setTheme("paper");
  }, [theme]);

  // 裏メニューなどから呼べるよう最小UI（非表示でもOK）
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    >
      {/* ノイズ層（ごく薄い紙質感） */}
      <div className="bg-noise" />
      {/* グラデ層（テーマで色と動きが変わる） */}
      <div className="bg-gradient-anim" />
      {/* ビネット（四隅をわずかに落とす） */}
      <div className="bg-vignette" />

      {/* 参考: デバッグ用の極小スイッチ（必要なら表示） */}
      {/* <div style={{position:"fixed", right:8, bottom:8, display:"flex", gap:6}}>
        {(["lux","paper","holo"] as const).map(k=>(
          <button key={k} onClick={()=>setTheme(k)} style={{padding:"6px 8px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff"}}>{k}</button>
        ))}
      </div> */}
    </div>
  );
}