"use client";
import { useEffect, useRef } from "react";

/** ビューポートに入ったら .is-in を付与して入場モーション */
export default function Revealer({ children, once=true }: { children: React.ReactNode; once?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.classList.add("reveal");
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("is-in"); if (once) io.disconnect(); }
      else if (!once) { el.classList.remove("is-in"); }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  return <div ref={ref}>{children}</div>;
}