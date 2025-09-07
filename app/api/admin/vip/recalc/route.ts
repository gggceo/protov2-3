import prisma from "@/lib/db";
import { recalcvip } from "@/lib/vip";
export async function POST(req: Request) {
  if ((req.headers.get("x-admin-key")||"") !== process.env.ADMIN_KEY) return new Response("forbidden",{status:403});
  const { alias } = await req.json(); if (!alias) return new Response("alias required",{status:400});
  const result = await recalcVip(alias);
  return Response.json({ ok: true, result });
}