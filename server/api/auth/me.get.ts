export default defineEventHandler((event) => {
  // 我们的 auth 中间件会验证 token 并将用户信息附加到 event.context.user
  const user = event.context.user;

  // 如果中间件没有找到或验证失败一个用户，event.context.user 将是 undefined
  if (!user) {
    throw createError({
      statusCode: 401, // Unauthorized
      statusMessage: "用户未认证或 Token 无效",
    });
  }

  // 返回用户信息
  return {
    user: {
      id: user.userId,
      username: user.username,
    },
  };
});
