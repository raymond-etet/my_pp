// /server/utils/baziCalc.ts
import {
  Gan,
  Zhi,
  gan5,
  zhi5,
  ten_deities,
  cangGan as cangGanData,
} from "./baziData";

// --- 接口定义 ---
interface GanZhi {
  gan: string;
  zhi: string;
}

interface GanZhiDetail extends GanZhi {
  wuxing: { gan: string; zhi: string };
  shishen: { gan: string; zhi: string };
  canggan: { char: string; wuxing: string; shishen: string }[];
  naYin: string;
}

interface Yun {
  startAge: number;
  endAge: number;
  ganZhi: GanZhiDetail;
  liunians: GanZhiDetail[];
}

// --- 核心工具函数 ---

/**
 * 获取天干的阴阳属性
 * @param gan 天干
 * @returns '阳' | '阴'
 */
const getGanYinYang = (gan: string): "阳" | "阴" => {
  const index = Gan.indexOf(gan);
  return index % 2 === 0 ? "阳" : "阴";
};

/**
 * 计算十神
 * @param dayGan 日元天干
 * @param targetGan 要计算的天干
 * @returns 十神名称
 */
export const getShiShen = (dayGan: string, targetGan: string): string => {
  const dayGanYinYang = getGanYinYang(dayGan);
  const dayGanWuxing = (gan5 as Record<string, string>)[dayGan];
  const targetGanWuxing = (gan5 as Record<string, string>)[targetGan];

  // 确定是同性还是异性
  const isSamePolarity = getGanYinYang(targetGan) === dayGanYinYang;

  // 根据生克关系和阴阳确定十神
  if (targetGanWuxing === dayGanWuxing) {
    return isSamePolarity ? "比肩" : "劫财";
  } else if (dayGanWuxing === "木") {
    if (targetGanWuxing === "火") return isSamePolarity ? "食神" : "伤官";
    if (targetGanWuxing === "土") return isSamePolarity ? "偏财" : "正财";
    if (targetGanWuxing === "金") return isSamePolarity ? "七杀" : "正官";
    if (targetGanWuxing === "水") return isSamePolarity ? "偏印" : "正印";
  } else if (dayGanWuxing === "火") {
    if (targetGanWuxing === "土") return isSamePolarity ? "食神" : "伤官";
    if (targetGanWuxing === "金") return isSamePolarity ? "偏财" : "正财";
    if (targetGanWuxing === "水") return isSamePolarity ? "七杀" : "正官";
    if (targetGanWuxing === "木") return isSamePolarity ? "偏印" : "正印";
  } else if (dayGanWuxing === "土") {
    if (targetGanWuxing === "金") return isSamePolarity ? "食神" : "伤官";
    if (targetGanWuxing === "水") return isSamePolarity ? "偏财" : "正财";
    if (targetGanWuxing === "木") return isSamePolarity ? "七杀" : "正官";
    if (targetGanWuxing === "火") return isSamePolarity ? "偏印" : "正印";
  } else if (dayGanWuxing === "金") {
    if (targetGanWuxing === "水") return isSamePolarity ? "食神" : "伤官";
    if (targetGanWuxing === "木") return isSamePolarity ? "偏财" : "正财";
    if (targetGanWuxing === "火") return isSamePolarity ? "七杀" : "正官";
    if (targetGanWuxing === "土") return isSamePolarity ? "偏印" : "正印";
  } else if (dayGanWuxing === "水") {
    if (targetGanWuxing === "木") return isSamePolarity ? "食神" : "伤官";
    if (targetGanWuxing === "火") return isSamePolarity ? "偏财" : "正财";
    if (targetGanWuxing === "土") return isSamePolarity ? "七杀" : "正官";
    if (targetGanWuxing === "金") return isSamePolarity ? "偏印" : "正印";
  }
  return "";
};

/**
 * 获取地支藏干
 * @param zhi 地支
 * @returns 藏干数组
 */
