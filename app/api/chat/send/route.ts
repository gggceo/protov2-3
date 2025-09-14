import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, message } = body;

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "メッセージが空です" },
        { status: 400 }
      );
    }

    // 💡 まずはデモ用に受け取ったものをそのまま返す
    return NextResponse.json({
      ok: true,
      roomId,
      reply: `受け取りました: ${message}`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || "サーバーエラー" },
      { status: 500 }
    );
  }
}