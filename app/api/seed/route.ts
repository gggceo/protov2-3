import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (key !== process.env.ADMIN_KEY) return new Response("forbidden", { status: 403 });

  const item = await prisma.listing.create({
    data: { title: "Megumin 1/7", price: 12800, sellerAlias: "@akiba_store", image: "/og.png" }
  });
  return Response.json({ ok: true, item });
}