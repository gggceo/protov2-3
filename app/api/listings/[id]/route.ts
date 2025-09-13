import { NextResponse } from "next/server";
const API_BASE = process.env.API_BASE!;
const ADMIN_KEY = process.env.ADMIN_KEY!;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  // listings / listing どちらでも試す
  let r = await fetch(`${API_BASE}/listings/${params.id}`, {
    headers: { "x-admin-key": ADMIN_KEY },
    cache: "no-store",
  });

  // 404や失敗なら fallback で /listing/ にトライ
  if (!r.ok) {
    r = await fetch(`${API_BASE}/listing/${params.id}`, {
      headers: { "x-admin-key": ADMIN_KEY },
      cache: "no-store",
    });
  }

  const text = await r.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!r.ok) {
    return NextResponse.json(
      { ok: false, status: r.status, error: data?.detail ?? data },
      { status: r.status }
    );
  }

  // item / data / data.item / raw に対応
  const item = data?.item ?? data?.data?.item ?? data?.data ?? data;
  return NextResponse.json({ ok: true, item });
}