// app/api/chat/send/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, message } = body;

    // ダミーで即レスポンス
    return NextResponse.json({
      ok: true,
      reply: `受け取りました: ${message}`,
      roomId,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "server error" },
      { status: 500 }
    );
  }
}