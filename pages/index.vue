<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold text-center mb-6">八字排盘</h1>

    <van-form @submit="onSubmit">
      <!-- 历法选择 -->
      <van-field name="calendarType" label="历法">
        <template #input>
          <van-radio-group
            v-model="userStore.form.calendarType"
            direction="horizontal"
          >
            <van-radio name="solar">公历</van-radio>
            <van-radio name="lunar">农历</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <!-- 年份输入 -->
      <van-field
        v-model.number="userStore.form.year"
        name="year"
        label="年份"
        placeholder="请输入出生年份"
        type="number"
        :rules="[{ required: true, message: '请填写年份' }]"
      />
      <!-- 月份输入 -->
      <van-field
        v-model.number="userStore.form.month"
        name="month"
        label="月份"
        placeholder="请输入出生月份"
        type="number"
        :rules="[{ required: true, message: '请填写月份' }]"
      />
      <!-- 日期输入 -->
      <van-field
        v-model.number="userStore.form.day"
        name="day"
        label="日期"
        placeholder="请输入出生日期"
        type="number"
        :rules="[{ required: true, message: '请填写日期' }]"
      />
      <!-- 时辰输入 -->
      <van-field
        v-model="userStore.form.hour"
        name="hour"
        label="时辰"
        placeholder="请输入出生时辰 (0-23)，未知可不填"
        type="number"
      />

      <!-- 性别选择 -->
      <van-field name="gender" label="性别">
        <template #input>
          <van-radio-group
            v-model="userStore.form.gender"
            direction="horizontal"
          >
            <van-radio name="男">男</van-radio>
            <van-radio name="女">女</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <!-- 错误提示 -->
      <div v-if="userStore.error" class="text-red-500 text-sm my-2 text-center">
        {{ userStore.error }}
      </div>

      <!-- 提交按钮 -->
      <div class="mt-6">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="userStore.loading"
          loading-text="正在排盘..."
        >
          立即排盘
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "~/stores/user";

// 获取用户 store
const userStore = useUserStore();

// 提交表单事件
const onSubmit = async () => {
  console.log("Form submitted!"); // 添加日志
  const result = await userStore.submitPaiPan();
  if (result && result.id) {
    // 使用 Nuxt 3 推荐的 navigateTo 方法进行路由跳转
    await navigateTo(`/result?id=${result.id}`);
  }
  // 如果 result 为空或没有 id，错误状态应已在 store 中设置，UI 会显示错误信息
};
</script>
