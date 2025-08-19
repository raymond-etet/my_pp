<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold text-center mb-6">注册</h1>

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
          placeholder="请输入至少6位密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />

        <!-- 确认密码输入框 -->
        <van-field
          v-model="confirmPassword"
          type="password"
          name="confirmPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[
            { validator: passwordValidator, message: '两次输入的密码不一致' },
          ]"
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
          注 册
        </van-button>
      </div>
    </van-form>

    <div class="text-center text-sm text-gray-500">
      已有账户？
      <NuxtLink to="/auth/login" class="text-primary hover:underline">
        立即登录
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
const confirmPassword = ref("");

// 自定义密码验证器
const passwordValidator = (val: string) => {
  if (val !== password.value) {
    // Vant 4.x 验证器返回错误信息字符串代表验证失败
    return "两次输入的密码不一致";
  }
  return true; // 返回 true 代表验证通过
};

// 表单提交处理
const onSubmit = async () => {
  if (authStore.loading) return;

  await authStore.register(password.value, username.value);

  if (authStore.error) {
    showToast({
      message: authStore.error,
      type: "fail",
      position: "top",
    });
  } else {
    showToast({
      message: "注册成功，已自动登录",
      type: "success",
      position: "top",
    });
    // action 内部已处理路由跳转到个人中心页
  }
};

// 设置页面标题
useHead({
  title: "注册",
});
</script>

<style scoped>
.text-primary {
  color: #1989fa;
}
</style>
