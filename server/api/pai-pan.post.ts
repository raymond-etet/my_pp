// server/api/pai-pan.post.ts
// import { PrismaClient, Prisma } from "@prisma/client"; // 直接导入在 Nuxt3 中存在模块兼容性问题
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

import { getFullLunarBaziData } from "../utils/lunarBazi";
import { defineEventHandler, readBody, createError } from "h3";

// 实例化 Prisma Client
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export default defineEventHandler(async (event) => {
  // 1. 从请求体中获取参数
  const body = await readBody(event);
  const {
    year: yearStr,
    month: monthStr,
    day: dayStr,
    hour: hourStr,
    gender,
  } = body;

  // 2. 将输入转换为数字
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = hourStr ? parseInt(hourStr, 10) : 0; // 如果时辰未知，默认为0

  // 3. 输入验证 (基础)
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw createError({
      statusCode: 400,
      statusMessage: "年份、月份和日期是必填项",
    });
  }

  // 验证范围
  if (year < 1900 || year > 2100) {
    throw createError({
      statusCode: 400,
      statusMessage: "年份必须在1900-2100范围内",
    });
  }

  if (month < 1 || month > 12) {
    throw createError({
      statusCode: 400,
      statusMessage: "月份必须在1-12范围内",
    });
  }

  if (day < 1 || day > 31) {
    throw createError({
      statusCode: 400,
      statusMessage: "日期必须在1-31范围内",
    });
  }

  // 验证时辰（hour可以为null或0表示未知，或者在1-23范围内）
  if (hourStr && (isNaN(hour) || hour < 0 || hour > 23)) {
    throw createError({
      statusCode: 400,
      statusMessage: "时辰必须在0-23范围内",
    });
  }

  if (gender !== "男" && gender !== "女") {
    throw createError({
      statusCode: 400,
      statusMessage: "性别必须是'男'或'女'",
    });
  }

  try {
    // 3. 调用核心排盘逻辑（使用lunar-javascript库）
    const resultPayload = getFullLunarBaziData(year, month, day, hour, gender);

    // 4. 将输入和结果存入数据库
    const savedRecord = await prisma.paiPan.create({
      data: {
        year,
        month,
        day,
        hour,
        gender,
        result: JSON.parse(JSON.stringify(resultPayload)), // 确保类型兼容
      } as any, // 临时解决类型问题
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
