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
  year?: number;
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
 * 辅助函数：创建干支详情对象
 * @param gan 天干
 * @param zhi 地支
 * @param dayGan 日元
 * @param year 可选的年份
 * @returns GanZhiDetail 对象
 */
export function createGanZhiDetail(
  gan: string,
  zhi: string,
  dayGan: string,
  year?: number
): GanZhiDetail {
  const canggan = getCangGan(zhi).map((cg) => ({
    char: cg,
    wuxing: (gan5 as Record<string, string>)[cg] || "",
    shishen: getShiShen(dayGan, cg),
  }));

  const detail: GanZhiDetail = {
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

  if (year) {
    detail.year = year;
  }

  return detail;
}
