import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const items = await prisma.listing.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json({ items });
  } catch {
    // DB未設定でもページが見えるようモック返却
    return Response.json({
      items: [
        { id: "1", title: "Nendoroid 兵長", price: 6800, sellerAlias: "@levi_jp", image: "/og.png" },
        { id: "2", title: "RG νガンダム",  price: 4200, sellerAlias: "@gunpla_tokyo", image: "/og.png" }
      ]
    });
  }
}

export async function POST(req: NextRequest) {
  const adminKey = process.env.ADMIN_KEY;
  const auth = req.headers.get("x-admin-key");
  if (!adminKey || auth !== adminKey) return new Response("forbidden", { status: 403 });

  const { title, price, sellerAlias, image } = await req.json();
  if (!title || !price || !sellerAlias) return new Response("bad request", { status: 400 });

  const item = await prisma.listing.create({
    data: { title, price: Number(price), sellerAlias, image }
  });
  return Response.json({ item });
}