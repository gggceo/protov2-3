import { PrismaClient } from "@prisma/client";

// HMR対策（多重接続防止）
const g = global as any;
export const prisma: PrismaClient = g.prisma || new PrismaClient();
if (!g.prisma) g.prisma = prisma;