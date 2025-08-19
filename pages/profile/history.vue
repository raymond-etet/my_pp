<template>
  <div>
    <van-nav-bar
      title="排盘记录"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />

    <div v-if="pending" class="p-4">
      <van-skeleton title :row="5" />
    </div>

    <div v-else-if="error" class="p-4 text-center">
      <van-empty description="加载失败，请重试" />
    </div>

    <div v-else>
      <div class="p-2">
        <div
          v-for="item in history"
          :key="item.id"
          class="history-card bg-white rounded-lg shadow-md mb-4 overflow-hidden"
        >
          <!-- 基本信息 -->
          <div class="p-4 border-b border-gray-100">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-bold text-lg text-gray-800">
                  {{ formatTitle(item) }}
                </h3>
                <p class="text-sm text-gray-500 mt-1">
                  {{ formatDate(item.createdAt) }}
                </p>
              </div>
              <van-button
                type="primary"
                size="small"
                @click="viewRecord(item.id)"
              >
                查看详情
              </van-button>
            </div>
          </div>

          <!-- 四柱展示 -->
          <div
            v-if="item.result && (item.result as any).bazi"
            class="p-4 bg-gray-50"
          >
            <h4 class="text-sm font-semibold text-gray-600 mb-3">四柱八字</h4>
            <div class="grid grid-cols-4 gap-2">
              <div class="text-center">
                <div class="text-xs text-gray-500 mb-1">年柱</div>
                <div class="pillar-compact">
                  <div class="ganzhi text-lg font-serif">
                    <span
                      :style="
                        getWuxingColorStyle((item.result as any).bazi.year.wuxing.gan)
                      "
                    >
                      {{ (item.result as any).bazi.year.gan }}
                    </span>
                    <span
                      :style="
                        getWuxingColorStyle((item.result as any).bazi.year.wuxing.zhi)
                      "
                    >
                      {{ (item.result as any).bazi.year.zhi }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="text-center">
                <div class="text-xs text-gray-500 mb-1">月柱</div>
                <div class="pillar-compact">
                  <div class="ganzhi text-lg font-serif">
                    <span
                      :style="
                        getWuxingColorStyle((item.result as any).bazi.month.wuxing.gan)
                      "
                    >
                      {{ (item.result as any).bazi.month.gan }}
                    </span>
                    <span
                      :style="
                        getWuxingColorStyle((item.result as any).bazi.month.wuxing.zhi)
                      "
                    >
                      {{ (item.result as any).bazi.month.zhi }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="text-center">
                <div class="text-xs text-gray-500 mb-1">日柱</div>
                <div class="pillar-compact">
                  <div class="ganzhi text-lg font-serif">
                    <span
                      :style="dayMasterStyle((item.result as any).bazi.day.wuxing.gan)"
                    >
                      {{ (item.result as any).bazi.day.gan }}
                    </span>
                    <span
                      :style="
                        getWuxingColorStyle((item.result as any).bazi.day.wuxing.zhi)
                      "
                    >
                      {{ (item.result as any).bazi.day.zhi }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="text-center">
                <div class="text-xs text-gray-500 mb-1">时柱</div>
                <div class="pillar-compact">
                  <div
                    v-if="(item.result as any).bazi.hour"
                    class="ganzhi text-lg font-serif"
                  >
                    <span
                      :style="
                        getWuxingColorStyle((item.result as any).bazi.hour.wuxing.gan)
                      "
                    >
                      {{ (item.result as any).bazi.hour.gan }}
                    </span>
                    <span
                      :style="
                        getWuxingColorStyle((item.result as any).bazi.hour.wuxing.zhi)
                      "
                    >
                      {{ (item.result as any).bazi.hour.zhi }}
                    </span>
                  </div>
                  <div v-else class="text-sm text-gray-400">未知</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <van-empty
        v-if="!history || history.length === 0"
        description="暂无历史记录"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { getWuxingColorStyle, getWuxingHexColor } from "@/utils/color";

const router = useRouter();
const authStore = useAuthStore();

useHead({
  title: "排盘记录",
});

// 使用 useAsyncData 从后端获取数据
const {
  data: history,
  pending,
  error,
  refresh,
} = await useAsyncData(
  "history",
  () => {
    // 必须携带 token
    if (!authStore.token) {
      return Promise.resolve([]);
    }
    return $fetch("/api/pai-pan/history", {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
  },
  { lazy: true }
);

const onClickLeft = () => router.back();

const formatTitle = (item: any) => {
  const hourText =
    item.hour !== null && item.hour !== -1 ? `${item.hour}时` : "时辰未知";
  return `${item.year}年${item.month}月${item.day}日 ${hourText} (${item.gender})`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const viewRecord = (id: number) => {
  router.push(`/result?id=${id}`);
};

// 日主特殊样式（加粗显示）
const dayMasterStyle = (wuxing: string) => {
  const baseStyle = getWuxingColorStyle(wuxing);
  return {
    ...baseStyle,
    fontWeight: "bold",
    textShadow: "0 0 2px rgba(0,0,0,0.3)",
  };
};
</script>

<style scoped>
.history-card {
  transition: all 0.2s ease;
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.pillar-compact {
  padding: 8px;
  border-radius: 6px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ganzhi {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.ganzhi span {
  display: block;
  font-weight: 600;
  line-height: 1;
}
</style>
