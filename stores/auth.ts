import { defineStore } from "pinia";

// 定义用户信息的接口
interface User {
  id: number;
  username: string;
}

export const useAuthStore = defineStore("auth", () => {
  // --- state ---

  // 使用 useCookie 来持久化存储 token
  // maxAge 表示 cookie 的有效期，单位是秒 (7 天)
  const token = useCookie<string | null>("auth_token", {
    maxAge: 60 * 60 * 24 * 7,
  });

  // 用户信息
  const user = ref<User | null>(null);

  // loading 状态
  const loading = ref(false);

  // 错误信息
  const error = ref<string | null>(null);

  // --- getters ---

  // 用户是否已登录
  const isLoggedIn = computed(() => !!token.value && !!user.value);

  // --- actions ---

  // 登录
  async function login(password: string, username: string) {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch("/api/auth/login", {
        method: "POST",
        body: { username, password },
      });

      // 假设接口返回 { token: '...', user: { ... } }
      // @ts-ignore
      token.value = response.token;
      // @ts-ignore
      user.value = response.user;

      // 登录成功后可以重定向到个人中心
      const router = useRouter();
      router.push("/profile");
    } catch (e: any) {
      error.value = e.data?.message || "登录失败";
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  // 注册
  async function register(password: string, username: string) {
    loading.value = true;
    error.value = null;
    try {
      await $fetch("/api/auth/register", {
        method: "POST",
        body: { username, password },
      });

      // 注册成功后，可以提示用户去登录，或者直接调用登录 action
      // 这里我们选择提示用户，并跳转到登录页
      const router = useRouter();
      router.push("/auth/login");
      //
      //
      //
      //... 在登录页面可以用 Toast 等组件显示 "注册成功，请登录"
    } catch (e: any) {
      error.value = e.data?.message || "注册失败";
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  // 获取当前用户信息 (用于应用初始化时验证 token)
  async function fetchUser() {
    if (!token.value) return;

    loading.value = true;
    try {
      const response = await $fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      // @ts-ignore
      user.value = response.user;
    } catch (e) {
      // 如果 token 无效或过期，清除本地 token 和 user
      token.value = null;
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  // 退出登录
  function logout() {
    token.value = null;
    user.value = null;
    const router = useRouter();
    router.push("/auth/login");
  }

  return {
    token,
    user,
    loading,
    error,
    isLoggedIn,
    login,
    register,
    fetchUser,
    logout,
  };
});
