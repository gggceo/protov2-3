import { prisma } from "@/lib/db";
import fs from "node:fs";

type Rule = { id:string; desc:string; when:string; add_score:number; add_flag:string };

function loadRules(): Rule[] {
  try {
    const raw = fs.readFileSync(process.cwd() + "/ops/vip_rules.yaml", "utf-8");
    const blocks = raw.split("- id:").slice(1);
    return blocks.map(b => {
      const get = (k:string) => (b.match(new RegExp(`${k}:\\s*"(.*?)"`)) || [])[1];
      return {
        id: (b.split("\n")[0]||"").trim(),
        desc: get("desc") || "",
        when: get("when") || "",
        add_score: Number((b.match(/add_score:\s*(\d+)/)||[])[1]||0),
        add_flag: get("add_flag") || ""
      } as Rule;
    });
  } catch { return []; }
}

async function getSignals(alias: string) {
  const listings = await prisma.listing.findMany({ where: { sellerAlias: alias }});
  const prices = listings.map(l => l.price);
  const avg_listing_price = prices.length ? prices.reduce((a,b)=>a+b,0)/prices.length : 0;
  const listings_count = listings.length;
  const reports_12m = await prisma.report.count({ where: { targetId: { contains: alias } } });

  const titleAll = listings.map(l=>l.title).join(" ").toLowerCase();
  const tag_ratio_miku = titleAll.includes("miku") || titleAll.includes("初音") ? 0.5 : 0.0;

  return { avg_listing_price, listings_count, tag_ratio_miku, reports_12m };
}

function evalExpr(expr: string, ctx: any): boolean {
  const e = expr.replace(/&&/g,"&&").replace(/\band\b/gi,"&&").replace(/\bor\b/gi,"||");
  return Function(...Object.keys(ctx), `return (${e});`)(...Object.values(ctx));
}

export async function recalcVip(alias: string) {
  const rules = loadRules();
  const sig = await getSignals(alias);
  let score = 0; const flags: string[] = [];
  for (const r of rules) { try { if (evalExpr(r.when, sig)) { score += r.add_score; flags.push(r.add_flag); } } catch {} }

  let tier: "NONE"|"SILVER"|"GOLD"|"PLATINUM" = "NONE";
  if (score >= 80) tier = "PLATINUM"; else if (score >= 60) tier = "GOLD"; else if (score >= 40) tier = "SILVER";

  await prisma.user.upsert({
    where: { alias },
    update: { vipScore: score, vipFlags: flags, vipTier: tier },
    create: { alias, vipScore: score, vipFlags: flags, vipTier: tier },
  });

  return { alias, score, flags, tier, signals: sig };
}