import Stripe from "stripe";
export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ ok:true, mock:true, info:"Stripe未設定のためモック成功とします"}, { status: 200 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" as any });
  const form = await req.formData();
  const title = String(form.get("title") || "Item");
  const price = Number(form.get("price") || 1000);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price_data:{ currency:"jpy", unit_amount: price, product_data:{ name: title } }, quantity:1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/anime/figures`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/anime/figures`,
  });
  return Response.redirect(session.url!, 303);
}