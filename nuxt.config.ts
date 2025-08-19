import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 开发工具，用于调试和分析 Nuxt 应用
  devtools: { enabled: true },

  // Nuxt 模块，用于扩展核心功能
  modules: [
    "@unocss/nuxt", // 原子化 CSS 引擎
    "@pinia/nuxt", // Pinia 状态管理
    "@vant/nuxt", // Vant UI 组件库
  ],
  // 注册 Vant Segmented 组件
  vant: {
    components: ["Segmented"],
  },
  // 全局 CSS, 用于引入动画库等
  css: ["animate.css/animate.min.css"],
});
