<template>
  <div class="p-4 bg-gray-50 min-h-screen">
    <h1 class="text-2xl font-bold text-center mb-6">排盘结果</h1>

    <!-- Loading 状态 -->
    <div v-if="isLoading" class="text-center py-10">
      <van-loading size="24px">正在加载...</van-loading>
    </div>

    <!-- Error 状态 -->
    <div v-else-if="errorMsg" class="text-center py-10">
      <p class="text-red-500">{{ errorMsg }}</p>
      <van-button type="primary" to="/" class="mt-4">返回首页</van-button>
    </div>

    <!-- 结果展示 -->
    <div v-else-if="result" class="space-y-4">
      <!-- 基本信息 -->
      <van-cell-group inset title="生辰信息">
        <van-cell title="生辰" :value="formatBirthday" />
        <van-cell title="记录ID" :value="result.id" />
      </van-cell-group>

      <!-- 八字四柱 -->
      <van-cell-group inset title="八字四柱">
        <van-cell title="年柱" :value="formatGanZhi(result.bazi.year)" />
        <van-cell title="月柱" :value="formatGanZhi(result.bazi.month)" />
        <van-cell title="日柱" :value="formatGanZhi(result.bazi.day)" />
        <van-cell title="时柱" :value="formatGanZhi(result.bazi.hour)" />
      </van-cell-group>

      <!-- 大运 -->
      <van-cell-group inset title="大运">
        <!-- 循环渲染大运 -->
        <van-cell
          v-for="(item, index) in result.dayun"
          :key="index"
          :title="`${item.age}岁起运`"
          :value="item.ganZhi"
        />
      </van-cell-group>

      <!-- 更多信息... 藏干、十神等可以类似地添加 -->

      <div class="mt-6">
        <van-button round block type="default" to="/">重新排盘</van-button>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="text-center py-10">
      <p>没有找到排盘结果。</p>
      <van-button type="primary" to="/" class="mt-4">去排盘</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "~/stores/user";
import { useRoute } from "vue-router";

// 获取 store 和 route
const userStore = useUserStore();
const route = useRoute();

// state
const isLoading = ref(false);
const errorMsg = ref<string | null>(null);

// 从 store 获取结果
const result = computed(() => userStore.result);
const birthdayInfo = computed(() => userStore.form);

// 格式化干支显示
const formatGanZhi = (gz: string | { gan: string; zhi: string }) => {
  if (!gz) return "未知";

  // 如果是字符串格式（新算法）
  if (typeof gz === "string") {
    return gz;
  }

  // 如果是对象格式（旧算法兼容）
  if (typeof gz === "object" && gz.gan) {
    return `${gz.gan}${gz.zhi}`;
  }

  return "未知";
};

// 格式化生日显示
const formatBirthday = computed(() => {
  if (!birthdayInfo.value.year) return "未知";
  return `${birthdayInfo.value.year}年${birthdayInfo.value.month}月${
    birthdayInfo.value.day
  }日 ${birthdayInfo.value.hour ?? "未知"}时`;
});

// 组件挂载时的逻辑
onMounted(async () => {
  const id = route.query.id;
  // 如果 store 中没有结果，但 URL 中有 id，则尝试从后端获取
  if (!userStore.result && id) {
    isLoading.value = true;
    errorMsg.value = null;
    try {
      // TODO: 实现 /api/pai-pan/history?id=... 接口
      const data = await $fetch(`/api/pai-pan/history?id=${id}`);
      // @ts-ignore
      userStore.result = data;
      // 同时更新表单信息以供显示
      // @ts-ignore
      userStore.form.year = data.year;
      // @ts-ignore
      userStore.form.month = data.month;
      // @ts-ignore
      userStore.form.day = data.day;
      // @ts-ignore
      userStore.form.hour = data.hour;
    } catch (e: any) {
      errorMsg.value = e.data?.statusMessage || "查询历史记录失败。";
    } finally {
      isLoading.value = false;
    }
  }
});
</script>
