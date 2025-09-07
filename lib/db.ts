import { PrismaClient } from "@prisma/client";

declare global {
  // HMR 対応（開発時のみ）
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
export { prisma };