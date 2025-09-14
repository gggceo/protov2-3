"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 上品に動く背景 + 裏メニュー（隠しジェスチャ）
 * - テーマ: "lux" | "paper" | "holo"
 * - モバイル/タブレット: 2本指ロングプレス / トリプルタップ / ↘︎↗︎↙︎ スワイプ
 * - PC: Ctrl+Alt+H
 * - URL ?bg=lux|paper|holo|off で一時上書き
 */
export default function DynamicBg() {
  const [theme, setTheme] = useState<"lux" | "paper" | "holo">(
    (typeof window !== "undefined" && (localStorage.getItem("bg_theme") as any)) || "lux"
  );
  const [showMenu, setShowMenu] = useState<boolean>(
    typeof window !== "undefined" ? localStorage.getItem("bg_show") === "1" : false
  );

  // URLクエリで一時上書き
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("bg");
    if (!q) return;
    if (q === "off") {
      setShowMenu(false);
      document.body.dataset.bg = "paper";
      return;
    }
    if (q === "lux" || q === "paper" || q === "holo") {
      setTheme(q);
      setShowMenu(true);
    }
  }, []);

  // テーマ反映/保存
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.dataset.bg = theme;
      localStorage.setItem("bg_theme", theme);
    }
  }, [theme]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bg_show", showMenu ? "1" : "0");
    }
  }, [showMenu]);

  // 低性能端末では holo → paper
  useEffect(() => {
    const isLowEnd =
      typeof navigator !== "undefined" &&
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    if (isLowEnd && theme === "holo") setTheme("paper");
  }, [theme]);

  // —— 隠しジェスチャ：2本指ロングプレス（右下）
  const pressTimer = useRef<number | null>(null);
  const activeTouches = useRef<number>(0);

  function isInCorner(ev: PointerEvent | TouchEvent) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 72;
    const pt =
      "touches" in ev && ev.touches[0]
        ? { x: ev.touches[0].clientX, y: ev.touches[0].clientY }
        : "clientX" in (ev as any)
        ? { x: (ev as any).clientX, y: (ev as any).clientY }
        : { x: 0, y: 0 };
    return pt.x > vw - margin && pt.y > vh - margin;
  }

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      activeTouches.current = Math.max(activeTouches.current, 1);
      if (isInCorner(e)) {
        if (pressTimer.current) window.clearTimeout(pressTimer.current);
        pressTimer.current = window.setTimeout(() => {
          if (activeTouches.current >= 2) toggleMenu(true);
        }, 600);
      }
    }
    function onPointerUp() {
      activeTouches.current = 0;
      if (pressTimer.current) { window.clearTimeout(pressTimer.current); pressTimer.current = null; }
    }
    function onTouchStart(e: TouchEvent) { activeTouches.current = e.touches.length; }
    function onTouchEnd() { activeTouches.current = 0; }
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // —— 隠しジェスチャ：トリプルタップ（1.2s以内）
  const tapCount = useRef(0);
  const tapTimer = useRef<number | null>(null);
  useEffect(() => {
    function onTouchEndTriple() {
      tapCount.current += 1;
      if (tapTimer.current) window.clearTimeout(tapTimer.current);
      tapTimer.current = window.setTimeout(() => { tapCount.current = 0; }, 1200);
      if (tapCount.current >= 3) {
        tapCount.current = 0;
        if (tapTimer.current) { window.clearTimeout(tapTimer.current); tapTimer.current = null; }
        toggleMenu(); // 開閉
      }
    }
    window.addEventListener("touchend", onTouchEndTriple, { passive: true });
    return () => window.removeEventListener("touchend", onTouchEndTriple);
  }, []);

  // —— 隠しジェスチャ：↘︎ ↗︎ ↙︎ スワイプ（3秒以内）
  type Dir = "NE" | "SE" | "SW" | "NW" | "E" | "W" | "N" | "S";
  const swipeSeq = useRef<Dir[]>([]);
  const swipeTimer = useRef<number | null>(null);
  const startPt = useRef<{ x: number; y: number } | null>(null);

  function vecToDir(dx: number, dy: number): Dir {
    const a = Math.atan2(dy, dx);
    const deg = (a * 180) / Math.PI;
    if (deg >= -22.5 && deg < 22.5) return "E";
    if (deg >= 22.5 && deg < 67.5) return "SE";
    if (deg >= 67.5 && deg < 112.5) return "S";
    if (deg >= 112.5 && deg < 157.5) return "SW";
    if (deg >= -67.5 && deg < -22.5) return "NE";
    if (deg >= -112.5 && deg < -67.5) return "N";
    if (deg >= -157.5 && deg < -112.5) return "NW";
    return "W";
  }

  useEffect(() => {
    function resetSwipe() {
      swipeSeq.current = [];
      if (swipeTimer.current) { window.clearTimeout(swipeTimer.current); swipeTimer.current = null; }
    }
    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      startPt.current = { x: t.clientX, y: t.clientY };
      if (swipeTimer.current) window.clearTimeout(swipeTimer.current);
      swipeTimer.current = window.setTimeout(resetSwipe, 3000);
    }
    function onTouchMove(e: TouchEvent) {
      if (!startPt.current) return;
      const t = e.touches[0];
      const dx = t.clientX - startPt.current.x;
      const dy = t.clientY - startPt.current.y;
      const dist2 = dx*dx + dy*dy;
      if (dist2 > 80*80) {
        const d = vecToDir(dx, dy);
        swipeSeq.current.push(d);
        startPt.current = { x: t.clientX, y: t.clientY };
        const want: Dir[] = ["SE","NE","SW"];
        if (swipeSeq.current.slice(-3).join(",") === want.join(",")) {
          resetSwipe(); toggleMenu(true);
        }
      }
    }
    function onTouchEnd(){ startPt.current = null; }
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // —— キーボード（PC）
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === "h" || e.key === "H")) {
        e.preventDefault(); toggleMenu();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleMenu(force?: boolean) {
    setShowMenu((s) => {
      const next = typeof force === "boolean" ? force : !s;
      if (navigator.vibrate) navigator.vibrate(next ? 12 : 8);
      return next;
    });
  }

  function resetAll() {
    try{
      localStorage.removeItem("bg_theme");
      localStorage.removeItem("bg_show");
    }catch{}
    setTheme("lux");
    setShowMenu(false);
    if (typeof document !== "undefined") document.body.dataset.bg = "lux";
  }

  // グロウ位置を追従（hover-glowで使う）
  useEffect(() => {
    function onMove(e: PointerEvent){
      const x = e.clientX, y = e.clientY;
      document.documentElement.style.setProperty("--mx", `${x}px`);
      document.documentElement.style.setProperty("--my", `${y}px`);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div aria-hidden style={{ position:"fixed", inset:0, zIndex:-1, pointerEvents:"none" }}>
      <div className="bg-noise" />
      <div className="bg-gradient-anim" />
      <div className="bg-vignette" />

      {/* 裏メニュー（見つけた人だけ） */}
      {showMenu && (
        <div
          style={{
            position:"fixed", right:8, bottom:8, display:"flex", gap:8, zIndex:9999,
            pointerEvents:"auto",
            background:"rgba(255,255,255,.75)",
            backdropFilter:"saturate(1.1) blur(6px)",
            border:"1px solid rgba(0,0,0,.06)", borderRadius:12, padding:8,
            boxShadow:"0 8px 24px rgba(0,0,0,.08)"
          }}
        >
          {(["lux","paper","holo"] as const).map(k=>(
            <button
              key={k}
              onClick={()=>setTheme(k)}
              className="pressable"
              style={{
                padding:"8px 10px", borderRadius:8, border:"1px solid #e5e7eb",
                background: theme===k ? "#111827" : "#fff",
                color: theme===k ? "#fff" : "#111",
                fontSize:12, fontWeight:600
              }}
            >
              {k}
            </button>
          ))}
          <button onClick={()=>toggleMenu(false)} title="閉じる"
            className="pressable"
            style={{ padding:"8px 10px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", fontSize:12 }}>
            ✕
          </button>
          <button onClick={resetAll} title="Reset"
            className="pressable"
            style={{ padding:"8px 10px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", fontSize:12 }}>
            Reset
          </button>
        </div>
      )}
    </div>
  );
}