// utils/color.ts

/**
 * 五行到 UnoCSS/Tailwind 颜色类的映射
 * 这里使用了 text-red-500 这样的类名，确保你的 anocss/tailwind 配置中包含了这些颜色。
 * 我会使用内联样式来直接应用颜色，这样更灵活且无需配置 anocss。
 */
const wuxingColorMap: Record<string, string> = {
  金: "#D4AF37",
  木: "#26a69a",
  水: "#42a5f5",
  火: "#ef5350",
  土: "#D2B48C",
};

/**
 * 根据五行获取对应的颜色代码
 * @param wuxing - 五行名称 ('金', '木', '水', '火', '土')
 * @returns 对应的颜色 hex 代码，如果未找到则返回默认颜色
 */
export function getWuxingHexColor(wuxing: string): string {
  return wuxingColorMap[wuxing] || "#333333"; // 默认黑色
}

/**
 * 根据五行返回一个包含颜色样式的对象，用于 :style 绑定
 * @param wuxing - 五行名称
 * @returns { color: string }
 */
export function getWuxingColorStyle(wuxing: string) {
  return {
    color: getWuxingHexColor(wuxing),
  };
}

/**
 * (备用) 根据五行获取 CSS 类名
 * @param wuxing - 五行名称
 * @returns UnoCSS 的文本颜色类名
 */
export function getWuxingColorClass(wuxing: string): string {
  const colorClassMap: Record<string, string> = {
    金: "text-[#D4AF37]",
    木: "text-[#26a69a]",
    水: "text-[#42a5f5]",
    火: "text-[#ef5350]",
    土: "text-[#D2B48C]",
  };
  return colorClassMap[wuxing] || "text-gray-800"; // 默认颜色
}
