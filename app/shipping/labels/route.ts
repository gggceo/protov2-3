import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    provider: "mock",
    label_png_url: "https://dummyimage.com/600x300/000/fff.png&text=Label",
    label_pdf_url: "https://example.com/mock.pdf"
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    provider: "mock",
    request: body,
    label_png_url: "https://dummyimage.com/600x300/000/fff.png&text=Label",
    created_at: new Date().toISOString()
  });
}