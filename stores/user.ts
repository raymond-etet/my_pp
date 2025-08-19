// stores/user.ts
// stores/user.ts
import { defineStore } from "pinia";
import { useAuthStore } from "./auth"; // 导入 auth store

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
  startYear: number;
  endYear: number;
  ganZhi: GanZhiDetail;
  liunians: (GanZhiDetail & { year: number })[]; // 流年加上年份
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
    name?: string; // 姓名，可选
    year: number;
    month: number;
    day: number;
    hour: number; // -1 代表未知
    gender: string; // "男" | "女"
    calendarType: string; // "solar" | "lunar"
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
      calendarType: "solar", // 默认为公历
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

      // 获取 auth store
      const authStore = useAuthStore();
      const token = authStore.token;

      // 如果未登录，直接报错
      if (!token) {
        this.error = "请先登录后再进行排盘";
        this.loading = false;
        return null;
      }

      try {
        const response = await $fetch<FullBaziResult>("/api/pai-pan", {
          method: "POST",
          body: this.form,
          headers: {
            Authorization: `Bearer ${token}`, // 添加 token 到请求头
          },
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
      //  获取 auth store
      const authStore = useAuthStore();
      const token = authStore.token;
      // 如果未登录，直接报错
      if (!token) {
        this.error = "请先登录";
        this.loading = false;
        return null;
      }
      try {
        const response = await $fetch<FullBaziResult>(
          `/api/pai-pan/${id}`, // <--- 更新为新的动态路由
          {
            headers: {
              Authorization: `Bearer ${token}`, // 添加 token 到请求头
            },
          }
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
