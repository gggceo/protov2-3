import { NextResponse } from "next/server";
const API_BASE = process.env.API_BASE!;
const ADMIN_KEY = process.env.ADMIN_KEY!;

export async function GET() {
  const r = await fetch(`${API_BASE}/listings`, {
    headers: { "x-admin-key": ADMIN_KEY },
    cache: "no-store",
  });
  const data = await r.json().catch(() => ({}));
  // そのまま返す（page.tsx側で data/items/配列 を吸収）
  return NextResponse.json(data, { status: r.status });
}

export async function POST(req: Request) {
  const body = await req.json();
  const r = await fetch(`${API_BASE}/listings`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-admin-key": ADMIN_KEY,
    },
    body: JSON.stringify(body),
  });

  // エラーでも中身をそのまま返す（原因が見える）
  const text = await r.text();
  let data: any; try { data = JSON.parse(text); } catch { data = text; }
  return NextResponse.json(
    data ?? { error: "no response" },
    { status: r.status }
  );
}