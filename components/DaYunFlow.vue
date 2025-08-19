<template>
  <div class="dayun-flow-container bg-white rounded-lg shadow-md p-4">
    <!-- 大运列表 -->
    <div
      ref="dayunTabsRef"
      class="dayun-tabs flex space-x-2 overflow-x-auto pb-2 mb-4 border-b"
    >
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
        :class="{ 'bg-gradient-to-br': isCurrentLiunian(liunian) }"
        :style="
          isCurrentLiunian(liunian) ? getCurrentLiunianStyle(liunian) : {}
        "
      >
        <!-- 天干与年份 -->
        <div class="flex items-center space-x-4">
          <div class="flex flex-col items-start">
            <div class="font-mono text-xl">
              <span :style="getWuxingColorStyle(liunian.wuxing.gan)">{{
                liunian.gan
              }}</span>
            </div>
            <div
              class="text-sm"
              :style="getWuxingColorStyle(liunian.wuxing.gan)"
            >
              {{ liunian.shishen.gan }}
            </div>
          </div>
          <div class="text-xs text-gray-400 font-mono">
            {{ liunian.year }}
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
import { ref, watch, defineProps, computed, onMounted, nextTick } from "vue";
import {
  getWuxingColorStyle,
  getWuxingHexColor,
  hexToRgba,
} from "~/utils/color";

// --- Types ---
interface GanZhiDetail {
  gan: string;
  zhi: string;
  wuxing: { gan: string; zhi: string };
  shishen: { gan: string; zhi: string };
  canggan: { char: string; wuxing: string; shishen: string }[];
  naYin: string;
  year?: number; // 流年年份
}

interface Dayun {
  startAge: number;
  endAge: number;
  ganZhi: GanZhiDetail;
  liunians: GanZhiDetail[];
  startYear: number;
  endYear: number;
}

// --- Props ---
const props = defineProps<{
  dayuns: Dayun[];
  birthYear: number;
}>();

// --- State ---
const activeIndex = ref(0);
const currentYear = new Date().getFullYear();
const dayunTabsRef = ref<HTMLDivElement | null>(null); // DOM 元素引用

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

// 滚动到激活的 tab
function scrollActiveTabToCenter() {
  nextTick(() => {
    if (dayunTabsRef.value) {
      const activeTab = dayunTabsRef.value.children[
        activeIndex.value
      ] as HTMLElement;
      if (activeTab) {
        const container = dayunTabsRef.value;
        const scrollLeft =
          activeTab.offsetLeft -
          container.offsetWidth / 2 +
          activeTab.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  });
}

function isCurrentLiunian(liunian: GanZhiDetail): boolean {
  if (!selectedDayun.value || !liunian.year) {
    return false;
  }
  const currentAge = currentYear - props.birthYear;
  return (
    liunian.year === currentYear &&
    currentAge >= selectedDayun.value.startAge &&
    currentAge <= selectedDayun.value.endAge
  );
}

function getCurrentLiunianStyle(liunian: GanZhiDetail) {
  const ganHex = getWuxingHexColor(liunian.wuxing.gan);
  const zhiHex = getWuxingHexColor(liunian.wuxing.zhi);

  // 从左上到右下渐变，透明度20%
  const ganColor = hexToRgba(ganHex, 0.2);
  const zhiColor = hexToRgba(zhiHex, 0.2);

  return {
    background: `linear-gradient(to bottom right, ${ganColor}, ${zhiColor})`,
    color: "#333", // 在半透明背景上使用深色字体以保证可读性
  };
}

// --- Lifecycle Hooks ---
onMounted(() => {
  if (props.dayuns && props.dayuns.length > 0) {
    const currentAge = currentYear - props.birthYear;
    const currentDayunIndex = props.dayuns.findIndex(
      (d) => currentAge >= d.startAge && currentAge <= d.endAge
    );
    if (currentDayunIndex !== -1) {
      activeIndex.value = currentDayunIndex;
      scrollActiveTabToCenter(); // 新增：滚动到激活的 tab
    }
  }
});

// --- Watchers ---
watch(
  () => props.dayuns,
  (newDayuns) => {
    if (newDayuns && newDayuns.length > 0) {
      const currentAge = currentYear - props.birthYear;
      const currentDayunIndex = newDayuns.findIndex(
        (d) => currentAge >= d.startAge && currentAge <= d.endAge
      );
      if (currentDayunIndex !== -1) {
        activeIndex.value = currentDayunIndex;
      } else {
        activeIndex.value = 0; // 默认
      }
      scrollActiveTabToCenter(); // 新增：滚动到激活的 tab
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
