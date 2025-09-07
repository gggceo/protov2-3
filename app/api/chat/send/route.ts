import { NextRequest } from "next/server";
import prisma from '../../../../lib/db';
import containsPII from '../../../../lib/pii';

// 超簡易レート制限（1分に10回まで）
const hits: Record<string, { count: number; ts: number }> = {};
const WINDOW_MS = 60_000;
const MAX_HITS = 10;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-real-ip")
    || req.headers.get("x-forwarded-for")
    || "unknown";
  const now = Date.now();
  const h = hits[ip] || { count: 0, ts: now };
  if (now - h.ts > WINDOW_MS) hits[ip] = { count: 0, ts: now };
  hits[ip].count++;
  if (hits[ip].count > MAX_HITS) {
    return Response.json({ error: "送信が多すぎます。しばらくしてからお試しください。" }, { status: 429 });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}
  const { roomId, message, ref } = body || {};
  if (!roomId || !message) {
    return Response.json({ error: "roomId と message は必須です。" }, { status: 400 });
  }

  const reason = containsPII(message);
  if (reason) {
    return Response.json({ error: `個人情報（${reason}）は送信できません。` }, { status: 400 });
  }

  // DB保存（失敗してもユーザーにはエラーを返さない）
  try {
    await prisma.message.create({ data: { roomId: String(roomId), body: message, ref: ref || null } });
  } catch {}

  // ここでは“デモ返信”を返す（通知連携は後で）
  return Response.json({ ok: true, reply: "メッセージを受け付けました（デモ）。出品者へ通知します。" });
}