// server/api/pai-pan.post.ts
// import { PrismaClient } from '@prisma/client'; // ESM/CJS interop issue
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import {
  getBaZi,
  getDaYun,
  getLiuNian,
  getCangGan,
  getShiShen,
} from "~/server/utils/paiPan";

// 实例化 Prisma Client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // 1. 从请求体中获取参数
  const body = await readBody(event);
  const { year: yearStr, month: monthStr, day: dayStr, hour: hourStr } = body;

  // 2. 将输入转换为数字
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = hourStr ? parseInt(hourStr, 10) : null;

  // 3. 输入验证 (基础)
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw createError({
      statusCode: 400,
      statusMessage: "年份、月份和日期是必填项",
    });
  }

  try {
    // 3. 调用核心排盘逻辑 (目前是模拟数据)
    // @ts-ignore
    const bazi = getBaZi(year, month, day, hour || 0);
    const dayun = getDaYun(bazi);
    const liunian = getLiuNian(bazi);

    // 假设的藏干和十神计算，需要更具体的逻辑
    // @ts-ignore
    const canggan = bazi.day.zhi ? getCangGan(bazi.day.zhi) : [];
    // @ts-ignore
    const shishen = getShiShen(bazi, dayun[0]); // 示例：取第一个大运来算十神

    const resultPayload = {
      bazi,
      dayun,
      liunian,
      canggan,
      shishen,
    };

    // 4. 将输入和结果存入数据库
    const savedRecord = await prisma.paiPan.create({
      data: {
        year: year,
        month: month,
        day: day,
        hour: hour,
        result: resultPayload, // 将整个结果对象存为 JSON
      },
    });

    // 5. 返回带有数据库 ID 的完整结果
    return {
      id: savedRecord.id,
      ...resultPayload,
    };
  } catch (error) {
    console.error("排盘或数据库操作失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误，排盘失败",
    });
  }
});
