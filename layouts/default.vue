<!--
 * @Description: 默认布局，包含底部导航栏
 * @Version: 2.0
 * @Author: 白雾茫茫丶
 * @Date: 2024-07-25 11:21:40
 * @LastEditors: 白雾茫茫丶
 * @LastEditTime: 2024-07-25 14:38:08
-->
<template>
  <div class="pb-16">
    <!-- 增加底部内边距，防止内容被 Tabbar 遮挡 -->
    <!-- 页面内容将在这里渲染 -->
    <slot />
    <!-- 底部导航栏 -->
    <van-tabbar v-if="showTabbar" route>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/profile" icon="user-o"
        >我的</van-tabbar-item
      >
    </van-tabbar>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// 定义需要显示底部导航栏的页面
const tabbarPages = ["/", "/profile"];

// 计算属性，判断当前页面是否需要显示底部导航栏
const showTabbar = computed(() => tabbarPages.includes(route.path));
</script>
