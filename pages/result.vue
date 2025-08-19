<template>
  <div class="p-2 md:p-4 bg-gray-100 min-h-screen font-sans">
    <!-- 标题和返回按钮 -->
    <header class="flex items-center justify-between p-2 mb-4">
      <button
        @click="goBack"
        class="px-3 py-1 bg-white rounded-full shadow-sm text-gray-700"
      >
        < 返回
      </button>
      <h1 class="text-xl md:text-2xl font-bold text-center text-gray-800">
        命盘分析
      </h1>
      <div class="w-12"></div>
      <!-- 占位 -->
    </header>

    <!-- Loading 状态 -->
    <div v-if="isLoading" class="text-center py-20">
      <div
        class="i-svg-spinners:12-dots-scale-rotate w-12 h-12 mx-auto text-blue-500"
      ></div>
      <p class="mt-2 text-gray-600">正在生成命盘...</p>
    </div>

    <!-- Error 状态 -->
    <div
      v-else-if="errorMsg"
      class="text-center py-20 bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto"
    >
      <div class="i-carbon:warning-alt text-5xl text-red-500 mx-auto"></div>
      <p class="text-red-600 font-semibold mt-4">出错了</p>
      <p class="text-gray-500 text-sm mt-1">{{ errorMsg }}</p>
      <button
        @click="goToHome"
        class="mt-6 px-6 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600"
      >
        返回首页
      </button>
    </div>

    <!-- 结果展示 -->
    <div v-else-if="result" class="space-y-4">
      <!-- 生辰信息 -->
      <!-- 生辰信息 -->
      <section class="bg-white rounded-lg shadow p-3">
        <h2 class="text-md font-semibold text-gray-700 mb-1">基本信息</h2>
        <div
          class="grid grid-cols-2 gap-x-4 text-xs text-gray-600 leading-tight"
        >
          <p>公历：{{ result.solarDate || "N/A" }}</p>
          <p>农历：{{ result.lunarDate || "N/A" }}</p>
          <p>性别：{{ result.form?.gender || form.gender }}</p>
          <p>
            记录ID：<span class="font-mono">{{ result.id }}</span>
          </p>
        </div>
      </section>

      <!-- 八字四柱 -->
      <section>
        <h2 class="text-lg font-semibold text-gray-700 mb-2 pl-2">四柱结构</h2>
        <div class="grid grid-cols-4 gap-2">
          <BaziPillar title="年柱" :pillar-data="result.bazi.year" />
          <BaziPillar title="月柱" :pillar-data="result.bazi.month" />
          <BaziPillar title="日柱" :pillar-data="result.bazi.day" />
          <BaziPillar title="时柱" :pillar-data="result.bazi.hour" />
        </div>
      </section>

      <!-- 大运和流年 -->
      <section>
        <h2 class="text-lg font-semibold text-gray-700 mb-2 pl-2">
          大运与流年
        </h2>
        <DaYunFlow
          :dayuns="result.dayun"
          :birthYear="result.form?.year || form.year"
        />
      </section>
    </div>

    <!-- 无数据状态 -->
    <!-- 无数据且无ID查询时，引导用户去首页 -->
    <div v-else class="text-center py-20">
      <p class="text-gray-500">没有排盘记录。</p>
      <van-button type="primary" class="mt-4" @click="goToHome">
        去排盘
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "~/stores/user";
import { useRoute, useRouter } from "#app";
import BaziPillar from "~/components/BaziPillar.vue";
import DaYunFlow from "~/components/DaYunFlow.vue";
import { storeToRefs } from "pinia";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 使用 storeToRefs 来保持响应性
const {
  result,
  loading: isLoading,
  error: errorMsg,
  form,
} = storeToRefs(userStore);

// 为了在模板中安全地访问 result.form.year
if (result.value && !result.value.form) {
  result.value.form = form.value;
}

// --- 生命周期 ---
onMounted(async () => {
  const id = route.query.id as string | undefined;

  // 场景1：从分享链接或历史记录进入，URL中带id
  if (id) {
    // 如果当前store的结果不是这个id的，或者store中没结果，则重新获取
    if (!result.value || result.value.id !== parseInt(id)) {
      await userStore.fetchPaiPanById(id);
    }
  }
  // 场景2：从底部导航“排盘结果”进入，URL中没有id
  // 此时result依赖Pinia的状态，如果Pinia中没有，则页面会显示“没有排盘记录”
});

// --- 方法 ---
function goToHome() {
  router.push("/");
}

function goBack() {
  // 如果历史记录里有来源，则返回；否则去首页
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}
</script>
