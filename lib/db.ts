// 共通の Prisma クライアント
import { PrismaClient } from "@prisma/client";

declare global {
  // 開発時に HMR で複数生成されるのを防ぐ
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// ✅ default export を必ず使う
export default prisma;