import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Body = { roomId?: string; message?: string };

export async function POST(req: Request) {
  let body: Body = {};
  try { body = await req.json(); } catch {}
  const roomId = String(body.roomId || "").trim();
  const message = String(body.message || "").trim();

  if (!roomId || !message) {
    return NextResponse.json(
      { ok: false, error: "roomId and message are required" },
      { status: 400 }
    );
  }

  // 1) ユーザー発言を保存
  const saved = await prisma.message.create({
    data: { roomId, role: "me", text: message },
    select: { id: true, createdAt: true },
  });

  // 2) 返信（ここはダミー。後でAIに差し替え）
  const replyText = `受け取りました: ${message}`;

  // 3) 返信も保存
  const savedReply = await prisma.message.create({
    data: { roomId, role: "sys", text: replyText },
    select: { id: true, createdAt: true },
  });

  return NextResponse.json({
    ok: true,
    roomId,
    reply: replyText,
    saved: { id: saved.id, at: saved.createdAt },
    replySaved: { id: savedReply.id, at: savedReply.createdAt },
  });
}