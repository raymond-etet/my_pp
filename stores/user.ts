// stores/user.ts
import { defineStore } from "pinia";

// 定义 Store 的 state 类型
interface UserState {
  form: {
    year: number | null;
    month: number | null;
    day: number | null;
    hour: number | null;
  };
  result: any; // 用于存储排盘结果
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore("user", {
  // 定义 state
  state: (): UserState => ({
    form: {
      year: new Date().getFullYear(), // 默认为当前年份
      month: new Date().getMonth() + 1, // 默认为当前月份
      day: new Date().getDate(), // 默认为当前日期
      hour: null, // 0-23, null 代表“未知”
    },
    result: null,
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
        // 使用 Nuxt 提供的 $fetch 方法发起请求
        const response = await $fetch("/api/pai-pan", {
          method: "POST",
          body: this.form,
        });

        this.result = response;

        // 返回响应，让组件来处理路由跳转
        return response;
      } catch (e: any) {
        this.error = e.data?.statusMessage || "排盘失败，请稍后再试。";
        console.error("API Error:", e);
      } finally {
        this.loading = false;
      }
    },
  },
});
