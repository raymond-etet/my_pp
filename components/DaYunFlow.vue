<template>
  <div class="dayun-flow-container bg-white rounded-lg shadow-md p-4">
    <!-- 大运列表 -->
    <div class="dayun-tabs flex space-x-2 overflow-x-auto pb-2 mb-4 border-b">
      <div
        v-for="(dayun, index) in dayuns"
        :key="index"
        @click="selectDayun(index)"
        class="dayun-tab cursor-pointer px-4 py-2 rounded-lg text-center whitespace-nowrap"
        :class="{
          'bg-blue-500 text-white shadow-lg': activeIndex === index,
          'bg-gray-100 text-gray-700': activeIndex !== index,
        }"
      >
        <div class="font-bold text-lg">
          {{ dayun.ganZhi.gan }}{{ dayun.ganZhi.zhi }}
        </div>
        <div class="text-xs">{{ dayun.startAge }} - {{ dayun.endAge }}岁</div>
      </div>
    </div>

    <!-- 当前大运下的流年列表 -->
    <div v-if="selectedDayun" class="liunian-list space-y-2">
      <h3 class="text-lg font-semibold mb-2">
        流年信息 ({{ selectedDayun.startAge }} - {{ selectedDayun.endAge }}岁)
      </h3>
      <div
        v-for="(liunian, lIndex) in selectedDayun.liunians"
        :key="lIndex"
        class="liunian-item flex items-center justify-between p-2 rounded-md transition-colors hover:bg-gray-50"
      >
        <div class="ganzhi-part font-mono text-xl">
          <span :style="getWuxingColorStyle(liunian.wuxing.gan)">{{
            liunian.gan
          }}</span>
          <span :style="getWuxingColorStyle(liunian.wuxing.zhi)">{{
            liunian.zhi
          }}</span>
        </div>
        <div class="shishen-part text-sm">
          <span :style="getWuxingColorStyle(liunian.wuxing.gan)">{{
            liunian.shishen.gan
          }}</span>
          <span class="text-gray-400 mx-1">|</span>
          <span
            class="font-bold"
            :style="getWuxingColorStyle(liunian.canggan[0]?.wuxing || '')"
          >
            {{ liunian.canggan[0]?.shishen || "" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, computed } from "vue";
import { getWuxingColorStyle } from "~/utils/color";

// --- Types ---
interface GanZhiDetail {
  gan: string;
  zhi: string;
  wuxing: { gan: string; zhi: string };
  shishen: { gan: string; zhi: string };
  canggan: { char: string; wuxing: string; shishen: string }[];
  naYin: string;
}

interface Dayun {
  startAge: number;
  endAge: number;
  ganZhi: GanZhiDetail;
  liunians: GanZhiDetail[];
}

// --- Props ---
const props = defineProps<{
  dayuns: Dayun[];
}>();

// --- State ---
const activeIndex = ref(0);

// --- Computed ---
const selectedDayun = computed(() => {
  return props.dayuns && props.dayuns[activeIndex.value]
    ? props.dayuns[activeIndex.value]
    : null;
});

// --- Methods ---
function selectDayun(index: number) {
  activeIndex.value = index;
}

// --- Watchers ---
watch(
  () => props.dayuns,
  (newDayuns) => {
    if (newDayuns && newDayuns.length > 0) {
      activeIndex.value = 0;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
/* 优化滚动条样式 */
.dayun-tabs::-webkit-scrollbar {
  height: 4px;
}
.dayun-tabs::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
