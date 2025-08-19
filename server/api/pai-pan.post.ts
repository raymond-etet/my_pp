// server/api/pai-pan.post.ts
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

import { getFullLunarBaziData } from "../utils/lunarBazi";
import { calcDayuns, createGanZhiDetail } from "../utils/baziCalc";
import { defineEventHandler, readBody, createError } from "h3";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    year: yearStr,
    month: monthStr,
    day: dayStr,
    hour: hourStr,
    gender,
  } = body;

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = hourStr ? parseInt(hourStr, 10) : 0;
  const isFemale = gender === "女";

  // --- 输入验证 ---
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw createError({
      statusCode: 400,
      statusMessage: "年份、月份和日期是必填项",
    });
  }
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
    // 1. 从lunar-javascript获取基础八字干支字符串
    const rawBaziData = getFullLunarBaziData(year, month, day, hour, gender);

    // 2. 拆分干支字符串为对象
    const yearGanZhi = {
      gan: rawBaziData.bazi.year[0]!,
      zhi: rawBaziData.bazi.year[1]!,
    };
    const monthGanZhi = {
      gan: rawBaziData.bazi.month[0]!,
      zhi: rawBaziData.bazi.month[1]!,
    };
    const dayGanZhi = {
      gan: rawBaziData.bazi.day[0]!,
      zhi: rawBaziData.bazi.day[1]!,
    };
    const hourGanZhi = {
      gan: rawBaziData.bazi.hour[0]!,
      zhi: rawBaziData.bazi.hour[1]!,
    };

    const dayGan = dayGanZhi.gan; // 日元

    // 3. 使用新算法计算四柱详情
    const baziDetail = {
      year: createGanZhiDetail(yearGanZhi.gan, yearGanZhi.zhi, dayGan),
      month: createGanZhiDetail(monthGanZhi.gan, monthGanZhi.zhi, dayGan),
      day: createGanZhiDetail(dayGanZhi.gan, dayGanZhi.zhi, dayGan),
      hour: createGanZhiDetail(hourGanZhi.gan, hourGanZhi.zhi, dayGan),
    };

    // 4. 使用新算法计算大运和流年
    const dayuns = calcDayuns(
      yearGanZhi.gan,
      monthGanZhi.gan,
      monthGanZhi.zhi,
      dayGan,
      isFemale
    );

    // 5. 整合最终返回给前端的结果
    const resultPayload = {
      ...rawBaziData, // 保留原始信息，如公历、农历等
      bazi: baziDetail, // 覆盖为详细的四柱对象
      dayun: dayuns, // 覆盖为新的大运数据
    };

    // 6. 存入数据库
    const savedRecord = await prisma.paiPan.create({
      data: {
        year,
        month,
        day,
        hour,
        gender,
        result: JSON.parse(JSON.stringify(resultPayload)),
      } as any,
    });

    // 7. 返回完整结果
    return {
      id: savedRecord.id,
      ...resultPayload,
    };
  } catch (error: any) {
    console.error("排盘或数据库操作失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "服务器内部错误，排盘失败",
    });
  }
});
