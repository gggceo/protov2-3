import { NextRequest } from "next/server";
import prisma from '../../../../lib/db';

const hits: Record<string,{count:number;ts:number}> = {};
const WINDOW_MS = 60_000, MAX_HITS = 8;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const h = hits[ip] || { count: 0, ts: now };
  if (now - h.ts > WINDOW_MS) hits[ip] = { count: 0, ts: now };
  if (++hits[ip].count > MAX_HITS) return new Response("Too many requests",{status:429});

  const { title, price, sellerAlias, image } = await req.json().catch(()=>({}));
  if (!title || !price || !sellerAlias) return new Response("bad request",{status:400});
  if (String(title).length > 120) return new Response("title too long",{status:400});
  const p = Number(price); if (!Number.isFinite(p) || p <= 0) return new Response("invalid price",{status:400});

  const item = await prisma.listing.create({ data: { title, price:p, sellerAlias, image: image||null } });

  // ユーザーをupsert & 簡易VIP再計算（重たくない範囲で）
  await prisma.user.upsert({ where:{ alias:sellerAlias }, update:{}, create:{ alias:sellerAlias }});
  try { (await import("@/lib/vip")).recalcVip(sellerAlias); } catch {}

  return Response.json({ ok: true, item });
}