// server/api/pai-pan/history.get.ts
// import { PrismaClient } from '@prisma/client' // ESM/CJS interop issue
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // 1. 获取 URL 查询参数
  const query = getQuery(event);
  const id = parseInt(query.id as string, 10);

  // 2. 验证参数
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID 无效",
    });
  }

  try {
    // 3. 查询数据库
    const record = await prisma.paiPan.findUnique({
      where: {
        id: id,
      },
    });

    // 4. 处理未找到的情况
    if (!record) {
      throw createError({
        statusCode: 404,
        statusMessage: "未找到该记录",
      });
    }

    // 5. 返回完整的记录数据
    // record.result 是一个 JSON 对象，我们把它和 record 的其他字段合并返回
    // record.result 是一个 JSON 字符串，需要先解析
    // Prisma 已自动解析 JSON 字段，但我们需要验证它是一个对象
    if (typeof record.result !== "object" || record.result === null) {
      throw createError({
        statusCode: 500,
        statusMessage: "数据库中存储的排盘结果格式不正确",
      });
    }
    const result_json = record.result;

    return {
      id: record.id,
      year: record.year,
      month: record.month,
      day: record.day,
      hour: record.hour,
      ...result_json, // 将解析后的 JSON 结果展开
    };
  } catch (error: any) {
    // 如果是自己抛出的 error，重新抛出
    if (error.statusCode) {
      throw error;
    }
    // 其他数据库错误
    console.error("查询历史记录失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
