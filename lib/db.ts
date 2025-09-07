// 共通の Prisma クライアント（default export あり）

import { PrismaClient } from "@prisma/client";

declare global {
  // 開発時のHMRで多重生成を防ぐ
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? new PrismaClient();

// 本番ではグローバルに載せない（HMRが無いから）
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;        // ← これが重要（default）
export { prisma };            // もし named import も使いたい場合に備えて