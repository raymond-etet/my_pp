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
      <van-cell-group inset class="m-2">
        <van-cell
          v-for="item in history"
          :key="item.id"
          :title="formatTitle(item)"
          :label="formatDate(item.createdAt)"
          is-link
          @click="viewRecord(item.id)"
        />
      </van-cell-group>
      <van-empty
        v-if="!history || history.length === 0"
        description="暂无历史记录"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

useHead({
  title: "排盘记录",
});

// 使用 useAsyncData 从后端获取数据
// a. key: 唯一标识
// b. handler: 异步函数，用于获取数据
// c. options: { lazy: true } 表示数据将在客户端获取，页面可以先展示骨架屏
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
  const hourText = item.hour !== null ? `${item.hour}时` : "";
  return `${item.year}年${item.month}月${item.day}日 ${hourText} (${item.gender})`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const viewRecord = (id: number) => {
  router.push(`/result?id=${id}`);
};
</script>
