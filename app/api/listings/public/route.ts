import prisma from "../../../../lib/db";

const hits: Record<string, { count: number; ts: number }> = {};
const WINDOW_MS = 60_000; // 1分
const MAX_HITS = 8;

export async function POST(req: Request) {
  // ---- レートリミット処理 ----
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for") ||
    "unknown";

  const now = Date.now();
  let h = hits[ip] ?? (hits[ip] = { count: 0, ts: now });
  if (now - h.ts > WINDOW_MS) h = (hits[ip] = { count: 0, ts: now });
  if (++h.count > MAX_HITS) {
    return new Response("Too many requests", { status: 429 });
  }

  // ---- リクエストボディの検証 ----
  const { title, price, sellerAlias, image } = await req.json().catch(() => ({}));
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

  await prisma.user.upsert({
    where: { alias: sellerAlias },
    update: {},
    create: { alias: sellerAlias },
  });

  // ---- VIP再計算（import を POST 内に移動）----
  try {
    const mod = await import("../../../../lib/vip");
    await mod.recalcVip(sellerAlias);
  } catch {}

  return Response.json({ ok: true, item });
}