import { NextResponse } from "next/server";
const API_BASE = process.env.API_BASE!;
const ADMIN_KEY = process.env.ADMIN_KEY!;

export async function GET(_req: Request, { params }: { params: { roomId: string } }) {
  const r = await fetch(`${API_BASE}/chat/${params.roomId}`, {
    headers: { "x-admin-key": ADMIN_KEY },
    cache: "no-store",
  });
  const data = await r.json();               // { messages: [...] } など想定
  const messages = data?.data ?? data?.messages ?? data ?? [];
  return NextResponse.json({ ok: true, messages });
}

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  const body = await req.json();             // { text, alias? }
  const r = await fetch(`${API_BASE}/chat/${params.roomId}`, {
    method: "POST",
    headers: { "content-type":"application/json", "x-admin-key": ADMIN_KEY },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return NextResponse.json({ ok: true, data });
}