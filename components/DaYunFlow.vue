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
        class="dayun-tab cursor-pointer px-4 py-2 rounded-lg text-center whitespace-nowrap transition-all duration-300"
        :class="{
          'bg-blue-500 text-white shadow-lg transform scale-105':
            activeIndex === index,
          'bg-gray-100 text-gray-700': activeIndex !== index,
        }"
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

    <!-- 骨架屏 Loading 状态 -->
    <div v-if="liunianLoading" class="liunian-skeleton-list space-y-2">
      <h3
        class="text-lg font-semibold mb-2 text-transparent bg-gray-200 rounded w-3/4 animate-pulse"
      >
        流年信息
      </h3>
      <div
        v-for="i in 10"
        :key="i"
        class="liunian-item grid grid-cols-2 items-center p-2 rounded-md border-b"
      >
        <!-- 左侧骨架 -->
        <div class="flex items-center space-x-4 animate-pulse">
          <div class="flex flex-col items-start space-y-2">
            <div class="h-5 w-8 bg-gray-200 rounded"></div>
            <div class="h-3 w-12 bg-gray-200 rounded"></div>
          </div>
          <div class="h-3 w-10 bg-gray-200 rounded"></div>
        </div>
        <!-- 右侧骨架 -->
        <div class="flex flex-col items-end space-y-2 animate-pulse">
          <div class="h-5 w-8 bg-gray-200 rounded"></div>
          <div class="flex gap-x-2">
            <div class="h-3 w-10 bg-gray-200 rounded"></div>
            <div class="h-3 w-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 当前大运下的流年列表 -->
    <div
      v-else-if="displayedLiunians"
      class="liunian-list space-y-2 transition-opacity duration-500"
    >
      <h3 v-if="selectedDayun" class="text-lg font-semibold mb-2">
        流年信息 ({{ selectedDayun.startAge }} - {{ selectedDayun.endAge }}岁)
      </h3>
      <div
        v-for="(liunian, lIndex) in displayedLiunians"
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
const liunianLoading = ref(false);
const displayedLiunians = ref<GanZhiDetail[] | null>(null);
const currentYear = new Date().getFullYear();
const dayunTabsRef = ref<HTMLDivElement | null>(null);

// --- Computed ---
// selectedDayun 仅用于展示标题信息，避免触发流年列表的重新计算
const selectedDayun = computed(() => {
  return props.dayuns && props.dayuns[activeIndex.value]
    ? props.dayuns[activeIndex.value]
    : null;
});

// --- Methods ---
async function selectDayun(index: number) {
  if (activeIndex.value === index) return;

  // 1. 立即更新 active 样式
  activeIndex.value = index;

  // 2. 立即显示 loading
  liunianLoading.value = true;
  displayedLiunians.value = null; // 清空旧数据

  // 等待 DOM 更新（active样式和loading状态生效）
  await nextTick();

  // 3. 异步加载新数据，模拟网络延迟或计算耗时
  setTimeout(() => {
    if (props.dayuns && props.dayuns[index]) {
      displayedLiunians.value = props.dayuns[index].liunians;
    }
    liunianLoading.value = false;
  }, 500); // 增加延迟以便观察骨架屏
}

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
  const ganColor = hexToRgba(ganHex, 0.2);
  const zhiColor = hexToRgba(zhiHex, 0.2);
  return {
    background: `linear-gradient(to bottom right, ${ganColor}, ${zhiColor})`,
    color: "#333",
  };
}

// 初始化加载
function initialize() {
  if (props.dayuns && props.dayuns.length > 0) {
    const currentAge = currentYear - props.birthYear;
    const currentDayunIndex = props.dayuns.findIndex(
      (d) => currentAge >= d.startAge && currentAge <= d.endAge
    );
    const initialIndex = currentDayunIndex !== -1 ? currentDayunIndex : 0;

    activeIndex.value = initialIndex;
    const initialDayun = props.dayuns[initialIndex];
    if (initialDayun) {
      displayedLiunians.value = initialDayun.liunians;
    }

    scrollActiveTabToCenter();
  }
}

// --- Lifecycle & Watchers ---
onMounted(() => {
  initialize();
});

watch(
  () => props.dayuns,
  () => {
    initialize();
  },
  { immediate: true }
);
</script>

<style scoped>
/* 优化滚动条样式 */
.dayun-tabs {
  scroll-behavior: smooth;
}
.dayun-tabs::-webkit-scrollbar {
  height: 4px;
}
.dayun-tabs::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
