// stores/user.ts
import { defineStore } from "pinia";

// 定义 Store 的 state 类型
interface UserState {
  form: {
    year: number;
    month: number;
    day: number;
    hour: number;
    gender: "男" | "女";
  };
  result: any; // 用于存储排盘结果
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore("user", {
  // 定义 state
  state: (): UserState => ({
    form: {
      year: 2024, // 修改为2024年便于测试
      month: 8, // 8月
      day: 19, // 19日
      hour: 0, // 0-23, null 代表"未知"
      gender: "男",
    },
    result: {},
    loading: false,
    error: null,
  }),

  // 定义 actions
  actions: {
    /**
     * @description 提交表单并发起排盘请求
     */
    async submitPaiPan() {
      const self = this;
      self.loading = true;
      self.error = null;

      try {
        // 使用 Nuxt 提供的 $fetch 方法发起请求
        const response = await $fetch("/api/pai-pan", {
          method: "POST",
          body: self.form,
        });

        self.result = response;

        // 返回响应，让组件来处理路由跳转
        return response;
      } catch (e: any) {
        self.error = e.data?.statusMessage || "排盘失败，请稍后再试。";
        console.error("API Error:", e);
      } finally {
        self.loading = false;
      }
    },
  },
});
