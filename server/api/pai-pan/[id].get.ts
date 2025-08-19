// server/api/pai-pan/[id].get.ts
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

  // 2. 从路由参数中获取 id
  const id = event.context.params?.id;
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少必要的ID参数",
    });
  }

  try {
    // 3. 查询单个记录的完整结果
    const record = await prisma.paiPan.findUnique({
      where: {
        id: Number(id),
        userId: user.userId, // 核心安全检查：确保只能查询到自己的记录
      },
    });

    // 4. 如果记录不存在或不属于该用户，返回404
    if (!record) {
      throw createError({
        statusCode: 404,
        statusMessage: "找不到该条记录",
      });
    }

    // 5. 返回存储在 result 字段的完整 JSON 数据
    // @ts-ignore
    return record.result;
  } catch (error: any) {
    // 处理 Prisma 错误或其他意外错误
    if (!error.statusCode) {
      console.error("查询单条记录失败:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "服务器内部错误",
      });
    }
    // 重新抛出已定义的 HTTP 错误 (如404)
    throw error;
  }
});
