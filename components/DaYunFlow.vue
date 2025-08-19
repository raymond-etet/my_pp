<template>
  <div class="dayun-flow-container bg-white rounded-lg shadow-md p-4">
    <!-- 大运列表 -->
    <div class="dayun-tabs flex space-x-2 overflow-x-auto pb-2 mb-4 border-b">
      <div
        v-for="(dayun, index) in dayuns"
        :key="dayun.startAge"
        @click="selectDayun(index)"
        class="dayun-tab cursor-pointer px-4 py-2 rounded-lg text-center whitespace-nowrap"
        :class="{
          'bg-blue-500 text-white shadow-lg': activeIndex === index,
          'bg-gray-100 text-gray-700': activeIndex !== index,
        }"
        :style="{ transitionDelay: `${index * 50}ms` }"
      >
        <div class="font-bold text-lg">
          <span :style="getWuxingColorStyle(dayun.ganZhi.wuxing.gan)">{{
            dayun.ganZhi.gan
          }}</span>
          <span :style="getWuxingColorStyle(dayun.ganZhi.wuxing.zhi)">{{
            dayun.ganZhi.zhi
          }}</span>
        </div>
        <div
          class="text-sm"
          :style="getWuxingColorStyle(dayun.ganZhi.wuxing.gan)"
        >
          {{ dayun.ganZhi.shishen.gan }}
        </div>
        <div class="text-xs flex items-center justify-center gap-x-1 mt-1">
          <div
            v-for="(cg, cgIndex) in dayun.ganZhi.canggan"
            :key="cgIndex"
            class="flex flex-col items-center"
          >
            <span :style="getWuxingColorStyle(cg.wuxing)">{{ cg.char }}</span>
            <span :style="getWuxingColorStyle(cg.wuxing)"
              >({{ cg.shishen }})</span
            >
          </div>
        </div>
        <div class="text-xs mt-1">
          {{ dayun.startAge }} - {{ dayun.endAge }}岁
        </div>
      </div>
    </div>

    <!-- 当前大运下的流年列表 -->
    <div v-if="selectedDayun" :key="activeIndex" class="liunian-list space-y-2">
      <h3 class="text-lg font-semibold mb-2">
        流年信息 ({{ selectedDayun.startAge }} - {{ selectedDayun.endAge }}岁)
      </h3>
      <div
        v-for="(liunian, lIndex) in selectedDayun.liunians"
        :key="lIndex"
        class="liunian-item grid grid-cols-2 items-center p-2 rounded-md transition-colors hover:bg-gray-50 border-b"
      >
        <!-- 天干部分 -->
        <div class="flex flex-col items-start">
          <div class="font-mono text-xl">
            <span :style="getWuxingColorStyle(liunian.wuxing.gan)">{{
              liunian.gan
            }}</span>
          </div>
          <div class="text-sm" :style="getWuxingColorStyle(liunian.wuxing.gan)">
            {{ liunian.shishen.gan }}
          </div>
        </div>

        <!-- 地支部分 -->
        <div class="flex flex-col items-end">
          <div class="font-mono text-xl">
            <span :style="getWuxingColorStyle(liunian.wuxing.zhi)">{{
              liunian.zhi
            }}</span>
          </div>
          <div class="text-xs text-gray-500 flex gap-x-2">
            <div
              v-for="(cg, cgIndex) in liunian.canggan"
              :key="cgIndex"
              class="flex items-center"
            >
              <span :style="getWuxingColorStyle(cg.wuxing)">{{ cg.char }}</span>
              <span :style="getWuxingColorStyle(cg.wuxing)"
                >({{ cg.shishen }})</span
              >
            </div>
          </div>
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
.dayun-tabs {
  scroll-behavior: smooth; /* 新增：平滑滚动效果 */
}
.dayun-tabs::-webkit-scrollbar {
  height: 4px;
}
.dayun-tabs::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
