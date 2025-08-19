import { PrismaClient } from "@prisma/client";

// 全局 Prisma Client 单例，避免在开发环境的热更新中创建多个实例
// 参考: https://pris.ly/d/help/next-js-best-practices

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // eslint-disable-next-line no-var
  var __prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.__prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;
