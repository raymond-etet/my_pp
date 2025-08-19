// stores/user.ts
import { defineStore } from "pinia";

// --- Bazi 结果的详细类型定义 ---

// 干支详情
interface GanZhiDetail {
  gan: string;
  zhi: string;
  wuxing: { gan: string; zhi: string };
  shishen: { gan: string; zhi: string };
  canggan: { char: string; wuxing: string; shishen: string }[];
  naYin: string;
}

// 四柱详情
interface BaziDetail {
  year: GanZhiDetail;
  month: GanZhiDetail;
  day: GanZhiDetail;
  hour: GanZhiDetail;
}

// 大运
interface Dayun {
  startAge: number;
  endAge: number;
  ganZhi: GanZhiDetail;
  liunians: GanZhiDetail[];
}

// 完整的排盘结果 (API 返回)
interface FullBaziResult {
  id: number;
  bazi: BaziDetail;
  dayun: Dayun[];
  // 可能还包含 solar, lunar 等原始信息
  [key: string]: any;
}

// --- Pinia Store 定义 ---

// 定义 Store 的 state 类型
interface UserState {
  form: {
    year: number;
    month: number;
    day: number;
    hour: number | null; // 允许为 null
    gender: "男" | "女";
  };
  result: FullBaziResult | null; // 使用详细类型，并允许为 null
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore("user", {
  // 定义 state
  state: (): UserState => ({
    form: {
      year: 1990,
      month: 8,
      day: 19,
      hour: 10,
      gender: "男",
    },
    result: null, // 初始值为 null
    loading: false,
    error: null,
  }),

  // 定义 actions
  actions: {
    /**
     * @description 提交表单并发起排盘请求
     */
    async submitPaiPan() {
      this.loading = true;
      this.error = null;

      try {
        const response = await $fetch<FullBaziResult>("/api/pai-pan", {
          method: "POST",
          body: this.form,
        });

        this.result = response;

        // 返回响应，让组件来处理路由跳转等
        return response;
      } catch (e: any) {
        this.error = e.data?.statusMessage || "排盘失败，请稍后再试。";
        console.error("API Error:", e);
        // 如果出错，也返回 null 或抛出错误，让调用处知道
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * @description 通过 ID 获取历史排盘结果
     * @param id
     */
    async fetchPaiPanById(id: number | string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch<FullBaziResult>(
          `/api/pai-pan/history?id=${id}`
        );
        this.result = response;
        return response;
      } catch (e: any) {
        this.error = e.data?.statusMessage || "查询历史记录失败。";
        console.error("Fetch by ID Error:", e);
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
