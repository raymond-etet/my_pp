// server/api/pai-pan.post.ts
import { getFullLunarBaziData } from "../utils/lunarBazi";
import { createGanZhiDetail } from "../utils/baziCalc";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  // 1. 检查用户是否已登录
  const user = event.context.user;
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "用户未登录",
    });
  }

  const body = await readBody(event);
  const {
    name,
    year: yearStr,
    month: monthStr,
    day: dayStr,
    hour: hourStr,
    gender,
    calendarType,
  } = body;

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  // 前端以 -1 表示“未知”，如果未传则视为 -1（未知）
  const hour =
    hourStr !== undefined && hourStr !== null ? parseInt(hourStr, 10) : -1;
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
  // hour 允许为 -1（未知），或 0-23 的整数
  if (isNaN(hour) || hour < -1 || hour > 23) {
    throw createError({
      statusCode: 400,
      statusMessage: "时辰必须为 -1 (未知) 或 0-23 范围内的整数",
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
    const rawBaziData = getFullLunarBaziData(
      year,
      month,
      day,
      hour,
      gender,
      calendarType
    );

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

    // 4. 转换大运和流年数据结构
    const dayuns = rawBaziData.daYun.map((dy) => {
      const [startAge, endAge] = dy.ageRange.split("-").map(Number);
      return {
        startAge: startAge,
        endAge: endAge,
        startYear: dy.startYear,
        endYear: dy.endYear,
        ganZhi: createGanZhiDetail(dy.ganZhi[0]!, dy.ganZhi[1]!, dayGan),
        liunians: dy.liuNian.map((ln) =>
          createGanZhiDetail(ln.ganZhi[0]!, ln.ganZhi[1]!, dayGan, ln.year)
        ),
      };
    });

    // 5. 整合最终返回给前端的结果
    // 如果用户选择未知时辰，我们在 result.form.hour 中记录 '*'，
    // 但用于计算的大运/流年我们会按传入的 calcHour 来处理（见下文）
    const resultPayload = {
      ...rawBaziData, // 保留原始信息，如公历、农历等
      form: {
        year,
        month,
        day,
        // 在接口返回的表单里：未知时辰用 '*' 标记；已知则保留原始小时值
        hour: hour === -1 ? "*" : hour,
        gender,
        calendarType,
      },
      bazi: baziDetail, // 覆盖为详细的四柱对象
      dayun: dayuns, // 覆盖为新的大运数据
    };

    // 6. 存入数据库
    // 注意：数据库表的 hour 字段是 Int?，因此如果未知应该保存为 null
    const savedRecord = await prisma.paiPan.create({
      data: {
        name, // 姓名（可选）
        year,
        month,
        day,
        hour: hour === -1 ? null : hour,
        gender, // 性别是必填项
        result: JSON.parse(JSON.stringify(resultPayload)),
        userId: user.userId, // 关联用户ID
      },
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
