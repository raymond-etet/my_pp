import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // 在中间件中，尤其是在 setup 环境外，可以直接使用 useAuthStore()
  const authStore = useAuthStore();

  // 定义需要登录才能访问的页面
  const protectedRoutes = ["/profile", "/profile/history"];
  // 定义登录后不应访问的页面
  const publicOnlyRoutes = ["/auth/login", "/auth/register"];

  // **关键逻辑：应用初始化检查**
  // 如果 Pinia 中没有用户信息，但 Cookie 中有 token，
  // 说明用户可能刷新了页面，需要尝试恢复登录状态。
  // `fetchUser` 内部会处理 token 无效的情况。
  // `!process.server` 确保此逻辑只在客户端执行，避免 SSR 时重复调用
  if (!process.server && !authStore.isLoggedIn && authStore.token) {
    await authStore.fetchUser();
  }

  const isLoggedIn = authStore.isLoggedIn;
  const requiresAuth = protectedRoutes.some((route) =>
    to.path.startsWith(route)
  );

  // 1. 如果目标路由需要认证，但用户未登录 -> 重定向到登录页
  if (requiresAuth && !isLoggedIn) {
    // 保存用户想访问的页面，以便登录后重定向回去
    return navigateTo(`/auth/login?redirect=${to.fullPath}`, { replace: true });
  }

  // 2. 如果用户已登录，但尝试访问登录/注册页 -> 重定向到个人中心
  if (isLoggedIn && publicOnlyRoutes.includes(to.path)) {
    return navigateTo("/profile", { replace: true });
  }

  // 其他情况，允许导航
});
