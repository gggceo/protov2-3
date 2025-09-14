// app/api/chat/send/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();   // JSON をそのまま受け取る
    return NextResponse.json({
      ok: true,
      echo: body,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "server error" },
      { status: 500 }
    );
  }
}