import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // 在中间件中，尤其是在 setup 环境外，可以直接使用 useAuthStore()
  const authStore = useAuthStore();

  // 定义白名单，这些路由不需要登录即可访问
  const publicRoutes = ["/", "/result"];
  // 定义需要登录才能访问的页面
  const protectedRoutes = ["/profile", "/profile/history"];
  // 定义登录后不应访问的页面
  const publicOnlyRoutes = ["/auth/login", "/auth/register"];

  // 1. 如果是白名单路由，直接放行
  if (publicRoutes.includes(to.path)) {
    return;
  }

  // **关键逻辑：应用初始化检查**
  // 在客户端，如果 authStore 认为已登录 (有 token)，但 store 中还没有 user 对象，
  // 就需要调用 fetchUser() 来加载用户信息。
  // 这样可以确保刷新页面或从其他页面进入时，用户信息能被正确加载。
  if (process.client && authStore.isLoggedIn && !authStore.user) {
    await authStore.fetchUser();
  }

  const isLoggedIn = authStore.isLoggedIn;
  const requiresAuth = protectedRoutes.some((route) =>
    to.path.startsWith(route)
  );

  // 2. 如果目标路由需要认证，但用户未登录 -> 重定向到登录页
  if (requiresAuth && !isLoggedIn) {
    // 保存用户想访问的页面，以便登录后重定向回去
    return navigateTo(`/auth/login?redirect=${to.fullPath}`, { replace: true });
  }

  // 3. 如果用户已登录，但尝试访问登录/注册页 -> 重定向到个人中心
  if (isLoggedIn && publicOnlyRoutes.includes(to.path)) {
    return navigateTo("/profile", { replace: true });
  }

  // 其他情况，允许导航
});
