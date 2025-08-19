// server/utils/lunarBazi.ts - 使用 lunar-javascript 库的八字排盘算法

import { Solar } from "lunar-javascript";

/**
 * 输入参数类型定义
 */
export interface LunarBaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: "男" | "女";
}

/**
 * 八字结果类型定义
 */
export interface LunarBaziResult {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  gender: "男" | "女";
}

/**
 * 完整排盘结果类型定义
 */
export interface FullLunarBaziResult {
  bazi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  daYun: Array<{
    ageRange: string;
    yearRange: string;
    ganZhi: string;
    liuNian: Array<{
      year: number;
      ganZhi: string;
    }>;
  }>;
  shiShen: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  cangGan: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
}

/**
 * 使用 lunar-javascript 计算八字
 */
export function getLunarBazi({
  year,
  month,
  day,
  hour,
  gender,
}: LunarBaziInput): LunarBaziResult {
  try {
    // 创建公历日期对象
    const solar =
      hour > 0
        ? Solar.fromYmdHms(year, month, day, hour, 0, 0)
        : Solar.fromYmd(year, month, day);

    // 转换为农历
    const lunar = solar.getLunar();

    // 获取八字
    const eightChar = lunar.getEightChar();

    return {
      yearPillar: eightChar.getYear(),
      monthPillar: eightChar.getMonth(),
      dayPillar: eightChar.getDay(),
      hourPillar: eightChar.getTime(),
      gender,
    };
  } catch (error) {
    console.error("计算八字时发生错误:", error);
    throw new Error("八字计算失败");
  }
}

/**
 * 获取完整的八字排盘数据（包括大运、十神、藏干等）
 */
export function getFullLunarBaziData(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: "男" | "女"
): FullLunarBaziResult {
  try {
    // 创建公历日期对象
    const solar =
      hour > 0
        ? Solar.fromYmdHms(year, month, day, hour, 0, 0)
        : Solar.fromYmd(year, month, day);

    // 转换为农历
    const lunar = solar.getLunar();

    // 获取八字
    const eightChar = lunar.getEightChar();

    // 基本八字信息
    const baziResult = {
      year: eightChar.getYear(),
      month: eightChar.getMonth(),
      day: eightChar.getDay(),
      hour: eightChar.getTime(),
    };

    // 获取大运（如果时辰已知）
    let daYunResult: Array<any> = [];
    if (hour > 0) {
      try {
        // 尝试通过八字对象获取大运
        const genderCode = gender === "男" ? 1 : 0;
        const yun = eightChar.getYun(genderCode);

        if (yun) {
          const daYuns = yun.getDaYun();
          daYunResult = daYuns.slice(0, 10).map((dy: any) => ({
            ageRange: `${dy.getStartAge()}-${dy.getEndAge()}`,
            yearRange: `${dy.getStartYear()}-${dy.getEndYear()}`,
            ganZhi: dy.getGanZhi(),
            liuNian: dy
              .getLiuNian()
              .slice(0, 10)
              .map((ln: any) => ({
                year: ln.getYear(),
                ganZhi: ln.getGanZhi(),
              })),
          }));
        }
      } catch (yunError) {
        console.warn("获取大运时发生错误，使用简化算法:", yunError);
        // 如果lunar-javascript的大运功能有问题，使用简化的大运计算
        daYunResult = getSimplifiedDaYun(baziResult, year, gender);
      }
    }

    // 获取十神
    const shiShenResult = {
      year: eightChar.getYearShiShenGan() || "未知",
      month: eightChar.getMonthShiShenGan() || "未知",
      day: "比肩", // 日干对日干是比肩
      hour: eightChar.getTimeShiShenGan() || "未知",
    };

    // 获取藏干
    const cangGanResult = {
      year: eightChar.getYearHideGan() || ["未知"],
      month: eightChar.getMonthHideGan() || ["未知"],
      day: eightChar.getDayHideGan() || ["未知"],
      hour: eightChar.getTimeHideGan() || ["未知"],
    };

    return {
      bazi: baziResult,
      daYun: daYunResult,
      shiShen: shiShenResult,
      cangGan: cangGanResult,
    };
  } catch (error) {
    console.error("计算完整八字排盘时发生错误:", error);
    // 返回默认值
    return {
      bazi: {
        year: "未知",
        month: "未知",
        day: "未知",
        hour: "未知",
      },
      daYun: [],
      shiShen: {
        year: "未知",
        month: "未知",
        day: "未知",
        hour: "未知",
      },
      cangGan: {
        year: ["未知"],
        month: ["未知"],
        day: ["未知"],
        hour: ["未知"],
      },
    };
  }
}

/**
 * 简化的大运计算（备用方案）
 */
function getSimplifiedDaYun(
  baziResult: any,
  birthYear: number,
  gender: "男" | "女"
): Array<any> {
  try {
    const daYuns: any[] = [];

    // 大运以月柱为基础，每10年一步
    const monthPillar = baziResult.month;

    // 简化的起运年龄（固定3岁起运）
    const startAge = 3;

    // 生成10步大运（简化版本）
    for (let i = 0; i < 10; i++) {
      const age = startAge + i * 10;
      const year = birthYear + age;

      daYuns.push({
        ageRange: `${age}-${age + 9}`,
        yearRange: `${year}-${year + 9}`,
        ganZhi: monthPillar, // 简化：都用月柱
        liuNian: Array.from({ length: 10 }, (_, j) => ({
          year: year + j,
          ganZhi: monthPillar, // 简化：都用月柱
        })),
      });
    }

    return daYuns;
  } catch (error) {
    console.error("简化大运计算错误:", error);
    return [];
  }
}

/**
 * 测试lunar-javascript八字计算功能
 */
export function testLunarBaziCalculation(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  gender: "男" | "女" = "男"
) {
  console.log(
    `测试lunar-javascript八字计算: ${year}-${month}-${day} ${hour}时 ${gender}`
  );

  try {
    const result = getFullLunarBaziData(year, month, day, hour, gender);
    console.log("计算结果:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("测试失败:", error);
    return null;
  }
}
