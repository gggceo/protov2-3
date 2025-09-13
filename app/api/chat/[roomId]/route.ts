import { NextResponse } from "next/server";
const API_BASE = process.env.API_BASE!;
const ADMIN_KEY = process.env.ADMIN_KEY!;

// GET /api/chat/:roomId → backend: GET /chat/:roomId（なければ空配列）
export async function GET(_req: Request, { params }: { params: { roomId: string } }) {
  let data: any = [];
  try {
    const r = await fetch(`${API_BASE}/chat/${params.roomId}`, {
      headers: { "x-admin-key": ADMIN_KEY },
      cache: "no-store",
    });
    const text = await r.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = [];
    }
    if (!r.ok) data = [];
  } catch {
    data = [];
  }

  const messages =
    Array.isArray(data?.messages) ? data.messages :
    Array.isArray(data?.data) ? data.data :
    Array.isArray(data) ? data : [];

  return NextResponse.json({ ok: true, messages });
}