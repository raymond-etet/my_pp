<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold text-center mb-6">登录</h1>

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <!-- 用户名输入框 -->
        <van-field
          v-model="username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />

        <!-- 密码输入框 -->
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>

      <div class="m-4">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="authStore.loading"
        >
          登 录
        </van-button>
      </div>
    </van-form>

    <div class="text-center text-sm text-gray-500">
      还没有账户？
      <NuxtLink to="/auth/register" class="text-primary hover:underline">
        立即注册
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { showToast } from "vant";
import "vant/es/toast/style";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();

// 定义表单数据
const username = ref("");
const password = ref("");

// 表单提交处理
const onSubmit = async () => {
  // 防止在加载时重复提交
  if (authStore.loading) return;

  // 调用 store 中的 login action
  await authStore.login(password.value, username.value);

  // 根据结果显示提示
  if (authStore.error) {
    showToast({
      message: authStore.error,
      type: "fail",
      position: "top",
    });
  } else {
    // 登录成功 action 内部已处理路由跳转，这里可以只显示成功提示
    showToast({
      message: "登录成功",
      type: "success",
      position: "top",
    });
  }
};

// 设置页面标题
useHead({
  title: "登录",
});
</script>

<style scoped>
/* 可以在这里添加一些额外的样式 */
.text-primary {
  color: #1989fa;
}
</style>