export const getCangGan = (zhi: string): string[] => {
  const ganStr = (cangGanData as Record<string, string | string[]>)[zhi];
  if (!ganStr) {
    return [];
  }
  return Array.isArray(ganStr) ? ganStr : ganStr.split("");
};

/**
 * 核心函数：计算大运
 * @param yearGan 年干
 * @param monthGan 月干
 * @param monthZhi 月支
 * @param dayGan 日元
 * @param isFemale 是否为女性
 * @returns 大运数组
 */
export function calcDayuns(
  yearGan: string,
  monthGan: string,
  monthZhi: string,
  dayGan: string,
  isFemale: boolean
): Yun[] {
  const yearGanIndex = Gan.indexOf(yearGan);
  const yearGanYinYang = yearGanIndex % 2 === 0 ? "阳" : "阴";

  // 根据年干阴阳和性别确定顺逆
  // 阳男阴女为顺，阴男阳女为逆
  const direction =
    (yearGanYinYang === "阳" && !isFemale) ||
    (yearGanYinYang === "阴" && isFemale)
      ? 1
      : -1;

  let ganSeq = Gan.indexOf(monthGan);
  let zhiSeq = Zhi.indexOf(monthZhi);

  const dayuns: Yun[] = [];

  for (let i = 0; i < 8; i++) {
    // 通常排八步大运
    ganSeq += direction;
    zhiSeq += direction;

    // 纠正索引，使其在 0-9 和 0-11 之间循环
    const currentGanIndex = ((ganSeq % 10) + 10) % 10;
    const currentZhiIndex = ((zhiSeq % 12) + 12) % 12;

    const gan = Gan[currentGanIndex]!;
    const zhi = Zhi[currentZhiIndex]!;

    const startAge = i * 10 + 1; // 大运开始年龄，通常从1岁或具体计算的起运岁数开始

    // --- 计算大运干支的详细信息 ---
    const dayunGanZhiDetail = createGanZhiDetail(gan, zhi, dayGan);

    // --- 推算流年 ---
    const liunians: GanZhiDetail[] = [];
    // 流年始于大运第一年，需要找到一个起始点
    // 简化处理：我们从该大运的第一年开始，需要有一个初始的流年干支
    // 这里我们假设流年干支是连续的，需要一个全局的起始点, 为方便起见，我们从甲子开始循环
    // 更好的方式是从八字出生那年的干支开始推

    // 一个简单但不完全精确的流年方法,仅用于演示
    let liunianGanIndex = Gan.indexOf("甲");
    let liunianZhiIndex = Zhi.indexOf("子");

    for (let j = 0; j < 10; j++) {
      // 为了演示，我们用一个简化的循环，实际应基于公历年
      const lGan = Gan[(liunianGanIndex + i * 10 + j) % 10]!;
      const lZhi = Zhi[(liunianZhiIndex + i * 10 + j) % 12]!;
      liunians.push(createGanZhiDetail(lGan, lZhi, dayGan));
    }

    dayuns.push({
      startAge: startAge,
      endAge: startAge + 9,
      ganZhi: dayunGanZhiDetail,
      liunians,
    });
  }

  return dayuns;
}

/**
 * 辅助函数：创建干支详情对象
 * @param gan 天干
 * @param zhi 地支
 * @param dayGan 日元
 * @returns GanZhiDetail 对象
 */
export function createGanZhiDetail(
  gan: string,
  zhi: string,
  dayGan: string
): GanZhiDetail {
  const canggan = getCangGan(zhi).map((cg) => ({
    char: cg,
    wuxing: (gan5 as Record<string, string>)[cg] || "",
    shishen: getShiShen(dayGan, cg),
  }));

  return {
    gan: gan,
    zhi: zhi,
    wuxing: {
      gan: (gan5 as Record<string, string>)[gan] || "",
      zhi: (zhi5 as Record<string, string>)[zhi] || "",
    },
    shishen: {
      gan: getShiShen(dayGan, gan),
      zhi: getShiShen(dayGan, zhi), // 地支十神通常看藏干，这里简化为主气
    },
    canggan: canggan,
    naYin: "暂无", // 纳音计算较复杂，暂不实现
  };
}
