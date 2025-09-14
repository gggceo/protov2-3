// app/api/chat/send/route.ts
import { NextResponse } from "next/server";

// 重要: ランタイム/キャッシュを固定して不安定要因を排除
export const runtime = "nodejs";        // Edge で落ちる場合に備えて Node を強制
export const dynamic = "force-dynamic"; // ルートを常に動的実行
export const revalidate = 0;            // キャッシュしない

// 単純に「生きている」ことだけ返す
export async function GET() {
  console.log("[/api/chat/send] GET ping");
  return NextResponse.json({ ok: true, method: "GET", ping: "pong" });
}

// POST でも固定レスポンス（ボディは一切読まない）
export async function POST() {
  console.log("[/api/chat/send] POST ping");
  return NextResponse.json({ ok: true, method: "POST", ping: "pong" });
}