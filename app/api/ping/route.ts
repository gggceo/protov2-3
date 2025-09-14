// app/api/ping/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";        // Edge事故を避ける
export const dynamic = "force-dynamic"; // 常に動的
export const revalidate = 0;            // キャッシュ無効

export async function GET() {
  console.log("[/api/ping] GET");
  return NextResponse.json({ ok: true, method: "GET", from: "/api/ping" });
}

export async function POST() {
  console.log("[/api/ping] POST");
  return NextResponse.json({ ok: true, method: "POST", from: "/api/ping" });
}