import { prisma } from '../../../../lib/db';
export async function POST(req: Request) {
  if ((req.headers.get("x-admin-key")||"") !== process.env.ADMIN_KEY) return new Response("forbidden",{status:403});
  const { alias, score, tier, flags } = await req.json();
  if (!alias) return new Response("alias required",{status:400});
  const data:any = {};
  if (typeof score==="number") data.vipScore = score;
  if (tier) data.vipTier = tier;
  if (Array.isArray(flags)) data.vipFlags = flags;
  await prisma.user.upsert({ where:{alias}, update:data, create:{ alias, vipScore:data.vipScore||0, vipTier:data.vipTier||"NONE", vipFlags:data.vipFlags||[] }});
  return Response.json({ ok: true });
}