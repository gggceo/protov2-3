import { NextResponse } from "next/server";
const API_BASE = process.env.API_BASE!;
const ADMIN_KEY = process.env.ADMIN_KEY!;

export async function POST(req: Request) {
  const body = await req.json(); // { listingId, buyerAlias? }
  const r = await fetch(`${API_BASE}/chat/start`, {
    method: "POST",
    headers: { "content-type":"application/json", "x-admin-key": ADMIN_KEY },
    body: JSON.stringify(body),
  });
  const data = await r.json();   // { roomId, ... } 想定
  const roomId = data?.roomId ?? data?.data?.roomId;
  return NextResponse.json({ ok: !!roomId, roomId, data });
}