import prisma from "@/lib/db";
import fs from "node:fs";

type Rule = { id: string; desc: string; when: string; add_score: number; add_flag: string };

function loadRules(): Rule[] {
  try {
    const raw = fs.readFileSync(process.cwd() + "/ops/vip_rules.yaml", "utf-8");
    return raw.split("\n\n").map((b) => {
      const get = (k: string) => (b.match(new RegExp(`^${k}:\\s*(.+)`, "m")) || [])[1] || "";
      return {
        id: get("id"),
        desc: get("desc"),
        when: get("when"),
        add_score: Number((b.match(/add_score:\s*(\d+)/) || [])[1]) || 0,
        add_flag: (b.match(/add_flag:\s*(.+)/) || [])[1] || "",
      } as Rule;
    });
  } catch {
    return [];
  }
}

export async function recalcVip(alias: string) {
  const rules = loadRules();

  // ここで計算ロジックを実行
  const listings = await prisma.listing.findMany({ where: { sellerAlias: alias } });
  const listings_count = listings.length;

  let score = 0;
  for (const r of rules) {
    if (r.when && listings_count > 0) {
      score += r.add_score;
    }
  }

  const tier = score > 60 ? "GOLD" : "NONE";

  await prisma.user.upsert({
    where: { alias },
    update: { vipScore: score, vipTier: tier },
    create: { alias, vipScore: score, vipTier: tier },
  });

  return { alias, score, tier };
}