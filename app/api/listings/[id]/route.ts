import { NextResponse } from "next/server";
const API_BASE = process.env.API_BASE!;
const ADMIN_KEY = process.env.ADMIN_KEY!;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const r = await fetch(`${API_BASE}/listings/${params.id}`, {
    headers: { "x-admin-key": ADMIN_KEY },
    cache: "no-store",
  });
  const data = await r.json();
  // 返却形の揺れを吸収（data / item / 直返し）
  const item = data?.data ?? data?.item ?? data;
  return NextResponse.json({ ok: true, item });
}