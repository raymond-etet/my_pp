// server/api/pai-pan/history.get.ts
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  // 1. 检查用户是否登录
  const user = event.context.user;
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "用户未登录",
    });
  }

  try {
    // 2. 查询当前用户的所有排盘记录
    const historyRecords = await prisma.paiPan.findMany({
      where: {
        userId: user.userId, // 只查找属于当前用户的记录
      },
      select: {
        id: true,
        year: true,
        month: true,
        day: true,
        hour: true,
        gender: true,
        result: true, // 包含完整的排盘结果数据
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc", // 按创建时间降序排序
      },
    });

    // 3. 返回历史记录列表
    return historyRecords;
  } catch (error: any) {
    console.error("查询历史记录失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误，查询历史记录失败",
    });
  }
});
