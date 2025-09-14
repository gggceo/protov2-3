import "./globals.css";
import type { Metadata } from "next";
import DynamicBg from "@/components/DynamicBg";

export const metadata: Metadata = {
  title: "Proto v2",
  description: "匿名出品マーケットプレイス (Proto v2)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        {children}
        <DynamicBg /> {/* 背景の上品な動き + 裏メニュー/隠しジェスチャ */}
      </body>
    </html>
  );
}