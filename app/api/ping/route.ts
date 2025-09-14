// app/api/ping/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  console.log("[/api/ping] GET");
  return NextResponse.json({ ok: true, from: "GET /api/ping" });
}

export async function POST() {
  console.log("[/api/ping] POST");
  return NextResponse.json({ ok: true, from: "POST /api/ping" });
}