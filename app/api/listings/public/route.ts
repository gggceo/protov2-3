import prisma from "@/lib/db";

// 簡易レートリミット（同一IPで短時間の連投を防ぐ）
const hits: Record<string, { count: number; ts: number }> = {};
const WINDOW_MS = 60_000; // 1分
const MAX_HITS = 8;

export async function POST(req: Request) {
  // ---- レートリミット ----
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for") ||
    "unknown";

  const now = Date.now();
  const h = hits[ip] ?? (hits[ip] = { count: 0, ts: now });
  if (now - h.ts > WINDOW_MS) hits[ip] = { count: 0, ts: now };
  if (++hits[ip].count > MAX_HITS) {
    return new Response("Too many requests", { status: 429 });
  }

  // ---- リクエストボディの取得と検証 ----
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // 何も来ていない/JSONでない
  }

  const { title, price, sellerAlias, image } = body || {};
  if (!title || !price || !sellerAlias) {
    return new Response("bad request", { status: 400 });
  }
  if (String(title).length > 120) {
    return new Response("title too long", { status: 400 });
  }
  const p = Number(price);
  if (!Number.isFinite(p) || p <= 0) {
    return new Response("invalid price", { status: 400 });
  }

  // ---- DB登録 ----
  const item = await prisma.listing.create({
    data: { title, price: p, sellerAlias, image: image || null },
  });

  // ユーザーを upsert（存在しなければ作成）
  await prisma.user.upsert({
    where: { alias: sellerAlias },
    update: {},
    create: { alias: sellerAlias },
  });

  // ---- VIP 再計算（動的 import）----
  try {
    const mod = await import("@/lib/vip");
    await mod.recalcVip(sellerAlias);
  } catch {
    // 再計算は失敗しても API 全体は落とさない
  }

  return Response.json({ ok: true, item });
}