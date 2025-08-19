<template>
  <div class="pillar-card bg-white rounded-lg shadow-md p-3 text-center">
    <div class="pillar-title font-bold text-gray-600 mb-2">{{ title }}</div>
    <div class="ganzhi-display text-4xl font-serif mb-2">
      <span :style="getWuxingColorStyle(pillarData.wuxing.gan)">{{
        pillarData.gan
      }}</span>
      <span :style="getWuxingColorStyle(pillarData.wuxing.zhi)">{{
        pillarData.zhi
      }}</span>
    </div>
    <div class="shishen-display text-sm text-gray-500 mb-2">
      <span :style="getWuxingColorStyle(pillarData.wuxing.gan)">{{
        pillarData.shishen.gan
      }}</span>
      <span :style="getWuxingColorStyle(pillarData.wuxing.zhi)" class="ml-2">{{
        pillarData.shishen.zhi
      }}</span>
    </div>
    <div class="canggan-grid mt-3 pt-3 border-t border-gray-200">
      <div
        v-for="cg in pillarData.canggan"
        :key="cg.char"
        class="canggan-item text-xs"
      >
        <div :style="getWuxingColorStyle(cg.wuxing)" class="font-mono">
          {{ cg.char }}
        </div>
        <div :style="getWuxingColorStyle(cg.wuxing)">{{ cg.shishen }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { getWuxingColorStyle } from "@/utils/color";

// 定义组件接收的 props
interface GanZhiDetail {
  gan: string;
  zhi: string;
  wuxing: { gan: string; zhi: string };
  shishen: { gan: string; zhi: string };
  canggan: { char: string; wuxing: string; shishen: string }[];
  naYin: string;
}

defineProps<{
  title: string;
  pillarData: GanZhiDetail;
}>();
</script>

<style scoped>
.pillar-card {
  display: flex;
  flex-direction: column;
}
.canggan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(30px, 1fr));
  gap: 4px;
}
</style>
