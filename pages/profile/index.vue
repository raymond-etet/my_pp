<template>
  <div class="p-4" v-if="authStore.isLoggedIn && authStore.user">
    <!-- 用户信息 -->
    <div class="flex items-center mb-8">
      <van-image
        round
        width="64"
        height="64"
        src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
      />
      <div class="ml-4">
        <div class="font-bold text-lg">{{ authStore.user.username }}</div>
        <div class="text-sm text-gray-500">欢迎回来！</div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <van-cell-group inset>
      <van-cell
        title="我的排盘记录"
        is-link
        to="/profile/history"
        icon="orders-o"
      />
      <van-cell title="设置" is-link icon="setting-o" />
    </van-cell-group>

    <!-- 退出登录 -->
    <div class="mt-8 px-4">
      <van-button type="danger" block round @click="handleLogout">
        退出登录
      </van-button>
    </div>
  </div>
  <!-- 未登录时的骨架屏或提示 -->
  <div v-else class="p-4">
    <van-skeleton title avatar :row="3" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { showConfirmDialog } from "vant";
import "vant/es/dialog/style";

const authStore = useAuthStore();

// 设置页面标题
useHead({
  title: "个人中心",
});

// 退出登录处理
const handleLogout = () => {
  showConfirmDialog({
    title: "确认退出",
    message: "您确定要退出登录吗？",
  })
    .then(() => {
      // on confirm
      authStore.logout();
    })
    .catch(() => {
      // on cancel
    });
};
</script>
