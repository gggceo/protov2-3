// VIP スコア再計算（必要最小限）

import prisma from "@/lib/db";
import fs from "node:fs";

type Rule = { id: string; desc: string; when: string; add_score: number; add_flag?: string };

function loadRules(): Rule[] {
  try {
    const raw = fs.readFileSync(process.cwd() + "/ops/vip_rules.yaml", "utf-8");
    return raw
      .split("\n\n")
      .map(b => {
        const get = (k: string) => (b.match(new RegExp(`^${k}:\\s*(.+?)$`, "m")) || [,""])[1].trim();
        return {
          id: get("id"),
          desc: get("desc"),
          when: get("when"),
          add_score: Number((b.match(/add_score:\s*(\d+)/) || [,"0"])[1]),
          add_flag: (b.match(/add_flag:\s*(.+)/) || [,""])[1] || undefined,
        } as Rule;
      });
  } catch {
    return [];
  }
}

function evalExpr(expr: string, ctx: any): boolean {
  // 極シンプル評価（自己責任ゾーン）
  const e = expr.replace(/&&/g, "&&").replace(/\bnot\b/gi, "!");
  return Function(...Object.keys(ctx), `return (${e});`)(...Object.values(ctx));
}

async function getSignals(alias: string) {
  const listings = await prisma.listing.findMany({ where: { sellerAlias: alias } });
  const prices   = listings.map((l) => l.price);
  const avg_listing_price = prices.length ? prices.reduce((a,b)=>a+b,0)/prices.length : 0;
  const listings_count = listings.length;
  const reports_12m = await prisma.report.count({ where: { targetId: { contains: alias } } });
  const titleAll = listings.map(l=>l.title).join(" ").toLowerCase();
  const tag_ratio_miku = titleAll.includes("miku") || titleAll.includes("ミク") ? 1 : 0;

  return { avg_listing_price, listings_count, tag_ratio_miku, reports_12m };
}

export async function recalcVip(alias: string) {
  const rules = loadRules();
  const sig = await getSignals(alias);
  let score = 0;
  const flags: string[] = [];

  for (const r of rules) {
    try {
      if (r.when && evalExpr(r.when, sig)) {
        score += r.add_score || 0;
        if (r.add_flag) flags.push(r.add_flag);
      }
    } catch {}
  }

  let tier: "NONE"|"SILVER"|"GOLD"|"PLATINUM" = "NONE";
  if (score >= 80) tier = "PLATINUM";
  else if (score >= 60) tier = "GOLD";
  else if (score >= 40) tier = "SILVER";

  await prisma.user.upsert({
    where:  { alias },
    update: { vipScore: score, vipFlags: flags, vipTier: tier },
    create: { alias,    vipScore: score, vipFlags: flags, vipTier: tier },
  });

  return { alias, score, flags, tier, signals: sig };
}

export default recalcVip;   // ← default を追加